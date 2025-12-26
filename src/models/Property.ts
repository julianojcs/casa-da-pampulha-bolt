import mongoose, { Schema, Document } from 'mongoose';
import { IProperty } from '@/types';

export interface PropertyDocument extends Omit<IProperty, '_id'>, Document {}

const PropertySchema = new Schema<PropertyDocument>(
  {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    maxGuests: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    beds: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String, required: true },
    minNights: { type: Number, default: 1 },
    airbnbUrl: { type: String, required: true },
    airbnbCalendarUrl: { type: String },
    heroImage: { type: String, required: true },
    heroImages: [{ type: String }],
    welcomeMessage: { type: String, required: true },
    phone: { type: String },
    whatsapp: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Property = mongoose.models.Property || mongoose.model<PropertyDocument>('Property', PropertySchema);
