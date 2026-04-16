import mongoose, { mongo } from "mongoose";
// we are going to define the teacher' schema

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,
        enum: { "HABANABASHAKA Emmanuel": "HABANABASHAKA Emmy", "habanabashaka emmy": "Habanabashaka Emmy" }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        unique: true
    },
    signature: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    }
})

export const Teacher = mongoose.model("Teacher",teacherSchema)