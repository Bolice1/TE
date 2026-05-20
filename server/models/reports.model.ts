import mongoose from 'mongoose'

export const reportsModel = new mongoose.Schema({
    student:{
        type:mongoose.Schema.types.objectId
        ref:'Student'
    }
})