import mongoose, { Schema, Document } from 'mongoose';
import { IProperty } from '@/types';

export interface PropertyDocument extends Omit<IProperty, '_id'>, Document {}

// Using Schema<any> to allow Decimal128 type for rating field
const PropertySchema = new Schema<any>(
  {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    logo: { type: String }, // Logo da propriedade (Cloudinary)
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
    rating: { type: Schema.Types.Decimal128, required: true },
    checkInTime: { type: String, required: true },
    checkOutTime: { type: String, required: true },
    minNights: { type: Number, default: 1 },
    airbnbUrl: { type: String, required: true },
    airbnbCalendarUrl: { type: String },
    heroImage: { type: String, required: true },
    heroImages: [{ type: String }],
    welcomeMessage: { type: String, required: true },
    phone: { type: String },
    phoneVisibility: { type: String, enum: ['public', 'restricted', 'private'], default: 'restricted' },
    whatsapp: { type: String },
    email: { type: String },
    isActive: { type: Boolean, default: true },

    // Door passwords
    doorPasswords: [{
      location: { type: String, required: true },
      password: { type: String, required: true },
      notes: { type: String },
    }],

    // WiFi passwords
    wifiPasswords: [{
      network: { type: String, required: true },
      password: { type: String, required: true },
    }],

    // Hero Section - textos dinâmicos
    heroTagline: { type: String }, // Ex: "Sua casa de férias perfeita em Belo Horizonte"
    heroSubtitle: { type: String }, // Ex: "Piscina aquecida • Jacuzzi • Playground • Vista para a Lagoa"
    heroHighlights: [{ type: String }], // Array de destaques

    // About Section - textos dinâmicos
    aboutTitle: { type: String }, // Ex: "Sobre a Casa"
    aboutDescription: [{ type: String }], // Array de parágrafos
  },
  { timestamps: true }
);

export const Property = mongoose.models.Property || mongoose.model<PropertyDocument>('Property', PropertySchema);
