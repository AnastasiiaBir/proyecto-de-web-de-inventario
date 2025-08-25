// controllers/userController.js
const Producto = require('../models/Producto');
const Proveedor = require('../models/Proveedor');
const Categoria = require('../models/Categoria');
const Localizacion = require('../models/Localizacion');

exports.getDashboard = (req, res) => {
  res.render('user/dashboard', { user: req.session.user });
};

exports.listProductos = async (req, res) => {
  try {
    const productos = await Producto.getAllWithDetails();
    res.render('user/productos', { productos, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.send('Error al obtener productos');
  }
};

exports.listProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.getAll();
    res.render('user/proveedores', { proveedores, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.send('Error al obtener proveedores');
  }
};

exports.listCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.getAll();
    res.render('user/categorias', { categorias, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.send('Error al obtener categorías');
  }
};

exports.listLocalizaciones = async (req, res) => {
  try {
    const localizaciones = await Localizacion.getAll();
    res.render('user/localizaciones', { localizaciones, user: req.session.user });
  } catch (err) {
    console.error(err);
    res.send('Error al obtener localizaciones');
  }
};

exports.getPerfil = (req, res) => {
  res.render('user/perfil', { user: req.session.user });
};
