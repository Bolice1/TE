import mongoose from "mongoose";

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
    }
})

const Student = mongoose.model('Student', studentSchema)
export default Student;