// controllers/userController.js
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const PedidoDetalle = require('../models/PedidoDetalle');
const bcrypt = require('bcrypt');

exports.getDashboard = (req, res) => {
  console.log('getDashboard: вход в контроллер');
  res.render('user/dashboard', { user: req.session.user });
};

exports.createPedido = async (req, res) => {
  try {
    console.log('createPedido: вход в контроллер', req.body);
    const usuarioId = req.session.user.id;
    const { productoId, cantidad } = req.body;

    const producto = await Producto.findById(productoId);
    console.log('createPedido: найден продукт', producto);

    if (!producto) return res.status(404).send('Producto no encontrado');
    if (producto.stock < cantidad) return res.status(400).send('Cantidad mayor al stock disponible');

    let pedido = await Pedido.findPendienteByUser(usuarioId);
    console.log('createPedido: текущий pendiente pedido', pedido);

    if (!pedido) {
      pedido = await Pedido.create({ usuarioId, estado: 'pendiente', fecha: new Date()});
      console.log('createPedido: создан новый pedido', pedido);
    }

    await PedidoDetalle.create({
      pedido_id: pedido.id,
      usuario_id: usuarioId,
      producto_id: productoId,
      cantidad,
      estado: 'pendiente'
    });
    console.log('createPedido: добавлен detalle');

    req.app.locals.io.emit('pedidoNuevo', {
      id: pedido.id,
      estado: 'pendiente',
      fecha: new Date()
    });
    console.log('createPedido: emit pedidoNuevo');

    res.redirect('/user/pedidos');
  } catch (err) {
    console.error('createPedido: error', err);
    res.status(500).send('Error al crear pedido');
  }
};

exports.listPedidos = async (req, res) => {
  try {
    console.log('listPedidos: вход в контроллер');
    const usuarioId = req.session.user.id;
    const pedidos = await Pedido.findByUserId(usuarioId);
    console.log('listPedidos: найдено pedidos', pedidos.length);

    for (const pedido of pedidos) {
      const detalles = await PedidoDetalle.findByPedidoId(pedido.id);
      console.log(`listPedidos: detalles для pedido ${pedido.id}`, detalles.length);

      let total = 0;
      for (const det of detalles) {
        if (pedido.estado === 'pendiente') {
          const producto = await Producto.findById(det.producto_id);
          det.producto_nombre = producto ? producto.nombre : 'Producto eliminado';
          det.marca = producto ? producto.marca : '';
          det.precio = producto && producto.precio ? Number(producto.precio) : 0;
        } else {
          det.producto_nombre = det.producto_nombre || 'Sin nombre';
          det.marca = det.marca || '';
          det.precio = Number(det.precio_unitario || 0);
        }

        det.cantidad = det.cantidad !== undefined ? Number(det.cantidad) : 0;
        det.subtotal = det.precio * det.cantidad;
        total += det.subtotal;
        console.log(`listPedidos: detalle ${det.id} precio=${det.precio} cantidad=${det.cantidad} subtotal=${det.subtotal}`);
      }

      pedido.detalles = detalles;
      pedido.total = total;
      console.log(`listPedidos: pedido ${pedido.id} total ${total}`);
    }

    res.render('user/pedidos', { pedidos, user: req.session.user });
  } catch (err) {
    console.error('listPedidos: error', err);
    res.send('Error al obtener pedidos');
  }
};

exports.actualizarCantidadPedido = async (req, res) => {
  try {
    const usuarioId = req.session.user.id;
    const { detalleId, cantidad } = req.body;

    if (!detalleId || cantidad === undefined) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    const detalle = await PedidoDetalle.findById(detalleId);
    if (!detalle) return res.status(404).json({ error: 'Detalle no encontrado' });

    // Ищем конкретный заказ по ID
    const pedido = await Pedido.findById(detalle.pedido_id);
    if (!pedido || pedido.usuario_id != usuarioId) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedido.estado !== 'pendiente') {
      return res.status(400).json({ error: 'Pedido ya confirmado' });
    }

    const cantidadNum = parseInt(cantidad, 10);
    if (cantidadNum <= 0) return res.status(400).json({ error: 'Cantidad inválida' });

    // Обновляем количество в базе
    await PedidoDetalle.updateCantidad(detalleId, cantidadNum);

    // Получаем обновленные detalles
    const detalles = await PedidoDetalle.findByPedidoId(detalle.pedido_id);
    let total = 0;
    detalles.forEach(d => {
      let precio = pedido.estado === 'pendiente' ? Number(d.precio || 0) : Number(d.precio_copy || 0);
      d.subtotal = precio * Number(d.cantidad || 0);
      // d.subtotal = (Number(d.precio) || 0) * (Number(d.cantidad) || 0);
      total += d.subtotal;
    });

    res.json({ detalles, total });
  } catch (err) {
    console.error('actualizarCantidadPedido:', err);
    res.status(500).json({ error: 'Error al actualizar cantidad' });
  }
};

