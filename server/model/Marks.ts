import mongoose from 'mongoose';



export const marksSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    dateRecorded: {
        type: Date,
        default: new Date()
    }
});

export default mongoose.model("Marks", marksSchema);