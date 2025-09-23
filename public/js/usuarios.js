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

  // Filtrar usuarios
  const btnFiltrar = document.getElementById('btnFiltrarUsuarios');
  const btnReset = document.getElementById('btnResetUsuarios');
  const table = document.getElementById('usuariosTable');

  if(table) {
    if(btnFiltrar) {
      btnFiltrar.addEventListener('click', () => {
        const nombre = (document.getElementById('filterNombre').value || '').toLowerCase();
        const apellidos = (document.getElementById('filterApellidos').value || '').toLowerCase();
        const email = (document.getElementById('filterEmail').value || '').toLowerCase();
        const telefono = (document.getElementById('filterTelefono').value || '').toLowerCase();
        const rol = (document.getElementById('filterRol').value || '');

        let shown = 0;
        table.querySelectorAll('tbody tr').forEach(row => {
          // const cells = row.children;
          const match =
            // cells[1].innerText.toLowerCase().includes(nombre) &&
            // cells[2].innerText.toLowerCase().includes(apellidos) &&
            // cells[3].innerText.toLowerCase().includes(email) &&
            // cells[4].innerText.toLowerCase().includes(telefono) &&
            // (rol === '' || cells[5].innerText === (rol === '1' ? 'Administrador' : 'Usuario'));
            (row.querySelector('[data-field="nombre"]').innerText.toLowerCase().includes(nombre)) &&
            (row.querySelector('[data-field="apellidos"]').innerText.toLowerCase().includes(apellidos)) &&
            (row.querySelector('[data-field="email"]').innerText.toLowerCase().includes(email)) &&
            (row.querySelector('[data-field="telefono"]').innerText.toLowerCase().includes(telefono)) &&
            (rol === '' || row.dataset.rol === rol);
          row.style.display = match ? '' : 'none';
          if(match) shown++;
        });
        console.log(`Filtro aplicado. Filas visibles: ${shown}`);
      });
    }

    if(btnReset) {
      btnReset.addEventListener('click', () => {
        ['filterNombre','filterApellidos','filterEmail','filterTelefono','filterRol'].forEach(id => {
          const input = document.getElementById(id);
          if(input) input.value = '';
        });
        table.querySelectorAll('tbody tr').forEach(row => row.style.display = '');
        console.log('Filtros reseteados. Todas las filas visibles.');
      });
    }
}

  // === Editar / Eliminar usuarios ===
  if (table) {
    table.querySelectorAll('tbody tr').forEach(row => {
      const cells = row.querySelectorAll('.editable, [data-field="rol_id"]');
      const saveBtn = row.querySelector('.save-btn');
      const resetBtn = row.querySelector('.reset-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      const userId = row.dataset.id;

      cells.forEach(cell => {
        cell.addEventListener('dblclick', () => {
          if (!cell.querySelector('input, select')) {
            const val = cell.textContent.trim();
            if (cell.dataset.field === 'rol_id') {
              const rolId = cell.dataset.rolId || (val === 'Administrador' ? '1' : '2');
              cell.innerHTML = `<select style="width:100%">
                <option value="1" ${rolId == '1' ? 'selected' : ''}>Administrador</option>
                <option value="2" ${rolId == '2' ? 'selected' : ''}>Usuario</option>
              </select>`;
            } else {
              cell.innerHTML = `<input type="text" value="${val}" style="width:100%;">`;
            }
            if (saveBtn) saveBtn.style.display = 'inline-block';
          }
        });
      });

      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const data = {};
          cells.forEach(cell => {
            const input = cell.querySelector('input, select');
            if(input){
              data[cell.dataset.field] = input.value;
              if(cell.dataset.field === 'rol_id'){
                row.dataset.rol = input.value;
              }
            } else {
              if(cell.dataset.field === 'rol_id'){
                data[cell.dataset.field] = row.dataset.rol || (cell.textContent.trim() === 'Administrador' ? '1' : '2');
              } else {
                data[cell.dataset.field] = cell.textContent.trim();
              }
            }
          });

          // Добавляем фото, если оно есть
          data.foto = row.dataset.foto;

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

// Сброс пароля
      if(resetBtn){
        const passwordInfo = document.createElement('span');
        passwordInfo.style.marginLeft = '10px';
        passwordInfo.style.color = 'green';
        resetBtn.after(passwordInfo);

        resetBtn.addEventListener('click', async () => {
          if (!confirm('¿Seguro que quieres resetear la contraseña de este usuario?')) return;
          try {
            const res = await fetch(`/admin/usuarios/reset-password/${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
              passwordInfo.textContent = `Nueva contraseña: ${data.newPassword}`;
            } else {
              passwordInfo.textContent = 'Error al resetear contraseña';
              passwordInfo.style.color = 'red';
            }
          } catch (err) {
            console.error(err);
            passwordInfo.textContent = 'Error en la petición';
            passwordInfo.style.color = 'red';
          }
        });
      } 
    });
  }
});