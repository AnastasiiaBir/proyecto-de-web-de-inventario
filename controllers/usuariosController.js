// controllers/usuariosController.js
const Usuario = require('../models/Usuario');
const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');

// Listado de usuarios
exports.listUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAllWithDetails();
    console.log('Renderizando lista de usuarios, total');
    res.render('admin/usuarios', { usuarios });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send('Error al obtener usuarios');
  }
};

// Añadir nuevo usuario
exports.getNuevoUsuario = (req, res) => {
  res.render('admin/nuevo_usuario');
};

exports.postNuevoUsuario = async (req, res) => {
  try {
    const { nombre, apellidos, email, telefono, rol_id, password } = req.body;
    await Usuario.add({ nombre, apellidos, email, telefono, rol_id, password });
    console.log(`Nuevo usuario agregado: ${email}`);
    res.redirect('/admin/usuarios');
  } catch (err) {
    console.error('Error al agregar usuario:', err);
    res.status(500).send('Error al agregar usuario');
  }
};

// Actualizar usuario (AJAX)
exports.updateUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await Usuario.update(id, data);
    console.log(`Usuario actualizado vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.json({ success: false });
  }
};

// Eliminar usuario (AJAX)
exports.deleteUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await Usuario.delete(id);
    console.log(`Usuario eliminado vía AJAX: ID ${id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.json({ success: false });
  }
};

// Exportar a PDF
exports.exportPDF = async (req, res) => {
  try {
    const usuarios = await Usuario.getAllWithDetails();
    const html = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Usuarios</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Listado de Usuarios</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            ${usuarios.map(u => `
              <tr>
                <td>${u.id}</td>
                <td>${u.nombre}</td>
                <td>${u.apellidos}</td>
                <td>${u.email}</td>
                <td>${u.telefono || ''}</td>
                <td>${u.rol_id === 1 ? 'Administrador' : 'Usuario'}</td>
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
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.pdf');
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
    const usuarios = await Usuario.getAllWithDetails();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Usuarios');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 25 },
      { header: 'Apellidos', key: 'apellidos', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Rol', key: 'rol', width: 15 },
    ];

    usuarios.forEach(u => {
      sheet.addRow({
        id: u.id,
        nombre: u.nombre,
        apellidos: u.apellidos,
        email: u.email,
        telefono: u.telefono || '',
        rol: u.rol_id === 1 ? 'Administrador' : 'Usuario',
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=usuarios.xlsx');
    await workbook.xlsx.write(res);
    res.end();
    console.log('Exportado a Excel');
  } catch (err) {
    console.error('Error al exportar a Excel:', err);
    res.status(500).send('Error al exportar a Excel');
  }
};