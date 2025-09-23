// controllers/productosController.js
const Producto = require('../models/Producto');
const Categoria = require('../models/Categoria');
const Proveedor = require('../models/Proveedor');
const Localizacion = require('../models/Localizacion');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

// Listado de productos con filtros
exports.listProductos = async (req, res) => {
  console.log('=== listProductos вызван ==='); // <--- проверяем, вызывается ли вообще
  try {
    const categorias = await Categoria.getAllWithDetails();
    const proveedores = await Proveedor.getAllWithDetails();
    const localizaciones = await Localizacion.getAllWithDetails();

    console.log('Categorias disponibles:', categorias.length);
    console.log('Proveedores disponibles:', proveedores.length);
    console.log('Localizaciones disponibles:', localizaciones.length);

    // Фильтры из GET-параметров (как у пользователя)
    const filters = {
      nombre: req.query.nombre || null,
      marca: req.query.marca || null,
      categoria: req.query.categoria || null,
      proveedor: req.query.proveedor || null,
      precioMax: req.query.precio || null,
      costoMax: req.query.costo || null,
      stockMin: req.query.stockMin || null,
      localizacion: req.query.localizacion || null
    };
    console.log('listProductos: filters', filters);

    const productos = await Producto.getAllWithDetails();
    console.log('listProductos: найдено productos', productos.length);

    res.render('admin/productos', { productos, user: req.session.user, req, categorias, proveedores, localizaciones });
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
};

// Añadir nuevo producto
exports.getNuevoProducto = async (req, res) => {
  try {
    const categorias = await Categoria.getAllWithDetails();
    const proveedores = await Proveedor.getAllWithDetails();
    const localizaciones = await Localizacion.getAllWithDetails();
    res.render('admin/nuevo_producto', { categorias, proveedores, localizaciones });
  } catch (err) {
    console.error('Error al obtener datos para nuevo producto:', err);
    res.status(500).send('Error al cargar formulario');
  }
};

exports.postNuevoProducto = async (req, res) => {
  try {
    await Producto.add(req.body);
    console.log(`Nuevo producto agregado: ${req.body.nombre}`);
    res.redirect('/admin/productos');
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).send('Error al agregar producto');
  }
};

// Obtener todas las opciones para selects (proveedores, categorias, localizaciones)
exports.getOptions = async (req, res) => {
  try {
    const proveedores = await Proveedor.getAllWithDetails(); // {id, nombre}
    const categorias = await Categoria.getAllWithDetails();
    const localizaciones = await Localizacion.getAllWithDetails();

    res.json({ proveedores, categorias, localizaciones });
  } catch (err) {
    console.error('Error al obtener opciones:', err);
    res.status(500).json({ proveedores: [], categorias: [], localizaciones: [] });
  }
};

// Actualizar producto (inline / doble click)
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== updateProducto ===');
    console.log('ID del producto:', id);
    console.log('Body recibido:', req.body);

    if (!id) {
      console.error('ERROR: No se recibió ID del producto');
      return res.json({ success: false, message: 'ID no recibido' });
    }

    // req.body приходит вида { campo: valor }
    const [field, value] = Object.entries(req.body)[0];
    console.log('Campo a actualizar:', field, 'Valor:', value);

    const data = {};
    if (field === 'categoria_id') {
      data.categoria_ids = [parseInt(value)];
    } else if (field === 'proveedor_id') {
      data.proveedor_ids = [parseInt(value)];
    } else if (field === 'localizacion_id') {
      data.localizacion_id = parseInt(value);
    } else {
      data[field] = value;
    }

    console.log('Data final que se enviará a Producto.update():', data);

    await Producto.update(id, data);
    console.log(`Producto ID ${id} actualizado correctamente`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.json({ success: false });
  }
};

// Eliminar producto (AJAX)
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await Producto.delete(id);
    console.log(`Producto eliminado vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.json({ success: false });
  }
};

// Exportar a PDF
exports.exportPDF = async (req, res) => {
  try {
    const productos = await Producto.getAllWithDetails();
    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Productos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Listado de Productos</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Localización</th>
              <th>Precio</th>
              <th>Costo</th>
              <th>Medida</th>
              <th>Stock</th>
              <th>Stock mínimo</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${productos.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.marca}</td>
                <td>${p.categoria_nombre || ''}</td>
                <td>${p.proveedor_nombre || ''}</td>
                <td>${p.localizacion_nombre || ''}</td>
                <td>${p.precio}</td>
                <td>${p.costo}</td>
                <td>${p.medida || ''}</td>
                <td>${p.stock}</td>
                <td>${p.stock_minimo}</td>
                <td>${p.observaciones || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=productos.pdf');
    res.send(pdfBuffer);
    console.log('Exportado a PDF');
  } catch (err) {
    console.error('Error al exportar a PDF:', err);
    res.status(500).send('Error al exportar a PDF');
  }
};

// Exportar a Excel
exports.exportExcel = async (req, res) => {
  try {
    const productos = await Producto.getAllWithDetails();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Productos');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Marca', key: 'marca', width: 20 },
      { header: 'Categoría', key: 'categoria', width: 20 },
      { header: 'Proveedor', key: 'proveedor', width: 20 },
      { header: 'Localización', key: 'localizacion', width: 20 },
      { header: 'Precio', key: 'precio', width: 15 },
      { header: 'Costo', key: 'costo', width: 15 },
      { header: 'Medida', key: 'medida', width: 15 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Stock mínimo', key: 'stock_minimo', width: 10 },
      { header: 'Observaciones', key: 'observaciones', width: 30 }
    ];

    productos.forEach(p => {
      sheet.addRow({
        id: p.id,
        nombre: p.nombre,
        marca: p.marca,
        categoria: p.categoria_nombre || '',
        proveedor: p.proveedor_nombre || '',
        localizacion: p.localizacion_nombre || '',
        precio: p.precio,
        costo: p.costo,
        medida: p.medida || '',
        stock: p.stock,
        stock_minimo: p.stock_minimo,
        observaciones: p.observaciones || ''
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=productos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
    console.log('Exportado a Excel');
  } catch (err) {
    console.error('Error al exportar a Excel:', err);
    res.status(500).send('Error al exportar a Excel');
  }
};
