// models/Producto.js
const db = require('../config/db');

class Producto {
  static async getAllWithDetails() {
    const sql = `
      SELECT p.id, p.nombre, p.marca, p.precio, p.costo, p.stock,
             c.nombre AS categoria_nombre,
             pr.nombre AS proveedor_nombre
      FROM productos p
      LEFT JOIN productos_categorias pc ON p.id = pc.producto_id
      LEFT JOIN categorias c ON pc.categoria_id = c.id
      LEFT JOIN productos_proveedores pp ON p.id = pp.producto_id
      LEFT JOIN proveedores pr ON pp.proveedor_id = pr.id
    `;
    const [rows] = await db.query(sql);
    console.log('Se obtuvieron todos los productos');
    return rows;
  }

  // CRUD только для админа
  static async add(producto) {
    const sql = `
      INSERT INTO productos (nombre, marca, precio, costo, stock)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      producto.nombre,
      producto.marca,
      producto.precio,
      producto.costo,
      producto.stock
    ];
    const [result] = await db.query(sql, params);
    console.log(`Producto agregado con ID ${result.insertId}`);
    return result.insertId;
  }

  static async update(id, producto) {
    const sql = `
      UPDATE productos
      SET nombre=?, marca=?, precio=?, costo=?, stock=?
      WHERE id=?
    `;
    const params = [
      producto.nombre,
      producto.marca,
      producto.precio,
      producto.costo,
      producto.stock,
      id
    ];
    await db.query(sql, params);
    console.log(`Producto con ID ${id} actualizado`);
  }

  static async delete(id) {
    const sql = 'DELETE FROM productos WHERE id=?';
    await db.query(sql, [id]);
    console.log(`Producto con ID ${id} eliminado`);
  }
}

module.exports = Producto;
