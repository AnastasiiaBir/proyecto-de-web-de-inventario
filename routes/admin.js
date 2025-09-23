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
const multer = require('multer');
const path = require('path');

// Multer, foto
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Multer: destino de subida:', 'public/uploads/');
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    console.log('Multer: archivo subido:', file.originalname, 'renombrado a:', 'admin_' + req.session.user.id + ext);
    cb(null, 'admin_' + req.session.user.id + ext);
  }
});
const upload = multer({ storage });

// --- Dashboard ---
router.get("/dashboard", isAuthenticated, isAdmin, (req, res, next) => {
  console.log('GET /dashboard llamado');
  next();
}, adminController.getDashboard);

// --- Pedidos ---
router.get('/pedidos', isAuthenticated, isAdmin, (req,res,next)=>{
  console.log('GET /pedidos llamado');
  next();
}, adminController.listAllPedidos);

router.post("/pedidos/:id/estado", isAuthenticated, isAdmin, (req,res,next)=>{
  console.log('POST /pedidos/:id/estado llamado, params:', req.params, 'body:', req.body);
  next();
}, adminController.updateEstadoPedido);

router.get('/pedidos/:id', isAuthenticated, isAdmin, adminController.getPedidoDetallePage);

router.get('/pedidos/:id/detalle-page', isAuthenticated, isAdmin, adminController.getPedidoDetallePage);

router.post('/pedidos/:id/trabajo', isAuthenticated, isAdmin, adminController.updateTrabajo);

