import mongoose from "mongoose";

export const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    teacher: {
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
    numberOfPeriodsInaweek: {
        type: Number,
        required: true,
        unique: false
    },
    OutCome: {
        type: String,
        required: true,
        unique: false
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

const Course = mongoose.model('Course', courseSchema);
export default Course;