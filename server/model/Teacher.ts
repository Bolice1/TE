import mongoose from 'mongoose'

// we are going to work on the teachers' side 

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ["HABANABASHAKA Emmanuel"]
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    }
});

export default mongoose.model("Teacher",teacherSchema);