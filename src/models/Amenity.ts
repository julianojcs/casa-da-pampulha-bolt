import mongoose, { Schema, Document } from 'mongoose';
import { IAmenity } from '@/types';

export interface AmenityDocument extends Omit<IAmenity, '_id'>, Document {}

const AmenitySchema = new Schema<AmenityDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Highlight fields
    isHighlight: { type: Boolean, default: false },
    highlightColor: { type: String, default: 'blue' },
    highlightDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Amenity = mongoose.models.Amenity || mongoose.model<AmenityDocument>('Amenity', AmenitySchema);
