import { buildParentReportEmailHtml } from './branding.js';
import { deliverEmail } from './email.js';

export const sendParentReportEmail = async (params: {
  parentEmail: string;
  parentName: string;
  studentName: string;
  reportTitle: string;
  pdfBuffer: Buffer;
}) => {
  const { parentEmail, parentName, studentName, reportTitle, pdfBuffer } = params;

  return deliverEmail({
    to: parentEmail,
    subject: `${reportTitle} for ${studentName}`,
    html: buildParentReportEmailHtml({
      parentName,
      studentName,
      reportTitle,
    }),
    attachments: [
      {
        filename: `${studentName.replace(/\s+/g, '_').toLowerCase()}-report-card.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};
