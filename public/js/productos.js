// public/js/productos.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scripts de productos cargados');
  // === Dropdown Export ===
  const exportButton = document.getElementById('btnExportar');
  const exportMenu = document.getElementById('exportMenu');

  if (exportButton && exportMenu) {
    console.log('Export elements not found');
    exportButton.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
    });

  //console.log('Export elements OK');
  document.addEventListener('click', (e) => {
    if (exportMenu.style.display === 'block' &&
        !exportButton.contains(e.target) &&
        !exportMenu.contains(e.target)) {
      exportMenu.style.display = 'none';
      console.log('Menú export cerrado por clic fuera');
    }
  });
}

    // === Filtrar productos ===
  const btnFiltrar = document.getElementById('btnFiltrar');
  const table = document.getElementById('tablaProductos');
  if (btnFiltrar && table) {
    btnFiltrar.addEventListener('click', () => {
      const nombre = (document.getElementById('filterNombre').value || '').toLowerCase();
      const marca = (document.getElementById('filterMarca').value || '').toLowerCase();
      const categoria = (document.getElementById('filterCategoria').value || '').toLowerCase();
      const proveedor = (document.getElementById('filterProveedor').value || '').toLowerCase();
      const precioMax = parseFloat(document.getElementById('filterPrecio').value) || Infinity;
      const costoMax = parseFloat(document.getElementById('filterCosto').value) || Infinity;
      const stockMin = parseFloat(document.getElementById('filterStock').value) || 0;

      let shown = 0;
      table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.children;
        const precio = parseFloat(cells[5].innerText) || 0;
        const costo = parseFloat(cells[6].innerText) || 0;
        const stock = parseFloat(cells[7].innerText) || 0;
        const match =
          cells[1].innerText.toLowerCase().includes(nombre) &&
          cells[2].innerText.toLowerCase().includes(marca) &&
          cells[3].innerText.toLowerCase().includes(categoria) &&
          cells[4].innerText.toLowerCase().includes(proveedor) &&
          precio <= precioMax &&
          costo <= costoMax &&
          stock >= stockMin;
        row.style.display = match ? '' : 'none';
        if(match) shown++;
      });
      console.log(`Filtro aplicado. Filas visibles: ${shown}`);
    });
  }

// === Editar / Eliminar productos ===
  if (table) {
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('.editable');
      const saveBtn = row.querySelector('.save-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      const productId = row.dataset.id;

      cells.forEach(cell => {
        cell.addEventListener('click', () => {
          if(!cell.querySelector('input')){
            const val = cell.textContent;
            cell.innerHTML = `<input type="text" value="${val}" style="width:100%;">`;
            if(saveBtn) saveBtn.style.display = 'inline-block';
          }
        });
      });

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const data = {};
          cells.forEach(cell => {
            const input = cell.querySelector('input');
            if(input) data[cell.dataset.field] = input.value;
          });

          fetch('/admin/productos/editar/' + productId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          .then(res => res.json())
          .then(res => {
            if(res.success){
              cells.forEach(cell => {
                const input = cell.querySelector('input');
                if (input) cell.textContent = input.value;
              });
              saveBtn.style.display = 'none';
              console.log(`Producto ID ${productId} actualizado`);
            } else alert('Error al guardar');
          });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if(confirm('¿Seguro que quieres eliminar este producto?')) {
            fetch('/admin/productos/eliminar/' + productId, { method: 'DELETE' })
              .then(res => res.json())
              .then(res => {
                if(res.success) {
                  row.remove();
                console.log(`Producto ID ${productId} eliminado`);
                } else alert('Error al eliminar');
              });
          }
        });
      }
    });
  }
});