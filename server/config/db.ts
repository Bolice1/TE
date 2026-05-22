import mongoose from 'mongoose';
import envConfiguration from './env.js';

export const connectDb = async () => {
  const connection = await mongoose.connect(envConfiguration.db);
  console.log(`Database connected: ${connection.connection.name}`);
  return connection;
};
