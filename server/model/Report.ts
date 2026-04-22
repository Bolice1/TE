import mongoose from 'mongoose'

const reportCardSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    storedAt: {
        link: String,
        required: true,
        unique: true
    }
})

export default mongoose.model("Report", reportCardSchema)