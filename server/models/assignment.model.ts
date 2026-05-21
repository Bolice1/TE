import mongoose from "mongoose";

export const assignmentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    title: {
        type: String,
        required: true,
        unique: false
    },
    assignmentDate: {
        type: Date,
        required: true,
        unique: false
    },
    participantsNumber:{
        type: Number,
        required: true,
        unique: false
    },
    participants:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    coach:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Teacher'
    },
    max:{
        type: String,
        required: true,
        unique: false
    },
    min:{
        type: String,
        required: true,
        unique: false
    }
})

const Assignment = mongoose.model('Assignment', assignmentSchema)
export default Assignment;