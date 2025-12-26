import mongoose, { Schema, Document } from 'mongoose';
import { IKidsArea } from '@/types';

export interface KidsAreaDocument extends Omit<IKidsArea, '_id'>, Document {}

const KidsAreaSchema = new Schema<KidsAreaDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const KidsArea = mongoose.models.KidsArea || mongoose.model<KidsAreaDocument>('KidsArea', KidsAreaSchema);
