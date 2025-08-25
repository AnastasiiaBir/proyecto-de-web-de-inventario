// public/js/usuarios.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scripts de usuarios cargados');

  // === Dropdown Export ===
  const exportButton = document.getElementById('btnExportar');
  const exportMenu = document.getElementById('exportMenu');

  if (exportButton && exportMenu) {
    console.log('Export elements not found');
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

  // === Filtrar usuarios ===
  const btnFiltrar = document.getElementById('btnFiltrarUsuarios');
  const table = document.getElementById('usuariosTable');
  if (btnFiltrar && table) {
    btnFiltrar.addEventListener('click', () => {
      const nombre = (document.getElementById('filterNombre').value || '').toLowerCase();
      const apellidos = (document.getElementById('filterApellidos').value || '').toLowerCase();
      const email = (document.getElementById('filterEmail').value || '').toLowerCase();
      const telefono = (document.getElementById('filterTelefono').value || '').toLowerCase();
      const rol = (document.getElementById('filterRol').value || '');

      let shown = 0;
      table.querySelectorAll('tbody tr').forEach(row => {
        const cells = row.children;
        // const precio = parseFloat(cells[5].innerText) || 0;
        // const costo = parseFloat(cells[6].innerText) || 0;
        // const stock = parseFloat(cells[7].innerText) || 0;
        // const match =
          cells[1].innerText.toLowerCase().includes(nombre) &&
          cells[2].innerText.toLowerCase().includes(apellidos) &&
          cells[3].innerText.toLowerCase().includes(email) &&
          cells[4].innerText.toLowerCase().includes(telefono) &&
          (rol === '' || cells[5].innerText === (rol === '1' ? 'Administrador' : 'Usuario'));
        row.style.display = match ? '' : 'none';
        if(match) shown++;
      });
      console.log(`Filtro aplicado. Filas visibles: ${shown}`);
    });
  }

  // === Editar / Eliminar usuarios ===
  if (table) {
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('.editable');
      const saveBtn = row.querySelector('.save-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      const userId = row.dataset.id;

      cells.forEach(cell => {
        cell.addEventListener('click', () => {
          if(!cell.querySelector('input, select')){
            const val = cell.textContent;
            if(cell.dataset.field === 'rol_id') {
              cell.innerHTML = `<select style="width:100%">
                <option value="1" ${val==='Administrador'?'selected':''}>Administrador</option>
                <option value="2" ${val==='Usuario'?'selected':''}>Usuario</option>
              </select>`;
            } else {
              cell.innerHTML = `<input type="text" value="${val}" style="width:100%;">`;
            }
            if(saveBtn) saveBtn.style.display = 'inline-block';
          }
        });
      });

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const data = {};
          cells.forEach(cell => {
            const input = cell.querySelector('input, select');
            if(input) data[cell.dataset.field] = input.value;
          });

          fetch('/admin/usuarios/editar/' + userId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          .then(res => res.json())
          .then(res => {
            if(res.success){
              cells.forEach(cell => {
                const input = cell.querySelector('input, select');
                if(input){
                  if(cell.dataset.field === 'rol_id') {
                    cell.textContent = input.value === '1' ? 'Administrador' : 'Usuario';
                  } else {
                    cell.textContent = input.value;
                  }
                }
              });
              saveBtn.style.display = 'none';
              console.log(`Usuario ID ${userId} actualizado`);
            } else alert('Error al guardar');
          });
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if(confirm('¿Seguro que quieres eliminar este usuario?')) {
            fetch('/admin/usuarios/eliminar/' + userId, { method: 'DELETE' })
              .then(res => res.json())
              .then(res => {
                if(res.success) {
                  row.remove();
                  console.log(`Usuario ID ${userId} eliminado`);
                } else alert('Error al eliminar');
              });
          }
        });
      }
    });
  }
});