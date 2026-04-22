import nodemailer from 'nodemailer'
import {env} from '../config/env.js'

const transporter = nodemailer.createTransport({
   host: env.emailservice,
   port: parseInt(env.emailPort),
   secure: env.emailSecure === 'true', // true for 465, false for other ports
   auth: {
     user: env.emailUser,
     pass: env.emailPass,
   },
 })


export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const info = await transporter.sendMail({
            from: env.emailUser,
            to,
            subject,
            text,
        });
        console.log('Email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};