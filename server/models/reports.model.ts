import mongoose from 'mongoose'

export const reportsModel = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    url: {
        type: String,
        required: true,
        unique: true
    }
})


const Reports = mongoose.model('Report', reportsModel);
export default Reports;