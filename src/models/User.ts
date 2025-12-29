import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IHost } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const HostSchema = new Schema<Omit<IHost, '_id'>>(
  {
    bio: { type: String, required: true },
    role: { type: String, required: true },
    languages: [{ type: String }],
    responseTime: { type: String, required: true },
    responseRate: { type: String, required: true },
    isSuperhost: { type: Boolean, default: false },
    joinedDate: { type: Date, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'guest'], required: true },
    phone: { type: String },
    avatar: { type: String },
    reservationCode: { type: String },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    host: { type: HostSchema, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
