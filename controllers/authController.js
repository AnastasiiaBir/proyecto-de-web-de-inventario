// controllers/authController.js
const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario');

// Показать страницу логина
exports.getLogin = (req, res) => {
  res.render("index", { error: null, success: null });
};

// Обработка логина
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("index", { error: "Por favor, complete todos los campos", success: null });
  }

  try {
    const usuario = await Usuario.findByEmail(email);
    if (!usuario) {
      return res.render("index", { error: "Usuario no encontrado", success: null });
    }


    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.render("index", { error: "Contraseña incorrecta", success: null });
    }

    req.session.user = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      email: usuario.email,
      rol_id: usuario.rol_id
    };

    // 🔑 Редирект на профиль в зависимости от роли
    if (usuario.rol_id === 1) {
      res.redirect("/admin/dashboard");
    } else {
      res.redirect("/user/dashboard");
    }
  } catch (err) {
    console.error(err);
    res.render("index", { error: "Error interno del servidor" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect("/");
  });
};