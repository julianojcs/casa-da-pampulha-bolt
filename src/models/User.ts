import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IHost, IStaff, IChecklistItem, IPaymentInfo } from '@/types';

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
    phoneVisibility: { type: String, enum: ['public', 'restricted', 'private'], default: 'restricted' },
  },
  { _id: false }
);

const ChecklistItemSchema = new Schema<Omit<IChecklistItem, '_id'>>(
  {
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    notes: { type: String },
  },
  { _id: true }
);

const PaymentInfoSchema = new Schema<IPaymentInfo>(
  {
    bankName: { type: String },
    bankBranch: { type: String },
    accountNumber: { type: String },
    accountType: { type: String, enum: ['corrente', 'poupanca'] },
    pixKey: { type: String },
    pixKeyType: { type: String, enum: ['cpf', 'email', 'telefone', 'aleatoria'] },
    preferredPaymentMethod: { type: String, enum: ['pix', 'transferencia'] },
  },
  { _id: false }
);

const StaffSchema = new Schema<Omit<IStaff, '_id'>>(
  {
    nickname: { type: String },
    jobType: {
      type: String,
      enum: ['piscineiro', 'jardineiro', 'faxineira', 'manutencao', 'outro'],
      required: true
    },
    jobTitle: { type: String },
    hireDate: { type: Date },
    salary: { type: Number, default: 0 },
    salaryType: { type: String, enum: ['diaria', 'mensal'], default: 'diaria' },
    paymentInfo: { type: PaymentInfoSchema, default: null },
    checklistTemplate: [ChecklistItemSchema],
    currentChecklist: [ChecklistItemSchema],
    lastChecklistReset: { type: Date },
    workDays: [{ type: String }],
    notes: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, unique: true, sparse: true, lowercase: true },
    password: { type: String },
    name: { type: String, required: true },
    role: { type: String, enum: ['admin', 'guest', 'staff'], required: true },
    phone: { type: String },
    hasWhatsapp: { type: Boolean, default: false },
    avatar: { type: String },
    reservationCode: { type: String },
    checkInDate: { type: Date },
    checkOutDate: { type: Date },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    isHost: { type: Boolean, default: false }, // For guests: indicates if they are a host on Airbnb
    host: { type: HostSchema, default: null }, // For admins: host profile data
    staff: { type: StaffSchema, default: null },
    // Guest profile fields
    document: { type: String },
    documentType: { type: String, enum: ['CPF', 'RG', 'Passaporte', 'Outro'], default: 'CPF' },
    nationality: { type: String },
    birthDate: { type: Date },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'Brasil' },
    notes: { type: String },
    agreedToRules: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();

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
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
