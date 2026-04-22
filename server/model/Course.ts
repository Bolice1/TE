import mongoose from 'mongoose'

export const courseSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        unique: true
    },
    taughtBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }],
    numberOfUnits: {
        type: Number,
        required: true
    }

});

export const Course = mongoose.model("Course",courseSchema)