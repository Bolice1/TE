import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Admin schema inline to avoid import issues with the seed script
const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

async function seedAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI environment variable is not set");
    console.log("Please set MONGODB_URI in your environment variables");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully");

    // Admin credentials - as specified by the user
    const adminData = {
      email: "komezusenge457@gmail.com",
      password: "bolice123",
      firstName: "KOMEZUSENGE",
      lastName: "Bolice",
      role: "admin",
      isActive: true,
    };

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log("Admin user already exists with email:", adminData.email);
      console.log("Updating password...");
      
      // Update password in case it changed
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      await Admin.updateOne(
        { email: adminData.email },
        { password: hashedPassword }
      );
      console.log("Admin password updated successfully");
    } else {
      // Create new admin
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      
      const admin = new Admin({
        ...adminData,
        password: hashedPassword,
      });

      await admin.save();
      console.log("Admin user created successfully!");
      console.log("Email:", adminData.email);
      console.log("Name:", adminData.firstName, adminData.lastName);
    }

    console.log("\n=== Admin Login Credentials ===");
    console.log("Email: komezusenge457@gmail.com");
    console.log("Password: bolice123");
    console.log("================================\n");

  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

seedAdmin();
