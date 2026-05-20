import mongoose from 'mongoose'
import { string } from '../config/env'

export const teacherModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    email: {
        required: true,
        unique: true,
        type: String
    },
    address: {
        required: true,
        unique: false,
        type: String
    },
    coachingName: {
        required: true,
        unique: true,
        type: string
    }
})

const TeacherSchema = 
