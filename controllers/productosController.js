const Producto = require('../models/Producto');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

// Listado de productos
exports.listProductos = async (req, res) => {
  try {
    const productos = await Producto.getAllWithDetails();
    console.log('Renderizando lista de productos');
    res.render('admin/productos', { productos });
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
};

// Añadir nuevo producto
exports.getNuevoProducto = (req, res) => {
  res.render('admin/nuevo_producto');
};

exports.postNuevoProducto = async (req, res) => {
  try {
    const { nombre, marca, precio, costo, stock } = req.body;
    await Producto.add({ nombre, marca, precio, costo, stock });
    console.log(`Nuevo producto agregado: ${nombre}`);
    res.redirect('/admin/productos');
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).send('Error al agregar producto');
  }
};

// Actualizar producto (AJAX)
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await Producto.update(id, data);
    console.log(`Producto actualizado vía AJAX: ID ${id}`);
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
              <th>Precio</th>
              <th>Costo</th>
              <th>Stock</th>
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
                <td>${p.precio}</td>
                <td>${p.costo}</td>
                <td>${p.stock}</td>
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
      { header: 'Precio', key: 'precio', width: 15 },
      { header: 'Costo', key: 'costo', width: 15 },
      { header: 'Stock', key: 'stock', width: 15 },
    ];

    productos.forEach(p => {
      sheet.addRow({
        id: p.id,
        nombre: p.nombre,
        marca: p.marca,
        categoria: p.categoria_nombre || '',
        proveedor: p.proveedor_nombre || '',
        precio: p.precio,
        costo: p.costo,
        stock: p.stock
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
