import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    parents: {
        father: {
            name: {
                type: String,
                required: true
            },
            phoneNumber: {
                type: Number,
                required: true,
                unique: true
            },
            emailAddress: {
                type: String,
                required: false,
                unique: true
            }
        },
        mather: {
            name: {
                type: String,
                required: true,
            },
            phoneNumber: {
                type: Number,
                required: true,
                unique: true
            },
            emailAddress: {
                type: String,
                required: true,
                unique: true
            }
        }
    },
    location:{
        type: String,
        unique: false,
        required: true

    },
    payments:{
        ref: "Payment",
        type: String,
        unique: true
    }

})

export const Student = mongoose.model("Student",studentSchema);