import puppeter from 'puppeteer';
import {env} from '../config/env.js'
import Student from '../model/Student.js';
import Report from '../model/Report.js';

export const generateReportCard = async (studentId: string, year: number) => {
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            throw new Error('Student not found');
        }
        const browser = await puppeter.launch();
        const page = await browser.newPage();
        await page.goto(`${env.forntendUrl}/report-card/${studentId}/${year}`, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // Save the PDF buffer to the database
        const report = new Report({
            student: student._id,
            year,
            storedAt: {
                link: `data:application/pdf;base64,${pdfBuffer.toString('base64')}`,
            },
        });
        await report.save();

        return report.storedAt.link;
    } catch (error) {
        console.error('Error generating report card:', error);
        throw error;
    }
};