import nodemailer from 'nodemailer'
import { env } from '../config/env'

const transporter = nodemailer.createTransport({
    service: env.email_service,
    auth: {
        user: env.email_user,
        pass: env.email_pass
    }
}) 

