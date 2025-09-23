// public/js/pedidos.js

document.addEventListener("DOMContentLoaded", () => {
  const socket = io(); // Socket.io подключение

  function updateCantidad(pedidoId, detalleId, accion) {
    const row = document.querySelector(`.pedido-container[data-pedido-id="${pedidoId}"] tr[data-detalle-id="${detalleId}"]`);
    if (!row) return;

    const cantidadSpan = row.querySelector('.cantidadDisplay');
    let cantidad = Number(cantidadSpan.textContent);

    cantidad = accion === 'mas' ? cantidad + 1 : cantidad - 1;
    if (cantidad < 1) cantidad = 1;

    fetch('/user/pedidos/actualizar-cantidad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ detalleId, cantidad })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        // обновляем количество на фронтенде
        cantidadSpan.textContent = cantidad;

        // пересчёт subtotal этой строки
        const precio = Number(row.querySelector('.precio').textContent);
        const subtotalCell = row.querySelector('.subtotal');
        subtotalCell.textContent = (precio * cantidad).toFixed(2);

        // пересчёт total заказа
        const totalCell = row.closest('.pedido-container').querySelector('.totalPedido');
        let total = 0;
        row.closest('tbody').querySelectorAll('tr').forEach(tr => {
          total += Number(tr.querySelector('.subtotal').textContent);
        });
        totalCell.textContent = total.toFixed(2);
      } else {
        alert(data.error);
      }
    })
    .catch(err => console.error('Error al actualizar cantidad:', err));
  }

  // Привязка обработчиков к кнопкам "+"
  document.querySelectorAll('.masBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateCantidad(btn.dataset.pedido, btn.dataset.detalle, 'mas');
    });
  });

  // Привязка обработчиков к кнопкам "-"
  document.querySelectorAll('.menosBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateCantidad(btn.dataset.pedido, btn.dataset.detalle, 'menos');
    });
  });

  // Socket.io: обновление существующего заказа
  socket.on('pedidoActualizado', (pedido) => {
    const container = document.querySelector(`.pedido-container[data-pedido-id="${pedido.id}"]`);
    if (!container) return;

    container.querySelector('.pedido-title').textContent = `Pedido ID: ${pedido.id} | Estado: ${pedido.estado}`;

    if (pedido.estado !== 'pendiente') {
      container.querySelectorAll('button').forEach(btn => btn.remove());
    }
  });
});
