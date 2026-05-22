import PDFDocument from 'pdfkit';

export const renderPdfBuffer = async (writer: (doc: PDFKit.PDFDocument) => void) =>
  new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    writer(doc);
    doc.end();
  });
