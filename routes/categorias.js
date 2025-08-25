// routes/categorias.js
const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// Listado de categorías
router.get('/', isAuthenticated, isAdmin, categoriasController.listCategorias);

// Exportar categorías
router.get('/exportar/excel', isAuthenticated, isAdmin, categoriasController.exportExcel);
router.get('/exportar/pdf', isAuthenticated, isAdmin, categoriasController.exportPDF);

// Añadir nueva categoría
router.get('/nuevo', isAuthenticated, isAdmin, categoriasController.getNuevaCategoria);
router.post('/nuevo', isAuthenticated, isAdmin, categoriasController.postNuevaCategoria);

// Editar categoría (in-line AJAX)
router.post('/editar/:id', isAuthenticated, isAdmin, categoriasController.updateCategoria);

// Eliminar categoría (in-line AJAX)
router.delete('/eliminar/:id', isAuthenticated, isAdmin, categoriasController.deleteCategoria);

module.exports = router;