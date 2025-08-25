// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

// Dashboard
router.get('/dashboard', isAuthenticated, userController.getDashboard);

// Productos
router.get('/productos', isAuthenticated, userController.listProductos);

// Proveedores
router.get('/proveedores', isAuthenticated, userController.listProveedores);

// Categorías
router.get('/categorias', isAuthenticated, userController.listCategorias);

// Localizaciones
router.get('/localizaciones', isAuthenticated, userController.listLocalizaciones);

// Perfil
router.get('/perfil', isAuthenticated, userController.getPerfil);

module.exports = router;