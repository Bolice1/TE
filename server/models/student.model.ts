import mongoose from "mongoose";
import { time } from "node:console";

export const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    class: {
        type: String,
        required: true,
        unique: false
    },
    year: {
        type: String,
        required: true,
        unique: false
    },
    parents: {
        type: String,
        required: true,
        unique: false
    },
    isDeleted: {
        type: Boolean,
        required: true,
        default: false
    },
    
    deletedAt: {
        type: Date,
        required: false,
        default: null
    }
})

const Student = mongoose.model('Student', studentSchema)
export default Student;