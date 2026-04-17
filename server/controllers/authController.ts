import { Student } from '../models/Student'
import { Teacher } from '../models/Teacher'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { Request, Response } from 'express'

const { env } = require('../config/env')
// let us deal with teachers' account 

export const registerTeacher = async (req: Request, res: Response) => {
    try {
        const existingTeacher = await Teacher.findOne({ email: req.body.email })
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher with this email already exists' })
        }

        // hash the password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        // create a new teacher
        const teacher = await Teacher.create({
            ...req.body,
            password: hashedPassword
        })

        res.status(201).json({ message: 'Teacher registered successfully', teacher })

    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "Duplicate field value",
                field: error.keyValue
            });
        }

        return res.status(500).json({
            message: "Failed to create teacher",
            error: error.message
        });
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

    // CREATE student
    export const createStudent = async (req: Request, res: Response) => {
        try {
            // does the student already exists ? 
            const existingStudent = await Student.findOne({ studentId: req.body.studentId });
            if (existingStudent) {
                return res.status(400).json({
                    message: "Student with this ID already exists"
                });
            }
            // create a new student 
            const student = await Student.create(req.body);
            return res.status(201).json({
                success: true,
                data: student
            });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Duplicate field value",
                    field: error.keyValue
                });
            }

            return res.status(500).json({
                message: "Failed to create student",
                error: error.message
            });
        }
    };

    // GET all students
    export const getStudents = async (_req: Request, res: Response) => {
        try {
            const students = await Student.find();

            return res.status(200).json({
                success: true,
                count: students.length,
                data: students
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Failed to fetch students",
                error: error.message
            });
        }
    };

    // GET single student by ID
    export const getStudentById = async (req: Request, res: Response) => {
        try {
            const student = await Student.findById(req.params.id);

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: student
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Error fetching student",
                error: error.message
            });
        }
    };

    // UPDATE student
    export const updateStudent = async (req: Request, res: Response) => {
        try {
            const student = await Student.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            return res.status(200).json({
                success: true,
                data: student
            });
        } catch (error: any) {
            if (error.code === 11000) {
                return res.status(400).json({
                    message: "Duplicate field value",
                    field: error.keyValue
                });
            }

            return res.status(500).json({
                message: "Failed to update student",
                error: error.message
            });
        }
    };

    // DELETE student
    export const deleteStudent = async (req: Request, res: Response)
        => {
        try {
            const student = await Student.findByIdAndDelete(req.params.id);

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Student deleted successfully"
            });
        } catch (error: any) {
            return res.status(500).json({
                message: "Failed to delete student",
                error: error.message
            });
        }
    };