const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generateProductosPDF = (productos, pathFile) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pathFile));

  doc.fontSize(18).text('Lista de Productos', { align: 'center' });
  doc.moveDown();

  productos.forEach(p => {
    doc.fontSize(12).text(`${p.id} - ${p.nombre} - ${p.marca} - ${p.precio} - ${p.stock}`);
  });

  doc.end();
};
