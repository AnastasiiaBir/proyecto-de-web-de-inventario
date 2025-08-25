// public/js/proveedores.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scripts de proveedores cargados');

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

  // === Filtrar proveedores ===
  const btnFiltrar = document.getElementById('btnFiltrarProveedores');
  const table = document.getElementById('tablaProveedores');

  if (btnFiltrar && table) {
    btnFiltrar.addEventListener('click', () => {
      const nombre = (document.getElementById('filterNombre').value || '').toLowerCase();
      const telefono = (document.getElementById('filterTelefono').value || '').toLowerCase();
      const email = (document.getElementById('filterEmail').value || '').toLowerCase();
      const direccion = (document.getElementById('filterDireccion').value || '').toLowerCase();
      const ciudad = (document.getElementById('filterCiudad').value || '').toLowerCase();

      let shown = 0;
      table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.children;
        const match =
          cells[1].innerText.toLowerCase().includes(nombre) &&
          cells[2].innerText.toLowerCase().includes(telefono) &&
          cells[3].innerText.toLowerCase().includes(email) &&
          cells[4].innerText.toLowerCase().includes(direccion) &&
          cells[5].innerText.toLowerCase().includes(ciudad);
        row.style.display = match ? '' : 'none';
        if(match) shown++;
      });
      console.log(`Filtro aplicado. Filas visibles: ${shown}`);
    });
  }


  // === Editar / Eliminar proveedores ===
  if (table) {
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('.editable');
      const saveBtn = row.querySelector('.save-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      const proveedorId = row.dataset.id;

      // Клик по ячейке для редактирования
      cells.forEach(cell => {
        cell.addEventListener('click', () => {
          if(!cell.querySelector('input')) {
            const val = cell.textContent;
            cell.innerHTML = `<input type="text" value="${val}" style="width:100%;">`;
            if(saveBtn) saveBtn.style.display = 'inline-block';
          }
        });
      });

      // Сохранение изменений
      if(saveBtn) {
        saveBtn.addEventListener('click', () => {
          const data = {};
          cells.forEach(cell => {
            const input = cell.querySelector('input');
            if(input) data[cell.dataset.field] = input.value;
          });

          fetch('/admin/proveedores/editar/' + proveedorId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          .then(res => res.json())
          .then(res => {
            if(res.success) {
              cells.forEach(cell => {
                const input = cell.querySelector('input');
                if(input) cell.textContent = input.value;
              });
              saveBtn.style.display = 'none';
              console.log(`Proveedor ID ${proveedorId} actualizado`);
            } else alert('Error al guardar');
          });
        });
      }

      // Удаление
      if(deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if(confirm('¿Seguro que quieres eliminar este proveedor?')) {
            fetch('/admin/proveedores/eliminar/' + proveedorId, { method: 'DELETE' })
              .then(res => res.json())
              .then(res => {
                if(res.success) {
                  row.remove();
                  console.log(`Proveedor ID ${proveedorId} eliminado`);
                } else alert('Error al eliminar');
              });
          }
        });
      }
    });
  }
});