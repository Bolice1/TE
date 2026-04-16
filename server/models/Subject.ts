import mongoose from "mongoose";
import { Student } from "./Student";
import { Teacher } from "./Teacher";

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

export const Subject = mongoose.model('Subject', subjectSchema);