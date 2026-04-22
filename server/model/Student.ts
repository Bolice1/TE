import mongoose from 'mongoose'


// we are going to create the student schema 

const studentSchema = new mongoose.Schema({
    name: String,
    year: String,
    StudentId: String,
    parents: {
        name: String,
        gender: {
            type: String,
            enum: [
                "Male", "Female"
            ]
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true
        }
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    }

});

export default mongoose.model("Student", studentSchema);
