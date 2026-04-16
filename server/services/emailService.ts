import nodemailer from 'nodemailer'
import { env } from '../config/env'

const transporter = nodemailer.createTransport({
    service: env.email_service,
    auth: {
        user: env.email_user,
        pass: env.email_pass
    }
}) 

export const sendReportToparents = async (to: string, subject: string, text: string) => {
    const mailOptions = {
        from: env.email_user,
        to,
        subject,
        text:`
        Muraho neza,
        
        Twifuzaga kubamenyesha ko umwana wanyu afite raporo y'ibizamini. Dore ibisobanuro:
        ${text}
        
        Murakoze,
        Ishuri rya TE
        `
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`Email sent to ${to}`)
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error)
    }
}   

export const sendPaymentReminderToparents = async (to: string, subject: string, text: string) => {
    const mailOptions = {
        from: env.email_user,
        to,
        subject,
        text:`
        Muraho neza,
        
        Twifuzaga kubamenyesha ko igihe cyo kwishyura cyageze. Dore ibisobanuro:
        ${text}
        
        Murakoze,
        Ishuri rya TE
        `
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log(`Email sent to ${to}`)
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error)
    }
}

