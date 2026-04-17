import * as Student from '../models/Student'
import * as Teacher from '../models/Teacher'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Request, Response } from 'express'

const { env } = require('../config/env')
// let us deal with teachers' account 

export const registerTeacher = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body

        // check if the teacher already exists
        const existingTeacher = await Teacher.findOne({ email })
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher already exists' })
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // create a new teacher
        const newTeacher = new Teacher({
            name,
            email,
            password: hashedPassword
        })

        await newTeacher.save()

        res.status(201).json({ message: 'Teacher registered successfully' })
    } catch (error) {
        console.error('Error registering teacher:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const loginTeacher = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        // check if the teacher exists
        const teacher = await Teacher.findOne({ email })
        if (!teacher) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        // compare the password
        const isMatch = await bcrypt.compare(password, teacher.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' })
        }

        // create a JWT token
        const token = jwt.sign({ id: teacher._id }, env.jwt_secret as string, { expiresIn: env.jwt_expires_in })

        res.json({ token })
    } catch (error) {
        console.error('Error logging in teacher:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

// let us deal with students', students won't login , its' just for teacher to manage them

export const createStudent = async (req: Request, res: Response) => {
    try {
        const {f
    }

