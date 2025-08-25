// controllers/categoriasController.js
const Categoria = require('../models/Categoria');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

// Listado de categorías
exports.listCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.getAllWithDetails();
    console.log('Renderizando lista de categorías');
    res.render('admin/categorias', { categorias });
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).send('Error al obtener categorías');
  }
};

// Añadir nueva categoría
exports.getNuevaCategoria = (req, res) => {
  res.render('admin/nueva_categoria');
};

exports.postNuevaCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    await Categoria.add({ nombre });
    console.log(`Nueva categoría agregada: ${nombre}`);
    res.redirect('/admin/categorias');
  } catch (err) {
    console.error('Error al agregar categoría:', err);
    res.status(500).send('Error al agregar categoría');
  }
};

// Actualizar categoría (AJAX)
exports.updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await Categoria.update(id, data);
    console.log(`Categoría actualizada vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar categoría:', err);
    res.json({ success: false });
  }
};

// Eliminar categoría (AJAX)
exports.deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    await Categoria.delete(id);
    console.log(`Categoría eliminada vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.json({ success: false });
  }
};

// Exportar categorías a PDF
exports.exportPDF = async (req, res) => {
  try {
    const categorias = await Categoria.getAllWithDetails();

    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Categorías</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Listado de Categorías</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
            </tr>
          </thead>
          <tbody>
            ${categorias.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.nombre}</td>
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
    res.setHeader('Content-Disposition', 'attachment; filename=categorias.pdf');
    res.send(pdfBuffer);
    console.log('Exportado a PDF');
  } catch (err) {
    console.error('Error al exportar a PDF:', err);
    res.status(500).send('Error al exportar a PDF');
  }
};

// Exportar categorías a Excel
exports.exportExcel = async (req, res) => {
  try {
    const categorias = await Categoria.getAllWithDetails();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Categorías');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
    ];

    categorias.forEach(c => {
      sheet.addRow({ id: c.id, nombre: c.nombre });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=categorias.xlsx');
    await workbook.xlsx.write(res);
    res.end();
    console.log('Exportado a Excel');
  } catch (err) {
    console.error('Error al exportar a Excel:', err);
    res.status(500).send('Error al exportar a Excel');
  }
};