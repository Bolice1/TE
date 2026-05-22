import mongoose from "mongoose";


export const markSchema = new mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    choach: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Choach"
    },
    marks: {
        type: String,
        required: true,
        unique: false
    },
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
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

const Marks = mongoose.model('Marks', markSchema)
export default Marks;