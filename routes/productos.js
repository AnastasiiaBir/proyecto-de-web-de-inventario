// routes/productos.js
const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');
const Producto = require('../models/Producto');
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// Listado de productos
router.get('/', isAuthenticated, productosController.listProductos);

// Exportar productos
router.get('/exportar/excel', isAuthenticated, isAdmin, productosController.exportExcel);
router.get('/exportar/pdf', isAuthenticated, isAdmin, productosController.exportPDF);

// Añadir nuevo producto
router.get('/nuevo', isAuthenticated, isAdmin, productosController.getNuevoProducto);
router.post('/nuevo', isAuthenticated, isAdmin, productosController.postNuevoProducto);

// Editar producto (in-line AJAX)
// router.post('/editar/:id', isAuthenticated, isAdmin, productosController.updateProducto);

// Eliminar producto (in-line AJAX)
// router.delete('/eliminar/:id', isAuthenticated, isAdmin, productosController.deleteProducto);

// router.post('/:id/update', isAuthenticated, isAdmin, productosController.updateProducto);

// Obtener opciones para selects (proveedor, categoria, localizacion)
router.get('/options', isAuthenticated, productosController.getOptions);

// === Editar producto (inline AJAX) ===
router.post('/:id/update', isAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params;
  const keys = Object.keys(req.body);

  try {
    const field = keys[0];
    const value = req.body[field];

    // если это категория или поставщик, вызываем контроллер
    if (field === 'categoria_id' || field === 'proveedor_id' || field === 'localizacion_id') {
      // используем логику контроллера
      await require('../controllers/productosController').updateProducto({ params: { id }, body: { [field]: value } }, res);
    } else {
      await Producto.updateField(id, field, value);
      res.json({ success: true });
    }
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

// === Eliminar producto (inline AJAX) ===
router.delete('/eliminar/:id', isAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await Producto.delete(id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;
