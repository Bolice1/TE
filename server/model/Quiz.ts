import mongoose from 'mongoose'


export const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false

    },
    type: {
        enum: ['TEST','CAT', 'EXAM','test','exam','cat']
    },
    assignedAt: {
        type: Date,
        defaul: new Date()
    },
    avarageScore: {
        type: Number,
        required: true,
        unique: false
    },
    numberOfStudentsAssigned: {
        type: Number,
        required: true
    },
    startTime: {
        type: Date,
        required: true,
        default: new Date()
    },
    endTime: {
        type: Date,
        required: true,
        default: new Date()
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    }
});
// we are going to create the quiz model

export default mongoose.model("Quiz", quizSchema);