// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', authController.getLogin);
router.post('/login', authController.postLogin);

// ✨ Админ: dashboard и perfil
router.get('/admin/dashboard', isAuthenticated, isAdmin, adminController.getDashboard);
router.get('/admin/perfil', isAuthenticated, isAdmin, adminController.getPerfil);

// ✨ Пользователь: dashboard и perfil
router.get('/user/dashboard', isAuthenticated, userController.getDashboard);
router.get('/user/perfil', isAuthenticated, userController.getPerfil);

router.get('/logout', authController.logout);

module.exports = router;
