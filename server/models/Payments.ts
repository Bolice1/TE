import mongoose from "mongoose";
import { Student } from "./Student";

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    }
});

export const Payment = mongoose.model("Payment", paymentSchema);