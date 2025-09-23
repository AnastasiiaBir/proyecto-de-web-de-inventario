// models/PedidoAdmin.js

const db = require('../config/db');

class PedidoAdmin {
  // Получаем все заказы с данными пользователя
  static async getAll() {
    const [pedidos] = await db.execute(`
      SELECT p.id, p.fecha, p.usuario_id, u.nombre AS usuario_nombre, u.email AS usuario_email,
             p.estado, p.trabajo
      FROM pedidos p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.fecha DESC
    `);

    // Получаем детали каждого заказа
    for (let pedido of pedidos) {
      const [detalles] = await db.execute(`
        SELECT d.cantidad, d.precio_unitario AS precio, d.subtotal, d.producto_nombre
        FROM pedido_detalles d
        WHERE d.pedido_id = ?
      `, [pedido.id]);

      pedido.detalles = detalles || [];
      pedido.total = detalles.reduce((sum, det) => sum + parseFloat(det.subtotal || 0), 0);
    }

    return pedidos;
  }

  // Получаем заказ по ID
  static async getById(id) {
  const [rows] = await db.execute(`
    SELECT p.id, p.fecha, p.estado, p.trabajo,
           u.nombre AS usuario_nombre, u.email AS usuario_email
    FROM pedidos p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE p.id = ?
  `, [id]);

  if (rows.length === 0) return null;

  const pedido = rows[0];

  // Получаем детали заказа
  const [detalles] = await db.execute(`
    SELECT d.id, pr.nombre AS producto_nombre, d.cantidad, d.precio_unitario AS precio, d.subtotal
    FROM pedido_detalles d
    JOIN productos pr ON d.producto_id = pr.id
    WHERE d.pedido_id = ?
  `, [id]);

  pedido.detalles = detalles || [];
  pedido.total = detalles.reduce((sum, det) => sum + parseFloat(det.subtotal || 0), 0);

  return pedido;
}

  // Обновляем поле trabajo
  static async updateTrabajo(id, trabajo) {
    await db.execute(`UPDATE pedidos SET trabajo = ? WHERE id = ?`, [trabajo, id]);
  }

  // Обновляем статус заказа
  static async updateEstado(id, estado) {
    await db.execute(`UPDATE pedidos SET estado = ? WHERE id = ?`, [estado, id]);
  }
}

module.exports = PedidoAdmin;