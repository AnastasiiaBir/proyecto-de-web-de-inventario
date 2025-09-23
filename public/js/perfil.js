// public/js/perfil.js
document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profileForm');
  const fotoInput = document.querySelector('input[name="foto"]');
  const fotoPreview = document.getElementById('fotoPreview');

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('nombre', document.getElementById('nombre').value);
    formData.append('apellidos', document.getElementById('apellidos').value);
    formData.append('telefono', document.getElementById('telefono').value);
    formData.append('email', document.getElementById('email').value);
    const password = document.getElementById('password').value;
    if (password) formData.append('password', password);
    if (fotoInput.files[0]) formData.append('foto', fotoInput.files[0]);

    try {
      const res = await fetch('/admin/perfil/editar', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        alert('Perfil actualizado correctamente');
        document.getElementById('password').value = '';
        if (result.fotoPath && fotoPreview.tagName === 'IMG') {
          fotoPreview.src = result.fotoPath + '?t=' + new Date().getTime();
        }
      } else {
        alert(result.message || 'Error al actualizar perfil');
      }
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      alert('Error al actualizar perfil');
    }
  });
});