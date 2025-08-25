// routes/productos.js
const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// Listado de productos
router.get('/', isAuthenticated, isAdmin, productosController.listProductos);

// Exportar productos
router.get('/exportar/excel', isAuthenticated, isAdmin, productosController.exportExcel);
router.get('/exportar/pdf', isAuthenticated, isAdmin, productosController.exportPDF);

// Añadir nuevo producto
router.get('/nuevo', isAuthenticated, isAdmin, productosController.getNuevoProducto);
router.post('/nuevo', isAuthenticated, isAdmin, productosController.postNuevoProducto);

// Editar producto (in-line AJAX)
router.post('/editar/:id', isAuthenticated, isAdmin, productosController.updateProducto);

// Eliminar producto (in-line AJAX)
router.delete('/eliminar/:id', isAuthenticated, isAdmin, productosController.deleteProducto);

module.exports = router;
