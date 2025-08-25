// models/Usuario.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario {
  static async getAllWithDetails() {
    const sql = `
      SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono,
             r.nombre AS rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
    `;
    const [rows] = await db.query(sql);
    console.log('Se obtuvieron todos los usuarios');
    return rows;
  }

  static async add(usuario) {
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    const sql = `
      INSERT INTO usuarios (nombre, apellidos, email, telefono, rol_id, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      usuario.nombre,
      usuario.apellidos,
      usuario.email,
      usuario.telefono,
      usuario.rol_id,
      hashedPassword
    ];
    const [result] = await db.query(sql, params);
    console.log(`Usuario agregado con ID ${result.insertId}`);
    return result.insertId;
  }

  static async update(id, usuario) {
    const hashedPassword = usuario.password ? await bcrypt.hash(usuario.password, 10) : null;
    const sql = hashedPassword
      ? `UPDATE usuarios SET nombre=?, apellidos=?, email=?, telefono=?, rol_id=?, password=? WHERE id=?`
      : `UPDATE usuarios SET nombre=?, apellidos=?, email=?, telefono=?, rol_id=? WHERE id=?`;
    const params = hashedPassword
      ? [usuario.nombre, usuario.apellidos, usuario.email, usuario.telefono, usuario.rol_id, hashedPassword, id]
      : [usuario.nombre, usuario.apellidos, usuario.email, usuario.telefono, usuario.rol_id, id];
    await db.query(sql, params);
    console.log(`Usuario con ID ${id} actualizado`);
  }

  // static async update(id, producto) {
    // const sql = `
      // UPDATE productos
      // SET nombre=?, marca=?, precio=?, costo=?, stock=?
      // WHERE id=?
    // `;
    // const params = [
      // producto.nombre,
      // producto.marca,
      // producto.precio,
      // producto.costo,
      // producto.stock,
      // id
    // ];

  static async delete(id) {
    const sql = 'DELETE FROM usuarios WHERE id=?';
    await db.query(sql, [id]);
    console.log(`Usuario con ID ${id} eliminado`);
  }

// 🔑 Поиск пользователя по email
  static async findByEmail(email) {
    const sql = `SELECT * FROM usuarios WHERE email = ? LIMIT 1`;
    const [rows] = await db.query(sql, [email]);
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = Usuario;