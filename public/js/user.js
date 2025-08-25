// public/js/user.js
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnExportar');
  const menu = document.getElementById('exportMenu');

  if(btn && menu){
    btn.addEventListener('click', e => {
      e.stopPropagation();
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', e => {
      if(menu.style.display === 'block' &&
         !btn.contains(e.target) &&
         !menu.contains(e.target)){
        menu.style.display = 'none';
      }
    });
  }
});
