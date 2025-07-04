const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateAlertPDF({ monitor, status, logDetails, prevStatus }) {
  const doc = new PDFDocument();
  const fileName = `alert-${monitor.id}-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../temp', fileName);

  // Ensure temp directory exists
  if (!fs.existsSync(path.join(__dirname, '../temp'))) {
    fs.mkdirSync(path.join(__dirname, '../temp'));
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  doc.fontSize(18).text('API Monitor Alert', { underline: true });
  doc.moveDown();

  doc.fontSize(12)
    .text(`URL: ${monitor.url}`)
    .text(`Checked At (UTC): ${new Date().toISOString()}`)
    .text(`Status: ${status}`)
    .text(`Previous Status: ${prevStatus || 'N/A'}`)
    .text(`HTTP Code: ${logDetails.statusCode}`)
    .text(`Response Time: ${logDetails.responseTime} ms`)
    .text(`Reason: Status changed from ${prevStatus} to ${status}`);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

module.exports = generateAlertPDF;
