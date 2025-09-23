// models/Pedido.js
const db = require('../config/db');

module.exports = {
  findByUserId: async (userId) => {
    const [rows] = await db.execute('SELECT * FROM pedidos WHERE usuario_id = ?', [userId]);
    return rows;
  },

  create: async ({ usuarioId, estado, fecha }) => {
    const [result] = await db.execute(
      'INSERT INTO pedidos (usuario_id, estado, fecha) VALUES (?, ?, ?)',
      [usuarioId, estado, fecha]
    );
    return { id: result.insertId, usuarioId, estado, fecha };
  },

  updateEstado: async (id, estado) => {
    await db.execute('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id]);
    const [rows] = await db.execute('SELECT * FROM pedidos WHERE id = ?', [id]);
    return rows[0];
  },

  findPendienteByUser: async (usuarioId) => {
    const [rows] = await db.execute(
      'SELECT * FROM pedidos WHERE usuario_id = ? AND estado = "pendiente" LIMIT 1',
      [usuarioId]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.execute('SELECT * FROM pedidos WHERE id = ?', [id]);
    return rows[0] || null;
  }
};