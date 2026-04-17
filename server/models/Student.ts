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
                type: String,
                required: true,
                unique: true
            }
        },
        mother: {
            name: {
                type: String,
                required: true,
            },
            phoneNumber: {
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

    }

})

export const Student = mongoose.model("Student",studentSchema);