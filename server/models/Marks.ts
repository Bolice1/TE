import mongoose from "mongoose";
import { Student } from "./Student";
import { Teacher } from "./Teacher";

const marksSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    grade: { type: String, required: true }
}, {
    timestamps: true
});

export const Marks = mongoose.model('Marks', marksSchema);
