// middlewares/authMiddleware.js

// Проверка, что пользователь залогинен
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
};

// Проверка, что пользователь админ (rol_id = 1)
exports.isAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  if (req.session.user.rol_id !== 1) {
    // Если не админ, можно редиректить на дашборд обычного пользователя
    return res.redirect('/perfil');
  }
  next();
};

// Проверка, что пользователь обычный (rol_id = 2)
exports.isUser = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/');
  }
  if (req.session.user.rol_id !== 2) {
    return res.redirect('/admin'); // если админ, можно редиректить на админ панель
  }
  next();
};