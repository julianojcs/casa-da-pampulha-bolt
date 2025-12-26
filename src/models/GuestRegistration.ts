import mongoose, { Schema, Document } from 'mongoose';
import { IGuestRegistration } from '@/types';

export interface GuestRegistrationDocument extends Omit<IGuestRegistration, '_id'>, Document {}

const GuestRegistrationSchema = new Schema<GuestRegistrationDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    documentType: { type: String, required: true },
    document: { type: String },
    documentImage: { type: String },
    nationality: { type: String },
    birthDate: { type: Date },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    guests: [{
      name: { type: String, required: true },
      age: { type: Number, required: true },
      document: { type: String }
    }],
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    specialRequests: { type: String },
    notes: { type: String },
    vehiclePlates: [{
      brand: { type: String },
      model: { type: String },
      color: { type: String },
      plate: { type: String }
    }],
    agreedToRules: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const GuestRegistration = mongoose.models.GuestRegistration || mongoose.model<GuestRegistrationDocument>('GuestRegistration', GuestRegistrationSchema);