// --- Usuarios ---
router.get("/usuarios", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /usuarios'); next(); }, usuariosController.listUsuarios);
router.get("/usuarios/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /usuarios/nuevo'); next(); }, usuariosController.getNuevoUsuario);
router.post("/usuarios/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /usuarios/nuevo', req.body); next(); }, usuariosController.postNuevoUsuario);
router.post("/usuarios/editar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /usuarios/editar/:id', req.params, req.body); next(); }, usuariosController.updateUsuario);
router.delete("/usuarios/eliminar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('DELETE /usuarios/eliminar/:id', req.params); next(); }, usuariosController.deleteUsuario);
router.get("/usuarios/exportar/excel", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /usuarios/exportar/excel'); next(); }, usuariosController.exportExcel);
router.get("/usuarios/exportar/pdf", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /usuarios/exportar/pdf'); next(); }, usuariosController.exportPDF);

// --- Productos ---
router.get("/productos", isAuthenticated, (req,res,next)=>{ console.log('GET /productos'); next(); }, productosController.listProductos);
router.get("/productos/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /productos/nuevo'); next(); }, productosController.getNuevoProducto);
router.post("/productos/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /productos/nuevo', req.body); next(); }, productosController.postNuevoProducto);
router.post("/productos/editar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /productos/editar/:id', req.params, req.body); next(); }, productosController.updateProducto);
router.delete("/productos/eliminar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('DELETE /productos/eliminar/:id', req.params); next(); }, productosController.deleteProducto);
router.get("/productos/exportar/excel", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /productos/exportar/excel'); next(); }, productosController.exportExcel);
router.get("/productos/exportar/pdf", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /productos/exportar/pdf'); next(); }, productosController.exportPDF);

// --- Listas JSON para selects ---
router.get("/categorias/list", isAuthenticated, isAdmin, async (req,res)=>{
    console.log('GET /categorias/list');
    try {
        const categorias = await categoriasController.getAllAsJson();
        console.log('Categorias JSON:', categorias);
        res.json(categorias);
    } catch(err){
        console.error('Error categorias list:', err);
        res.status(500).json([]);
    }
});

router.get("/proveedores/list", isAuthenticated, isAdmin, async (req,res)=>{
    console.log('GET /proveedores/list');
    try {
        const proveedores = await proveedoresController.getAllAsJson();
        console.log('Proveedores JSON:', proveedores);
        res.json(proveedores);
    } catch(err){
        console.error('Error proveedores list:', err);
        res.status(500).json([]);
    }
});

router.get("/localizaciones/list", isAuthenticated, isAdmin, async (req,res)=>{
    console.log('GET /localizaciones/list');
    try {
        const localizaciones = await localizacionesController.getAllAsJson();
        console.log('Localizaciones JSON:', localizaciones);
        res.json(localizaciones);
    } catch(err){
        console.error('Error localizaciones list:', err);
        res.status(500).json([]);
    }
});

// --- Categorías ---
router.get("/categorias", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /categorias'); next(); }, categoriasController.listCategorias);
router.get("/categorias/nueva", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /categorias/nueva'); next(); }, categoriasController.getNuevaCategoria);
router.post("/categorias/nueva", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /categorias/nueva', req.body); next(); }, categoriasController.postNuevaCategoria);
router.post("/categorias/editar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /categorias/editar/:id', req.params, req.body); next(); }, categoriasController.updateCategoria);
router.delete("/categorias/eliminar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('DELETE /categorias/eliminar/:id', req.params); next(); }, categoriasController.deleteCategoria);
router.get("/categorias/exportar/pdf", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /categorias/exportar/pdf'); next(); }, categoriasController.exportPDF);
router.get("/categorias/exportar/excel", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /categorias/exportar/excel'); next(); }, categoriasController.exportExcel);

// --- Proveedores ---
router.get("/proveedores", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /proveedores'); next(); }, proveedoresController.listProveedores);
router.get("/proveedores/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /proveedores/nuevo'); next(); }, proveedoresController.getNuevoProveedor);
router.post("/proveedores/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /proveedores/nuevo', req.body); next(); }, proveedoresController.postNuevoProveedor);
router.post("/proveedores/editar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /proveedores/editar/:id', req.params, req.body); next(); }, proveedoresController.updateProveedor);
router.delete("/proveedores/eliminar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('DELETE /proveedores/eliminar/:id', req.params); next(); }, proveedoresController.deleteProveedor);
router.get("/proveedores/exportar/excel", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /proveedores/exportar/excel'); next(); }, proveedoresController.exportExcel);
router.get("/proveedores/exportar/pdf", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /proveedores/exportar/pdf'); next(); }, proveedoresController.exportPDF);

// --- Localizaciones ---
router.get("/localizaciones", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /localizaciones'); next(); }, localizacionesController.listLocalizaciones);
router.get("/localizaciones/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /localizaciones/nuevo'); next(); }, localizacionesController.getNuevaLocalizacion);
router.post("/localizaciones/nuevo", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /localizaciones/nuevo', req.body); next(); }, localizacionesController.postNuevaLocalizacion);
router.post("/localizaciones/editar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('POST /localizaciones/editar/:id', req.params, req.body); next(); }, localizacionesController.updateLocalizacion);
router.delete("/localizaciones/eliminar/:id", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('DELETE /localizaciones/eliminar/:id', req.params); next(); }, localizacionesController.deleteLocalizacion);
router.get("/localizaciones/exportar/excel", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /localizaciones/exportar/excel'); next(); }, localizacionesController.exportExcel);
router.get("/localizaciones/exportar/pdf", isAuthenticated, isAdmin, (req,res,next)=>{ console.log('GET /localizaciones/exportar/pdf'); next(); }, localizacionesController.exportPDF);

// --- Perfil ---
router.post(
  '/perfil/editar',
  isAuthenticated,
  isAdmin,
  upload.single('foto'), // multer должен идти **до** логирования и контроллера
  (req, res, next) => {
    console.log('POST /perfil/editar llamado, body:', req.body, 'file:', req.file);
    next();
  },
  adminController.updateProfile
);

const checkFunctions = (obj, name) => {
  for (const key in obj) {
    if (typeof obj[key] !== 'function') {
      console.error(`❌ ${name}.${key} не является функцией!`);
    }
  }
};

checkFunctions(adminController, 'adminController');
checkFunctions(usuariosController, 'usuariosController');
checkFunctions(productosController, 'productosController');
checkFunctions(categoriasController, 'categoriasController');
checkFunctions(proveedoresController, 'proveedoresController');
checkFunctions(localizacionesController, 'localizacionesController');

module.exports = router;