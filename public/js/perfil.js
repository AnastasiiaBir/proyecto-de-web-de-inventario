// public/js/perfil.js

document.addEventListener('DOMContentLoaded', () => {
  console.log('Scripts de perfil cargados');

  const form = document.getElementById('perfilForm');
  const saveBtn = document.getElementById('btnGuardarPerfil');

  if (form) {
    const editableFields = form.querySelectorAll('.editable');

    // Клик по ячейке для редактирования
    editableFields.forEach(cell => {
      cell.addEventListener('click', () => {
        if(!cell.querySelector('input')) {
          const val = cell.textContent;
          cell.innerHTML = `<input type="text" value="${val}" style="width:100%;">`;
          if(saveBtn) saveBtn.style.display = 'inline-block';
        }
      });
    });

    // Сохранение профиля
    if(saveBtn) {
      saveBtn.addEventListener('click', () => {
        const data = {};
        editableFields.forEach(cell => {
          const input = cell.querySelector('input');
          if(input) data[cell.dataset.field] = input.value;
        });

        fetch('/perfil/editar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(res => {
          if(res.success) {
            editableFields.forEach(cell => {
              const input = cell.querySelector('input');
              if(input) cell.textContent = input.value;
            });
            saveBtn.style.display = 'none';
            console.log('Perfil actualizado');
          } else {
            alert('Error al guardar perfil');
          }
        });
      });
    }
  }
});
