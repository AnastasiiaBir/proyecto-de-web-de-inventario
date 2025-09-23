// public/js/categorias.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scripts de categorias cargados');

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

  // === Filtrar categorias ===
  const btnFiltrar = document.getElementById('btnFiltrarCategorias');
  const table = document.getElementById('tablaCategorias');

  if (btnFiltrar && table) {
    btnFiltrar.addEventListener('click', () => {
      const nombre = (document.getElementById('filterNombre').value || '').toLowerCase();

      let shown = 0;
      table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.children;
        const match = cells[1].innerText.toLowerCase().includes(nombre);
        row.style.display = match ? '' : 'none';
        if(match) shown++;
      });

      console.log(`Filtro aplicado. Filas visibles: ${shown}`);
    });
  }

  // === Editar / Eliminar categorias ===
  if (table) {
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('.editable');
      const saveBtn = row.querySelector('.save-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      const categoriaId = row.dataset.id;

      // Клик по ячейке для редактирования
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
            if(input) data[cell.dataset.field] = input.value;
          });

          fetch('/admin/categorias/editar/' + categoriaId, {
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
              console.log(`Categoria ID ${categoriaId} actualizada`);
            } else {
              alert('Error al guardar');
            }
          });
        });
      }

      // Удаление категории
      if(deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if(confirm('¿Seguro que quieres eliminar esta categoría?')) {
            fetch('/admin/categorias/eliminar/' + categoriaId, { method: 'DELETE' })
              .then(res => res.json())
              .then(res => {
                if(res.success) {
                  row.remove();
                  console.log(`Categoria ID ${categoriaId} eliminada`);
                } else {
                  alert('Error al eliminar');
                }
              });
          }
        });
      }
    });
  }
});