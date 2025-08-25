// models/Proveedor.js
const db = require('../config/db');

class Proveedor {
  static async getAllWithDetails() {
    const sql = `
      SELECT id, nombre, contacto, telefono, email
      FROM proveedores
    `;
    const [rows] = await db.query(sql);
    console.log('Se obtuvieron todos los proveedores');
    return rows;
  }

  static async add(proveedor) {
    const sql = 'INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES (?, ?, ?, ?)';
    const params = [
      proveedor.nombre,
      proveedor.contacto,
      proveedor.telefono,
      proveedor.email
    ];
    const [result] = await db.query(sql, params);
    console.log(`Proveedor agregado con ID ${result.insertId}`);
    return result.insertId;
  }

  static async update(id, proveedor) {
    const sql = 'UPDATE proveedores SET nombre=?, contacto=?, telefono=?, email=? WHERE id=?';
    const params = [
      proveedor.nombre,
      proveedor.contacto,
      proveedor.telefono,
      proveedor.email,
      id
    ];
    await db.query(sql, params);
    console.log(`Proveedor con ID ${id} actualizado`);
  }

  static async delete(id) {
    const sql = 'DELETE FROM proveedores WHERE id=?';
    await db.query(sql, [id]);
    console.log(`Proveedor con ID ${id} eliminado`);
  }
}

module.exports = Proveedor;