// controllers/localizacionesController.js
const Localizacion = require('../models/Localizacion');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

// Listado de localizaciones
exports.listLocalizaciones = async (req, res) => {
  try {
    const localizaciones = await Localizacion.getAllWithDetails();
    console.log('Renderizando lista de localizaciones');
    res.render('admin/localizaciones', { localizaciones });
  } catch (err) {
    console.error('Error al obtener localizaciones:', err);
    res.status(500).send('Error al obtener localizaciones');
  }
};

// Añadir nueva localización
exports.getNuevaLocalizacion = (req, res) => {
  res.render('admin/nueva_localizacion');
};

exports.postNuevaLocalizacion = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    await Localizacion.add({ nombre, descripcion });
    console.log(`Nueva localización agregada: ${nombre}`);
    res.redirect('/admin/localizaciones');
  } catch (err) {
    console.error('Error al agregar localización:', err);
    res.status(500).send('Error al agregar localización');
  }
};

// Actualizar localización (AJAX)
exports.updateLocalizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await Localizacion.update(id, data);
    console.log(`Localización actualizada vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar localización:', err);
    res.json({ success: false });
  }
};

// Eliminar localización (AJAX)
exports.deleteLocalizacion = async (req, res) => {
  try {
    const { id } = req.params;
    await Localizacion.delete(id);
    console.log(`Localización eliminada vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar localización:', err);
    res.json({ success: false });
  }
};

// Exportar localizaciones a PDF (Puppeteer)
exports.exportPDF = async (req, res) => {
  try {
    const localizaciones = await Localizacion.getAllWithDetails();
    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Localizaciones</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Listado de Localizaciones</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            ${localizaciones.map(l => `
              <tr>
                <td>${l.id}</td>
                <td>${l.nombre}</td>
                <td>${l.descripcion || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=localizaciones.pdf');
    res.send(pdfBuffer);
    console.log('Exportado a PDF');
  } catch (err) {
    console.error('Error al exportar a PDF:', err);
    res.status(500).send('Error al exportar a PDF');
  }
};

// Exportar localizaciones a Excel
exports.exportExcel = async (req, res) => {
  try {
    const localizaciones = await Localizacion.getAllWithDetails();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Localizaciones');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Descripción', key: 'descripcion', width: 50 },
    ];

    localizaciones.forEach(l => {
      sheet.addRow({
        id: l.id,
        nombre: l.nombre,
        descripcion: l.descripcion
      });
    });

    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename=localizaciones.xlsx');
    await workbook.xlsx.write(res);
    res.end();
    console.log('Exportado a Excel');
  } catch (err) {
    console.error('Error al exportar a Excel:', err);
    res.status(500).send('Error al exportar a Excel');
  }
};