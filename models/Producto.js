// models/Producto.js
const db = require('../config/db');

class Producto {
  static async getAllWithDetails(filters = {}) {
  let query = `
      SELECT 
        p.id, p.nombre, p.marca, p.precio, p.costo, p.stock, p.stock_minimo, p.medida, p.observaciones,
        GROUP_CONCAT(DISTINCT c.nombre) AS categoria_nombre,
        GROUP_CONCAT(DISTINCT pr.nombre) AS proveedor_nombre,
        l.nombre AS localizacion_nombre,
        l.id AS localizacion_id
      FROM productos p
      LEFT JOIN productos_categorias pc ON p.id = pc.producto_id
      LEFT JOIN categorias c ON pc.categoria_id = c.id
      LEFT JOIN productos_proveedores pp ON p.id = pp.producto_id
      LEFT JOIN proveedores pr ON pp.proveedor_id = pr.id
      LEFT JOIN localizaciones l ON p.localizacion_id = l.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.nombre) {
      query += ' AND p.nombre LIKE ?';
      params.push(`%${filters.nombre}%`);
    }
    if (filters.marca) {
      query += ' AND p.marca LIKE ?';
      params.push(`%${filters.marca}%`);
    }
    if (filters.categoria) {
      query += ' AND c.nombre LIKE ?';
      params.push(`%${filters.categoria}%`);
    }
    if (filters.proveedor) {
      query += ' AND pr.nombre LIKE ?';
      params.push(`%${filters.proveedor}%`);
    }
    if (filters.localizacion) {
      query += ' AND l.nombre LIKE ?';
      params.push(`%${filters.localizacion}%`);
    }
    if (filters.precioMax) {
      query += ' AND p.precio <= ?';
      params.push(filters.precioMax);
    }
    if (filters.costoMax) {
      query += ' AND p.costo <= ?';
      params.push(filters.costoMax);
    }
    if (filters.stockMin) {
      query += ' AND p.stock >= ?';
      params.push(filters.stockMin);
    }

    query += ' GROUP BY p.id ORDER BY p.id ASC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const sql = `
      SELECT 
        p.id, p.nombre, p.marca, p.precio, p.costo, p.medida,
        p.stock, p.stock_minimo, p.observaciones,
        GROUP_CONCAT(DISTINCT c.nombre) AS categoria_nombre,
        GROUP_CONCAT(DISTINCT pr.nombre) AS proveedor_nombre,
        l.nombre AS localizacion_nombre,
        l.id AS localizacion_id
      FROM productos p
      LEFT JOIN productos_categorias pc ON p.id = pc.producto_id
      LEFT JOIN categorias c ON pc.categoria_id = c.id
      LEFT JOIN productos_proveedores pp ON p.id = pp.producto_id
      LEFT JOIN proveedores pr ON pp.proveedor_id = pr.id
      LEFT JOIN localizaciones l ON p.localizacion_id = l.id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    const [rows] = await db.execute(sql, [id]);
    return rows[0] || null;
  }