// === Confirmar pedido ===
exports.confirmarPedido = async (req, res) => {
  try {
    console.log('confirmarPedido: вход', req.body);
    const usuarioId = req.session.user.id;

    const pedido = await Pedido.findPendienteByUser(usuarioId);
    if (!pedido) return res.status(404).send('No hay pedido pendiente');
    console.warn('confirmarPedido: pedidoId отсутствует в теле запроса');

    for (const key in req.body) {
      if (key.startsWith('cantidad_')) {
        const [ , , detalleId ] = key.split('_');
        const cantidad = parseInt(req.body[key], 10);
        if (cantidad > 0) {
          await PedidoDetalle.updateCantidad(detalleId, cantidad);
        }
      }
    }

    // Фиксируем данные продуктов в PedidoDetalle
    const detalles = await PedidoDetalle.findByPedidoId(pedido.id);
    for (const det of detalles) {
      const producto = await Producto.findById(det.producto_id);
      if (producto) {
        await db.execute(
          `UPDATE pedido_detalles 
           SET nombre_copy = ?, marca_copy = ?, categoria_copy = ?, proveedor_copy = ?, precio_copy = ? 
           WHERE id = ?`,
          [
            producto.nombre,
            producto.marca,
            producto.categoria,
            producto.proveedor,
            producto.precio,
            det.id
          ]
        );
      }
    }

    await Pedido.updateEstado(pedido.id, 'confirmado');
    console.log(`confirmarPedido: pedido ${pedido.id} обновлен до confirmado`);

    req.app.locals.io.emit('pedidoNuevo', {
      id: pedido.id,
      usuarioId,
      estado: 'confirmado',
      fecha: new Date()
    });

    res.redirect('/user/pedidos');
  } catch (err) {
    console.error('confirmarPedido: ошибка', err);
    res.status(500).send('Error al confirmar pedido');
  }
};

exports.listProductos = async (req, res) => {
  try {
    console.log('listProductos: вход в контроллер', req.query);
    const filters = {
      nombre: req.query.nombre || null,
      marca: req.query.marca || null,
      categoria: req.query.categoria || null,
      proveedor: req.query.proveedor || null,
      precioMax: req.query.precio || null,
      costoMax: req.query.costo || null,
      stockMin: req.query.stockMin || null,
      localizacion: req.query.localizacion || null
    };
    console.log('listProductos: filters', filters);

    const productos = await Producto.getAllWithDetails(filters);
    console.log('listProductos: найдено productos', productos.length);

    res.render('user/productos', { productos, user: req.session.user, req });
  } catch (err) {
    console.error('listProductos: ошибка', err);
    res.send('Error al obtener productos');
  }
};  

exports.getPerfil = async (req, res) => {
  try {
    console.log('getPerfil: вход в контроллер');
    const user = await Usuario.findById(req.session.user.id);
    console.log('getPerfil: найден пользователь', user);
    res.render('user/perfil', { user });
  } catch (err) {
    console.error('getPerfil: ошибка', err);
    res.status(500).send('Error al cargar perfil');
  }
};

// === Subir foto de perfil ===
exports.uploadPhoto = async (req, res) => {
  try {
    console.log('uploadPhoto: вход в контроллер');
    if (!req.file) {
      return res.redirect('/user/perfil');
    }

    const photoPath = '/uploads/' + req.file.filename;

    await Usuario.updatePhoto(req.session.user.id, photoPath);
    const updatedUser = await Usuario.findById(req.session.user.id);
    req.session.user = updatedUser;
    console.log('uploadPhoto: фото обновлено');

    res.redirect('/user/perfil');
  } catch (err) {
    console.error('uploadPhoto: ошибка', err);
    res.status(500).send('Error al subir foto');
  }
};

// === Cambiar contraseña ===
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.session.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).send('Todos los campos son obligatorios');
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).send('La nueva contraseña no coincide');
    }

    const user = await Usuario.findById(userId);
    if (!user) return res.status(404).send('Usuario no encontrado');

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).send('Contraseña actual incorrecta');

    await Usuario.updatePassword(userId, newPassword); // внутри модели хэшируется

    const updatedUser = await Usuario.findById(userId);
    req.session.user = updatedUser;

    res.send('Contraseña cambiada correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cambiar contraseña');
  }
};

// === Actualizar perfil (nombre, apellidos, email, telefono) ===
exports.updateProfile = async (req, res) => {
  try {
    const { nombre, apellidos, email, telefono } = req.body;
    const userId = req.session.user.id;

    await Usuario.updateProfile(userId, { nombre, apellidos, email, telefono });

    const updatedUser = await Usuario.findById(userId);
    req.session.user = updatedUser;

    res.redirect('/user/perfil');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar perfil');
  }
};