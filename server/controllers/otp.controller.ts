// generate,temporary-store,validate,delete
import crypto from 'crypto'
import type { Request, Response } from 'express'
import OTP from '../models/otp.model.schema.js'
import envConfiguration from '../config/env.js'

export const generateOtp = (): string => {
    return crypto.randomBytes(6).toString('hex')
}

export const saveOtp = async (req: Request, res: Response) => {
    try {
        const otp = generateOtp()
        const { email } = req.body;
        const expiresAt = new Date(
            Date.now() + Number(envConfiguration.expires_at)
        );
        const tempOtp = await OTP.create({
            email,
            otp,
            expiresAt

        })
    } catch (error) {
        console.log(error)
    }
}

// let us try to delete the otp automatically 
