import mongoose from 'mongoose'

export const coachModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    email: {
        required: true,
        unique: true,
        type: String
    },
    address: {
        required: true,
        unique: false,
        type: String
    },
    coachingName: {
        required: true,
        unique: true,
        type: String
    },
    password:{
        required: true,
        unique: true,
        type: String
    }
})

const Coach = mongoose.model('Coach', coachModel)
export default Coach;
