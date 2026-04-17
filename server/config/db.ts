import mongoose from 'mongoose';
import {env} from './env';

export const connectDB = async () => {
    try {
        await mongoose.connect(env.mongo_url as string);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process with failure
    }
};