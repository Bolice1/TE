import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coach from '../models/coach.model.js';

dotenv.config();

async function main() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/te-dev';
  await mongoose.connect(uri, { autoIndex: false });
  console.log('Connected to DB', uri);

  const res = await Coach.updateMany(
    { $or: [{ role: { $exists: false } }, { isActive: { $exists: false } }] },
    { $set: { role: 'COACH', isActive: true } }
  );

  console.log('Migration complete:', (res as any).nModified ?? (res as any).modifiedCount ?? (res as any).modifiedCount, 'documents updated');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
