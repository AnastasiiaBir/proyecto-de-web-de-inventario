// models/Localizacion.js
const db = require('../config/db');

class Localizacion {
  static async getAllWithDetails() {
    const sql = `
      SELECT id, nombre, direccion
      FROM localizaciones
    `;
    const [rows] = await db.query(sql);
    console.log('Se obtuvieron todas las localizaciones');
    return rows;
  }
  
  static async add(localizacion) {
    const sql = 'INSERT INTO localizaciones (nombre, direccion, ciudad) VALUES (?, ?, ?)';
    const params = [
      localizacion.nombre,
      localizacion.direccion,
      localizacion.ciudad
    ];
    const [result] = await db.query(sql, [localizacion.nombre, localizacion.direccion]);
    console.log(`Localización agregada con ID ${result.insertId}`);
    return result.insertId;
  }

  static async update(id, localizacion) {
    const sql = 'UPDATE localizaciones SET nombre=?, direccion=? WHERE id=?';
    const params = [
      localizacion.nombre,
      localizacion.direccion,
      localizacion.ciudad,
      id
    ];
    await db.query(sql, params);
    console.log(`Localización con ID ${id} actualizada`);
  }

  static async delete(id) {
    const sql = 'DELETE FROM localizaciones WHERE id=?';
    await db.query(sql, [id]);
    console.log(`Localización con ID ${id} eliminada`);
  }
}

module.exports = Localizacion;