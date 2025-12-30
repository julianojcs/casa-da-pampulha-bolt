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
  // Campos de check-in/out
  checkInDate?: Date;
  checkInTime?: string;
  checkOutDate?: Date;
  checkOutTime?: string;
  // Campos de hóspedes
  adultsCount?: number;
  childrenCount?: number;
  petsCount?: number;
  // Campos financeiros
  reservationValue?: number;
  // Campos de perfil
  hasReviews?: boolean;
  isHost?: boolean;
  originCountry?: string;
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
    // Campos de check-in/out
    checkInDate: { type: Date },
    checkInTime: { type: String },
    checkOutDate: { type: Date },
    checkOutTime: { type: String },
    // Campos de hóspedes
    adultsCount: { type: Number, default: 1 },
    childrenCount: { type: Number, default: 0 },
    petsCount: { type: Number, default: 0 },
    // Campos financeiros
    reservationValue: { type: Number },
    // Campos de perfil
    hasReviews: { type: Boolean, default: false },
    isHost: { type: Boolean, default: false },
    originCountry: { type: String },
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
