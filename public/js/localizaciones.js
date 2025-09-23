// public/js/localizaciones.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scripts de localizaciones cargados');

  // === Dropdown Export ===
  const exportButton = document.getElementById('btnExportar');
  const exportMenu = document.getElementById('exportMenu');

  if (exportButton && exportMenu) {
    exportButton.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.style.display = exportMenu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (exportMenu.style.display === 'block' &&
          !exportButton.contains(e.target) &&
          !exportMenu.contains(e.target)) {
        exportMenu.style.display = 'none';
        console.log('Menú export cerrado por clic fuera');
      }
    });
  }

  // === Filtrar localizaciones ===
  const btnFiltrar = document.getElementById('btnFiltrarLocalizaciones');
  const table = document.getElementById('tablaLocalizaciones');

  if (btnFiltrar && table) {
    btnFiltrar.addEventListener('click', () => {
      const nombre = (document.getElementById('filterNombre').value || '').toLowerCase();
      const direccion = (document.getElementById('filterDireccion').value || '').toLowerCase();
      const ciudad = (document.getElementById('filterCiudad').value || '').toLowerCase();

      let shown = 0;
      table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.children;
        const match =
          cells[1].innerText.toLowerCase().includes(nombre) &&
          cells[2].innerText.toLowerCase().includes(direccion) &&
          cells[3].innerText.toLowerCase().includes(ciudad);

        row.style.display = match ? '' : 'none';
        if(match) shown++;
      });

      console.log(`Filtro aplicado. Filas visibles: ${shown}`);
    });
  }

  // === Editar / Eliminar localizaciones ===
  if (table) {
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('.editable');
      const saveBtn = row.querySelector('.save-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      const localizacionId = row.dataset.id;

      cells.forEach(cell => {
        cell.addEventListener('dblclick', () => {
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
            if(input) { // только изменённые
              data[cell.dataset.field] = input.value;
            }
          });

          if(Object.keys(data).length === 0) return; // ничего не меняли

          fetch('/admin/localizaciones/editar/' + localizacionId, {
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
              console.log(`Localización ID ${localizacionId} actualizada`);
            } else alert('Error al guardar');
          });
        });
      }
      
      // Удаление
      if(deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if(confirm('¿Seguro que quieres eliminar esta localización?')) {
            fetch('/admin/localizaciones/eliminar/' + localizacionId, { method: 'DELETE' })
              .then(res => res.json())
              .then(res => {
                if(res.success) {
                  row.remove();
                  console.log(`Localización ID ${localizacionId} eliminada`);
                } else alert('Error al eliminar');
              });
          }
        });
      }
    });
  }
});