import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

TeacherSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

TeacherSchema.index({ email: 1 });
TeacherSchema.index({ isActive: 1 });

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
