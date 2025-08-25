// controllers/proveedoresController.js
const Proveedor = require('../models/Proveedor');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

// Listado de proveedores
exports.listProveedores = async (req, res) => {
  try {
    const proveedores = await Proveedor.getAllWithDetails();
    console.log('Renderizando lista de proveedores');
    res.render('admin/proveedores', { proveedores });
  } catch (err) {
    console.error('Error al obtener proveedores:', err);
    res.status(500).send('Error al obtener proveedores');
  }
};

// Añadir nuevo proveedor
exports.getNuevoProveedor = (req, res) => {
  res.render('admin/nuevo_proveedor');
};

exports.postNuevoProveedor = async (req, res) => {
  try {
    const { nombre, contacto, telefono, email } = req.body;
    await Proveedor.add({ nombre, contacto, telefono, email });
    console.log(`Nuevo proveedor agregado: ${nombre}`);
    res.redirect('/admin/proveedores');
  } catch (err) {
    console.error('Error al agregar proveedor:', err);
    res.status(500).send('Error al agregar proveedor');
  }
};

// Actualizar proveedor (AJAX)
exports.updateProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await Proveedor.update(id, data);
    console.log(`Proveedor actualizado vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar proveedor:', err);
    res.json({ success: false });
  }
};

// Eliminar proveedor (AJAX)
exports.deleteProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    await Proveedor.delete(id);
    console.log(`Proveedor eliminado vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar proveedor:', err);
    res.json({ success: false });
  }
};

// Exportar proveedores a PDF (Puppeteer)
exports.exportPDF = async (req, res) => {
  try {
    const proveedores = await Proveedor.getAllWithDetails();
    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Proveedores</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Listado de Proveedores</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            ${proveedores.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>${p.contacto}</td>
                <td>${p.telefono || ''}</td>
                <td>${p.email || ''}</td>
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
    res.setHeader('Content-Disposition', 'attachment; filename=proveedores.pdf');
    res.send(pdfBuffer);
    console.log('Exportado a PDF');
  } catch (err) {
    console.error('Error al exportar a PDF:', err);
    res.status(500).send('Error al exportar a PDF');
  }
};

// Exportar proveedores a Excel
exports.exportExcel = async (req, res) => {
  try {
    const proveedores = await Proveedor.getAllWithDetails();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Proveedores');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 30 },
      { header: 'Contacto', key: 'contacto', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
    ];

    proveedores.forEach(p => {
      sheet.addRow({
        id: p.id,
        nombre: p.nombre,
        contacto: p.contacto,
        telefono: p.telefono,
        email: p.email
      });
    });

    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition','attachment; filename=proveedores.xlsx');
    await workbook.xlsx.write(res);
    res.end();
    console.log('Exportado a Excel');
  } catch (err) {
    console.error('Error al exportar a Excel:', err);
    res.status(500).send('Error al exportar a Excel');
  }
};