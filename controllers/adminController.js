// controllers/adminController.js

exports.getDashboard = (req, res) => {
  // Рендерим дашборд администратора
  res.render('admin/dashboard', { user: req.session.user });
};

exports.getPerfil = (req, res) => {
  // Рендерим профиль администратора
  res.render('admin/perfil', { user: req.session.user });
};
