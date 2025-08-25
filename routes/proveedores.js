// routes/proveedores.js
const express = require('express');
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// Listado de proveedores
router.get('/', isAuthenticated, isAdmin, proveedoresController.listProveedores);

// Exportar proveedores
router.get('/exportar/excel', isAuthenticated, isAdmin, proveedoresController.exportExcel);
router.get('/exportar/pdf', isAuthenticated, isAdmin, proveedoresController.exportPDF);

// Añadir nuevo proveedor
router.get('/nuevo', isAuthenticated, isAdmin, proveedoresController.getNuevoProveedor);
router.post('/nuevo', isAuthenticated, isAdmin, proveedoresController.postNuevoProveedor);

// Editar proveedor (in-line AJAX)
router.post('/editar/:id', isAuthenticated, isAdmin, proveedoresController.updateProveedor);

// Eliminar proveedor (in-line AJAX)
router.delete('/eliminar/:id', isAuthenticated, isAdmin, proveedoresController.deleteProveedor);

module.exports = router;