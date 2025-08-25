// routes/localizaciones.js
const express = require('express');
const router = express.Router();
const localizacionesController = require('../controllers/localizacionesController');
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// Listado de localizaciones
router.get('/', isAuthenticated, isAdmin, localizacionesController.listLocalizaciones);

// Exportar localizaciones
router.get('/exportar/excel', isAuthenticated, isAdmin, localizacionesController.exportExcel);
router.get('/exportar/pdf', isAuthenticated, isAdmin, localizacionesController.exportPDF);

// Añadir nueva localización
router.get('/nuevo', isAuthenticated, isAdmin, localizacionesController.getNuevaLocalizacion);
router.post('/nuevo', isAuthenticated, isAdmin, localizacionesController.postNuevaLocalizacion);

// Editar localización (in-line AJAX)
router.post('/editar/:id', isAuthenticated, isAdmin, localizacionesController.updateLocalizacion);

// Eliminar localización (in-line AJAX)
router.delete('/eliminar/:id', isAuthenticated, isAdmin, localizacionesController.deleteLocalizacion);

module.exports = router;