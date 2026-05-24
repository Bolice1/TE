import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coach from '../models/coach.model.js';
import envConfiguration from '../config/env.js';
import bcrypt from 'bcrypt';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'komezusenge457@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'N@ome#2025';
const MONGO_URI = process.env.MONGO_URI || envConfiguration.db;

const SALT_ROUNDS = 10;

const run = async () => {
  try {
    if (!ADMIN_EMAIL) {
      console.error('ADMIN_EMAIL is required.');
      process.exit(1);
    }

    if (!MONGO_URI) {
      console.error('Mongo connection string is required via MONGO_URI or DB env.');
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI as string);
    const existing = await Coach.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Super admin already exists, skipping.');
      process.exit(0);
    }

    const passwordToUse = ADMIN_PASSWORD || Math.random().toString(36).slice(2, 10) + 'A1!';
    const hashed = await bcrypt.hash(passwordToUse, SALT_ROUNDS);
    const admin = await Coach.create({
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      coachingName: 'Admin',
      address: 'Head Office',
      password: hashed,
      role: 'SUPER_ADMIN',
      isActive: true,
      mustChangePassword: true,
    });

    console.log('Created Super Admin:', admin.email);
    console.log('Password:', passwordToUse);
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err);
    process.exit(1);
  }
};

run();
