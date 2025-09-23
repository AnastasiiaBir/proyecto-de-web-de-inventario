// models/Localizacion.js
const db = require('../config/db');

class Localizacion {
  static async getAllWithDetails() {
    const sql = `
      SELECT id, nombre, direccion, ciudad
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
    const [result] = await db.query(sql, [localizacion.nombre, localizacion.direccion, localizacion.ciudad]);
    console.log(`Localización agregada con ID ${result.insertId}`);
    return result.insertId;
  }

  static async update(id, localizacion) {
  const fields = [];
  const params = [];

  if(localizacion.nombre !== undefined) {
    fields.push('nombre=?');
    params.push(localizacion.nombre);
  }
  if(localizacion.direccion !== undefined) {
    fields.push('direccion=?');
    params.push(localizacion.direccion);
  }
  if(localizacion.ciudad !== undefined) {
    fields.push('ciudad=?');
    params.push(localizacion.ciudad);
  }

  if(fields.length === 0) return; // ничего не обновлять

  const sql = `UPDATE localizaciones SET ${fields.join(', ')} WHERE id=?`;
  params.push(id);
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