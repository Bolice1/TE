import mongoose from 'mongoose'
import envConfiguration from './env.js'
//let us connect to the db 

export const connectDb = async () => {
    const connection = await mongoose.connect(envConfiguration.db);
    !connection ? console.log("Something went wrong while connecting to the db") : console.log("Database connected successfully")

    return connection;
}
