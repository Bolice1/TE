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