  // CRUD только для админа
  static async add(producto) {
    const { nombre, marca, precio, costo, stock, stock_minimo, medida, observaciones, localizacion_id, categoria_ids, proveedor_ids } = producto;

    const sql = `
    INSERT INTO productos
        (nombre, marca, precio, costo, stock, stock_minimo, medida, observaciones, localizacion_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [nombre, marca, precio, costo, stock, stock_minimo, medida, observaciones, localizacion_id];
    const [result] = await db.query(sql, params);
    console.log(`Producto agregado con ID ${result.insertId}`);
    const productoId = result.insertId;

    if (categoria_ids?.length) {
      const values = categoria_ids.map(catId => [productoId, catId]);
      await db.query('INSERT INTO productos_categorias (producto_id, categoria_id) VALUES ?', [values]);
    }

    if (proveedor_ids?.length) {
      const values = proveedor_ids.map(prId => [productoId, prId]);
      await db.query('INSERT INTO productos_proveedores (producto_id, proveedor_id) VALUES ?', [values]);
    }

    console.log(`Producto agregado con ID ${productoId}`);
    return productoId;
  }

  static async update(id, producto) {
    const { nombre, marca, precio, costo, stock, stock_minimo, medida, observaciones, localizacion_id, categoria_ids, proveedor_ids } = producto;

    console.log('=== UPDATE PRODUCTO ===');
    console.log('ID:', id);
    console.log('Datos recibidos:', producto);

    const sql = `
      UPDATE productos
      SET nombre=?, marca=?, precio=?, costo=?, stock=?, stock_minimo=?, medida=?, observaciones=?, localizacion_id=?
      WHERE id=?
    `;
    const params = [nombre, marca, precio, costo, stock, stock_minimo, medida, observaciones, localizacion_id, id];
    await db.query(sql, params);
    console.log(`Producto con ID ${id} actualizado`);

    // --- Умное обновление категорий ---
    if (Array.isArray(categoria_ids)) {
      const [existing] = await db.query('SELECT categoria_id FROM productos_categorias WHERE producto_id=?', [id]);
      const existingIds = existing.map(r => r.categoria_id);
      console.log('Categorias actuales:', existingIds);

      const toAdd = categoria_ids.filter(catId => !existingIds.includes(catId));
      const toRemove = existingIds.filter(catId => !categoria_ids.includes(catId));
      console.log('Categorias a añadir:', toAdd, 'Categorias a eliminar:', toRemove);

      if (toAdd.length) {
        const values = toAdd.map(catId => [id, catId]);
        await db.query('INSERT INTO productos_categorias (producto_id, categoria_id) VALUES ?', [values]);
        console.log('Categorias añadidas:', toAdd);
      }
      if (toRemove.length) {
        await db.query('DELETE FROM productos_categorias WHERE producto_id=? AND categoria_id IN (?)', [id, toRemove]);
        console.log('Categorias eliminadas:', toRemove);
      }
    }

    // --- Умное обновление поставщиков ---
    if (Array.isArray(proveedor_ids)) {
      const [existing] = await db.query('SELECT proveedor_id FROM productos_proveedores WHERE producto_id=?', [id]);
      const existingIds = existing.map(r => r.proveedor_id);
      console.log('Proveedores actuales:', existingIds);

      const toAdd = proveedor_ids.filter(prId => !existingIds.includes(prId));
      const toRemove = existingIds.filter(prId => !proveedor_ids.includes(prId));
      console.log('Proveedores a añadir:', toAdd, 'Proveedores a eliminar:', toRemove);

      if (toAdd.length) {
        const values = toAdd.map(prId => [id, prId]);
        await db.query('INSERT INTO productos_proveedores (producto_id, proveedor_id) VALUES ?', [values]);
        console.log('Proveedores añadidos:', toAdd);
      }
      if (toRemove.length) {
        await db.query('DELETE FROM productos_proveedores WHERE producto_id=? AND proveedor_id IN (?)', [id, toRemove]);
        console.log('Proveedores eliminados:', toRemove);
      }
    }
    console.log('=== FIN UPDATE PRODUCTO ===');
  }

  // Обновление отдельного поля (для AJAX)
  static async updateField(id, field, value) {
    console.log('=== UPDATE FIELD ===');
    console.log('ID:', id, 'Campo:', field, 'Valor:', value);

    const allowedFields = [
      'nombre', 'marca', 'precio', 'costo', 'stock', 'categoria_id', 'proveedor_id',
      'stock_minimo', 'medida', 'observaciones', 'localizacion_id'
    ];

    if (!allowedFields.includes(field)) {
      console.error('Campo no permitido:', field);
      throw new Error('Campo no permitido');
    }

    const sql = `UPDATE productos SET ${field}=? WHERE id=?`;
    await db.query(sql, [value, id]);
    console.log(`Producto ID ${id} actualizado: ${field} = ${value}`);
    console.log('=== FIN UPDATE FIELD ===');
  }

  static async delete(id) {
    // const sql = 'DELETE FROM productos WHERE id=?';

    await db.query('DELETE FROM productos_categorias WHERE producto_id=?', [id]);
    await db.query('DELETE FROM productos_proveedores WHERE producto_id=?', [id]);
    await db.query('DELETE FROM productos WHERE id=?', [id]);
    console.log(`Producto con ID ${id} eliminado`);
  }
}

module.exports = Producto;