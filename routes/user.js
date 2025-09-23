// routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer, foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'user_' + req.session.user.id + ext);
  }
});
const upload = multer({ storage });

// Dashboard
router.get('/dashboard', isAuthenticated, userController.getDashboard);

// Productos
router.get('/productos', isAuthenticated, userController.listProductos);

// Pedidos
router.get('/pedidos', isAuthenticated, userController.listPedidos);
router.post('/pedidos/crear', isAuthenticated, userController.createPedido);
router.post('/pedidos/confirmar', isAuthenticated, userController.confirmarPedido);
router.post('/pedidos/actualizar-cantidad', isAuthenticated, userController.actualizarCantidadPedido);

// router.post('/pedidos/:pedidoId/detalle/:detalleId/cantidad', isAuthenticated, userController.actualizarCantidadPedido);

// Proveedores
// router.get('/proveedores', isAuthenticated, userController.listProveedores);

// Categorías
// router.get('/categorias', isAuthenticated, userController.listCategorias);

// Localizaciones
// router.get('/localizaciones', isAuthenticated, userController.listLocalizaciones);

// Perfil
router.get('/perfil', isAuthenticated, userController.getPerfil);

// Subir foto de perfil
router.post('/upload-photo', isAuthenticated, upload.single('foto'), userController.uploadPhoto);

// Cambiar contraseña
router.post('/change-password', isAuthenticated, userController.changePassword);

// Actualizar datos de perfil (nombre, apellidos, email, teléfono)
router.post('/update-profile', isAuthenticated, userController.updateProfile);

module.exports = router;