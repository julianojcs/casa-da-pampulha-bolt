import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IPreRegistration {
  _id?: string;
  name: string;
  email?: string;
  phone: string;
  token: string;
  status: 'pending' | 'registered' | 'expired';
  expiresAt: Date;
  registeredUserId?: string;
  notes?: string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PreRegistrationDocument extends Omit<IPreRegistration, '_id'>, Document {}

const PreRegistrationSchema = new Schema<PreRegistrationDocument>(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'registered', 'expired'],
      default: 'pending',
    },
    expiresAt: { type: Date, required: true },
    registeredUserId: { type: String },
    notes: { type: String },
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Índice para busca por telefone e status
PreRegistrationSchema.index({ phone: 1 });
PreRegistrationSchema.index({ status: 1 });

// Método estático para gerar token único
PreRegistrationSchema.statics.generateToken = function (): string {
  return crypto.randomBytes(32).toString('hex');
};

export const PreRegistration =
  mongoose.models.PreRegistration ||
  mongoose.model<PreRegistrationDocument>('PreRegistration', PreRegistrationSchema);
