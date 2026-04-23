import mongoose, { Schema, Document, Model } from "mongoose";

interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface IGuardian {
  name?: string;
  relationship?: string;
  phone?: string;
  email?: string;
}

interface IParent {
  name: string;
  relationship: "father" | "mother" | "guardian";
  phone: string;
  email?: string;
  isEmergencyContact: boolean;
}

export interface IStudent extends Document {
  _id: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  address?: IAddress;
  isOrphan: boolean;
  guardianInfo?: IGuardian;
  parents: IParent[];
  enrollmentDate: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true },
  },
  { _id: false }
);

const GuardianSchema = new Schema<IGuardian>(
  {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const ParentSchema = new Schema<IParent>(
  {
    name: { type: String, required: true, trim: true },
    relationship: {
      type: String,
      required: true,
      enum: ["father", "mother", "guardian"],
    },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    isEmergencyContact: { type: Boolean, default: false },
  },
  { _id: false }
);

const StudentSchema = new Schema<IStudent>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Teacher ID is required"],
      index: true,
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
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: AddressSchema,
    isOrphan: {
      type: Boolean,
      default: false,
    },
    guardianInfo: GuardianSchema,
    parents: [ParentSchema],
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

StudentSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

StudentSchema.index({ teacherId: 1, isActive: 1 });
StudentSchema.index({ teacherId: 1, lastName: 1 });

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
