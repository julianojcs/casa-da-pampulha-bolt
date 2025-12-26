import mongoose, { Schema, Document } from 'mongoose';
import { ISocialLink } from '@/types';

export interface SocialLinkDocument extends Omit<ISocialLink, '_id'>, Document {}

const SocialLinkSchema = new Schema<SocialLinkDocument>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SocialLink = mongoose.models.SocialLink || mongoose.model<SocialLinkDocument>('SocialLink', SocialLinkSchema);
