// routes/admin.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const usuariosController = require("../controllers/usuariosController");
const productosController = require("../controllers/productosController");
const categoriasController = require("../controllers/categoriasController");
const proveedoresController = require("../controllers/proveedoresController");
const localizacionesController = require("../controllers/localizacionesController");
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");

// --- Dashboard ---
router.get("/dashboard", isAuthenticated, isAdmin, adminController.getDashboard);

// =====================
// --- Usuarios ---
// =====================
router.get("/usuarios", isAuthenticated, isAdmin, usuariosController.listUsuarios);
router.get("/usuarios/nuevo", isAuthenticated, isAdmin, usuariosController.getNuevoUsuario);
router.post("/usuarios/nuevo", isAuthenticated, isAdmin, usuariosController.postNuevoUsuario);
router.post("/usuarios/editar/:id", isAuthenticated, isAdmin, usuariosController.updateUsuario);
router.delete("/usuarios/eliminar/:id", isAuthenticated, isAdmin, usuariosController.deleteUsuario);
router.get("/usuarios/exportar/excel", isAuthenticated, isAdmin, usuariosController.exportExcel);
router.get("/usuarios/exportar/pdf", isAuthenticated, isAdmin, usuariosController.exportPDF);

// =====================
// --- Productos ---
// =====================
router.get("/productos", isAuthenticated, isAdmin, productosController.listProductos);
router.get("/productos/nuevo", isAuthenticated, isAdmin, productosController.getNuevoProducto);
router.post("/productos/nuevo", isAuthenticated, isAdmin, productosController.postNuevoProducto);
router.post("/productos/editar/:id", isAuthenticated, isAdmin, productosController.updateProducto);
router.delete("/productos/eliminar/:id", isAuthenticated, isAdmin, productosController.deleteProducto);
router.get("/productos/exportar/excel", isAuthenticated, isAdmin, productosController.exportExcel);
router.get("/productos/exportar/pdf", isAuthenticated, isAdmin, productosController.exportPDF);

// =====================
// --- Categorías ---
// =====================
router.get("/categorias", isAuthenticated, isAdmin, categoriasController.listCategorias);
router.get("/categorias/nueva", isAuthenticated, isAdmin, categoriasController.getNuevaCategoria);
router.post("/categorias/nueva", isAuthenticated, isAdmin, categoriasController.postNuevaCategoria);
router.post("/categorias/editar/:id", isAuthenticated, isAdmin, categoriasController.updateCategoria);
router.delete("/categorias/eliminar/:id", isAuthenticated, isAdmin, categoriasController.deleteCategoria);
router.get("/categorias/exportar/pdf", isAuthenticated, isAdmin, categoriasController.exportPDF);
router.get("/categorias/exportar/excel", isAuthenticated, isAdmin, categoriasController.exportExcel);

// =====================
// --- Proveedores ---
// =====================
router.get("/proveedores", isAuthenticated, isAdmin, proveedoresController.listProveedores);
router.get("/proveedores/nuevo", isAuthenticated, isAdmin, proveedoresController.getNuevoProveedor);
router.post("/proveedores/nuevo", isAuthenticated, isAdmin, proveedoresController.postNuevoProveedor);
router.post("/proveedores/editar/:id", isAuthenticated, isAdmin, proveedoresController.updateProveedor);
router.delete("/proveedores/eliminar/:id", isAuthenticated, isAdmin, proveedoresController.deleteProveedor);
router.get("/proveedores/exportar/excel", isAuthenticated, isAdmin, proveedoresController.exportExcel);
router.get("/proveedores/exportar/pdf", isAuthenticated, isAdmin, proveedoresController.exportPDF);

// =====================
// --- Localizaciones ---
// =====================
router.get("/localizaciones", isAuthenticated, isAdmin, localizacionesController.listLocalizaciones);
router.get("/localizaciones/nuevo", isAuthenticated, isAdmin, localizacionesController.getNuevaLocalizacion);
router.post("/localizaciones/nuevo", isAuthenticated, isAdmin, localizacionesController.postNuevaLocalizacion);
router.post("/localizaciones/editar/:id", isAuthenticated, isAdmin, localizacionesController.updateLocalizacion);
router.delete("/localizaciones/eliminar/:id", isAuthenticated, isAdmin, localizacionesController.deleteLocalizacion);
router.get("/localizaciones/exportar/excel", isAuthenticated, isAdmin, localizacionesController.exportExcel);
router.get("/localizaciones/exportar/pdf", isAuthenticated, isAdmin, localizacionesController.exportPDF);

module.exports = router;