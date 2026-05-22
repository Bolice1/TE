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
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>${reportTitle}</h2>
        <p>Hello ${parentName},</p>
        <p>Please find attached the academic report card for ${studentName}.</p>
      </div>
    `,
    attachments: [
      {
        filename: `${studentName.replace(/\s+/g, '_').toLowerCase()}-report-card.pdf`,
        content: pdfBuffer,
      },
    ],
  });
};
