// routes/usuarios.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// Listado de usuarios
router.get('/', isAuthenticated, isAdmin, usuariosController.listUsuarios);

// Exportar usuarios
router.get('/exportar/excel', isAuthenticated, isAdmin, usuariosController.exportExcel);
router.get('/exportar/pdf', isAuthenticated, isAdmin, usuariosController.exportPDF);

// Añadir nuevo usuario
router.get('/nuevo', isAuthenticated, isAdmin, usuariosController.getNuevoUsuario);
router.post('/nuevo', isAuthenticated, isAdmin, usuariosController.postNuevoUsuario);

// Editar usuario (in-line AJAX)
router.post('/editar/:id', isAuthenticated, isAdmin, usuariosController.updateUsuario);

router.post('/reset-password/:id', isAuthenticated, isAdmin, usuariosController.resetPassword);

// Eliminar usuario (in-line AJAX)
router.delete('/eliminar/:id', isAuthenticated, isAdmin, usuariosController.deleteUsuario);

module.exports = router;