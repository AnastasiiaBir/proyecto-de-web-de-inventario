// models/PedidoDetalle.js
const db = require('../config/db');

class PedidoDetalle {
  /**
   * @param {Object} data - { pedido_id, usuario_id, producto_id, cantidad, estado }
   * @returns {Object} 
   */
  static async create(data) {
    const { pedido_id, usuario_id, producto_id, cantidad, estado } = data;

    const [result] = await db.execute(
      `INSERT INTO pedido_detalles (pedido_id, usuario_id, producto_id, cantidad, estado, fecha)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [pedido_id, usuario_id, producto_id, cantidad, estado]
    );

    return {
      id: result.insertId,
      pedido_id,
      usuario_id,
      producto_id,
      cantidad,
      estado,
      fecha: new Date()
    };
  }

  static async findByPedidoId(pedido_id) {
    const [rows] = await db.execute(
      `SELECT pd.*, p.nombre AS producto_nombre, p.precio
       FROM pedido_detalles pd
       JOIN productos p ON p.id = pd.producto_id
       WHERE pd.pedido_id = ?`,
      [pedido_id]
    );
    return rows.map(row => ({
      ...row,
      estado: row.estado || 'pendiente' // если пустое, ставим 'pendiente'
    }));
  }

  static async findById(id) {
    const [rows] = await db.execute(`SELECT * FROM pedido_detalles WHERE id = ?`, [id]);
    return rows[0];
  }

  static async updateCantidad(id, cantidad) {
    await db.execute(
      `UPDATE pedido_detalles SET cantidad = ? WHERE id = ?`,
      [cantidad, id]
    );
  }

  static async delete(id) {
    await db.execute(`DELETE FROM pedido_detalles WHERE id = ?`, [id]);
  }
}

module.exports = PedidoDetalle;