// models/Usuario.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

class Usuario {
  // 📌 CRUD básicos
  static async getAllWithDetails() {
    const sql = `
      SELECT u.id, u.nombre, u.apellidos, u.email, u.telefono, u.foto,
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
      INSERT INTO usuarios (nombre, apellidos, email, telefono, rol_id, password, foto)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      usuario.nombre,
      usuario.apellidos,
      usuario.email,
      usuario.telefono,
      usuario.rol_id,
      hashedPassword,
      usuario.foto || null
    ];
    const [result] = await db.query(sql, params);
    console.log(`Usuario agregado con ID ${result.insertId}`);
    return result.insertId;
  }

  static async update(id, usuario) {
    const hashedPassword = usuario.password ? await bcrypt.hash(usuario.password, 10) : null;
    const sql = hashedPassword
      ? `UPDATE usuarios SET nombre=?, apellidos=?, email=?, telefono=?, rol_id=?, password=?, foto=? WHERE id=?`
      : `UPDATE usuarios SET nombre=?, apellidos=?, email=?, telefono=?, rol_id=?, foto=? WHERE id=?`;

    const params = hashedPassword
      ? [usuario.nombre, usuario.apellidos, usuario.email, usuario.telefono, usuario.rol_id, hashedPassword, usuario.foto || null, id]
      : [usuario.nombre, usuario.apellidos, usuario.email, usuario.telefono, usuario.rol_id, usuario.foto || null, id];
    await db.query(sql, params);
    console.log(`Usuario con ID ${id} actualizado`);
  }

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

// models/Usuario.js
  static async updatePassword(id, hashedPassword) {
    const sql = 'UPDATE usuarios SET password = ? WHERE id = ?';
    await db.query(sql, [hashedPassword, id]);
  }

  // Usuario по ID
  static async findById(id) {
    const sql = `SELECT * FROM usuarios WHERE id = ? LIMIT 1`;
    const [rows] = await db.query(sql, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Contraseña
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE usuarios SET password = ? WHERE id = ?';
    await db.query(sql, [hashedPassword, id]);
  }

  // Foto
  static async updatePhoto(id, fotoPath) {
    const sql = 'UPDATE usuarios SET foto = ? WHERE id = ?';
    await db.query(sql, [fotoPath, id]);
  
    const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    return rows[0];
  }

  // Nombre, email, telefono — sin contraseña y foto
  static async updateProfile(id, data) {
    const sql = `
      UPDATE usuarios
      SET nombre = ?, apellidos = ?, email = ?, telefono = ?
      WHERE id = ?
    `;
    const params = [data.nombre, data.apellidos, data.email, data.telefono, id];
    await db.query(sql, params);
  }
}

module.exports = Usuario;