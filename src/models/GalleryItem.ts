import mongoose, { Schema, Document } from 'mongoose';
import { IGalleryItem } from '@/types';

export interface GalleryItemDocument extends Omit<IGalleryItem, '_id'>, Document {}

const GalleryItemSchema = new Schema<GalleryItemDocument>(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    src: { type: String, required: true },
    thumbnail: { type: String, required: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GalleryItem = mongoose.models.GalleryItem || mongoose.model<GalleryItemDocument>('GalleryItem', GalleryItemSchema);
