// models/Categoria.js
const db = require('../config/db');

class Categoria {
  static async getAllWithDetails() {
    const sql = `
      SELECT c.id, c.nombre
      FROM categorias c
    `;
    const [rows] = await db.query(sql);
    console.log('Se obtuvieron todas las categorías');
    return rows;
  }

  static async add(categoria) {
    const sql = 'INSERT INTO categorias (nombre) VALUES (?)';
    const params = [
      categoria.nombre
    ];
    const [result] = await db.query(sql, params);
    console.log(`Categoría agregada con ID ${result.insertId}`);
    return result.insertId;
  }

  static async update(id, categoria) {
    const sql = 'UPDATE categorias SET nombre=? WHERE id=?';
    const params = [
      categoria.nombre,
      id
    ];
    await db.query(sql, params);
    console.log(`Categoría con ID ${id} actualizada`);
  }

  static async delete(id) {
    const sql = 'DELETE FROM categorias WHERE id=?';
    await db.query(sql, [id]);
    console.log(`Categoría con ID ${id} eliminada`);
  }
}

module.exports = Categoria;