// controllers/adminController.js
const PedidoAdmin = require('../models/PedidoAdmin'); // Модель Pedido
const Usuario = require('../models/Usuario'); // Модель Usuario
const bcrypt = require('bcrypt');
const db = require('../config/db');
const path = require('path');

exports.getDashboard = (req, res) => {
  console.log('getDashboard llamado, usuario en sesión:', req.session.user);
  res.render('admin/dashboard', { user: req.session.user });
};

exports.getPerfil = (req, res) => {
  console.log('getPerfil llamado, usuario en sesión:', req.session.user);
  res.render('admin/perfil', { user: req.session.user });
};

exports.listAllPedidos = async (req, res) => {
  try {
    const pedidos = await PedidoAdmin.getAll();

    for (let pedido of pedidos) {
      const [detalles] = await db.execute(
        `SELECT producto_nombre, cantidad, precio_unitario AS precio, (cantidad * precio_unitario) AS subtotal
         FROM pedido_detalles
         WHERE pedido_id = ?`,
        [pedido.id]
      );
      pedido.detalles = detalles;

      // Считаем total
      pedido.total = detalles.reduce((sum, det) => sum + parseFloat(det.subtotal), 0);
    }

    res.render('admin/pedidos', { pedidos, user: req.session.user });
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).send('Error al obtener pedidos');
  }
};

exports.getPedidoById = async (req, res) => {
  try {
    const pedidoId = req.params.id;
    console.log("🔎 Cargando pedido con ID:", pedidoId);

    // Получаем заказ
    let pedidoResult = await PedidoAdmin.getById(pedidoId);

    // Проверяем, возвращается ли массив (например, из MySQL)
    const pedido = Array.isArray(pedidoResult) ? pedidoResult[0] : pedidoResult;

    if (!pedido) {
      console.log("⚠ Pedido no encontrado:", pedidoId);
      return res.status(404).send("Pedido no encontrado");
    }

    console.log("✅ Pedido encontrado:", pedido);

    // Получаем детали заказа
    const [detalles] = await db.execute(
      `SELECT producto_nombre, cantidad, precio_unitario AS precio, 
              (cantidad * precio_unitario) AS subtotal
       FROM pedido_detalles
       WHERE pedido_id = ?`,
      [pedidoId]
    );

    pedido.detalles = detalles || [];
    pedido.total = detalles
      ? detalles.reduce((sum, det) => sum + parseFloat(det.subtotal || 0), 0)
      : 0;

    console.log("📦 Pedido con detalles y total calculado:", pedido);

    res.render("admin/pedido_detalle", { pedido });
  } catch (err) {
    console.error("❌ Error en getPedidoById:", err);
    res.status(500).send("Error cargando pedido");
  }
};

exports.getPedidoDetallePage = async (req, res) => {
  const pedidoId = req.params.id;
  const pedido = await PedidoAdmin.getById(pedidoId);

  if (!pedido) return res.status(404).send("Pedido no encontrado");

  res.render("admin/pedido_detalle", { pedido });
};


exports.getPedidoDetalles = async (req, res) => {
  try {
    const { id } = req.params; // id заказа
    const [detalles] = await db.execute(
      `SELECT producto_nombre, cantidad, precio_unitario AS precio, subtotal
       FROM pedido_detalles
       WHERE pedido_id = ?`,
      [id]
    );

    res.json(detalles);
  } catch (err) {
    console.error('Error al obtener detalles del pedido:', err);
    res.status(500).json({ error: 'Error al obtener detalles' });
  }
};

// === ACTUALIZAR ESTADO DE PEDIDO ===
exports.updateEstadoPedido = async (req, res) => {
  try {
    console.log('updateEstadoPedido llamado, params:', req.params, 'body:', req.body);
    const { id } = req.params;
    const { estado } = req.body;

    const PedidoAdmin = require('../models/PedidoAdmin'); 
    await PedidoAdmin.updateEstado(id, estado);

    res.redirect('/admin/pedidos');
  } catch (err) {
    console.error('Error al actualizar estado del pedido:', err);
    res.status(500).send('Error al actualizar pedido');
  }
};

// === ACTUALIZAR "EN TRABAJO / FINALIZADO" ===
exports.updateTrabajo = async (req, res) => {
  try {
    console.log('updateTrabajo llamado, params:', req.params, 'body:', req.body);
    const { id } = req.params;
    const { trabajo } = req.body;

    const PedidoAdmin = require('../models/PedidoAdmin');
    await PedidoAdmin.updateTrabajo(id, trabajo);
    console.log('Trabajo actualizado correctamente para ID:', id);

    res.redirect('/admin/pedidos');
  } catch (err) {
    console.error('Error al actualizar trabajo del pedido:', err);
    res.status(500).send('Error al actualizar trabajo del pedido');
  }
};

// === ACTUALIZAR PERFIL DEL ADMIN ===
exports.updateProfile = async (req, res) => {
  try {
    console.log('--- updateProfile START ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    console.log('req.session.user:', req.session.user);

    const userId = req.session.user?.id;
    if (!userId) {
      console.log('No user in session!');
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const currentUser = req.session.user;

    let { nombre, apellidos, telefono, email, password } = req.body;
    let foto = req.file ? `/uploads/${req.file.filename}` : currentUser.foto;

    nombre = nombre?.trim() || currentUser.nombre;
    apellidos = apellidos?.trim() || currentUser.apellidos;
    telefono = telefono?.trim() || currentUser.telefono;
    email = email?.trim() || currentUser.email;
    password = password?.trim() || null;

    console.log('Datos recibidos de formulario:', { nombre, email, password, foto, telefono });

    if (password) {
      console.log('Updating password...');
      await Usuario.updatePassword(userId, password);
      console.log('Password actualizado correctamente');
    }

    const updates = {
      nombre,
      apellidos,
      telefono,
      email,
      foto
   };

    await Usuario.updateProfile(userId, updates);
    console.log('Updating profile in DB with:', updates);

    const updatedUser = await Usuario.findById(userId);
    console.log('Usuario actualizado obtenido de DB:', updatedUser);
    req.session.user = updatedUser;

    res.json({ success: true, message: 'Perfil actualizado', user: updatedUser, fotoPath: updatedUser.foto });
    console.log('Respuesta enviada al cliente con éxito');
  } catch (err) {
    console.error('Error al actualizar perfil:', err);
    res.status(500).json({ success: false, message: 'Error al actualizar el perfil' });
  }
};