import mongoose, { Schema, Document } from 'mongoose';
import { IWelcomeGuide } from '@/types';

export interface WelcomeGuideDocument extends Omit<IWelcomeGuide, '_id'>, Document {}

const WelcomeGuideSchema = new Schema<WelcomeGuideDocument>(
  {
    title: { type: String, required: true },
    sections: [{
      title: { type: String, required: true },
      content: { type: String, required: true },
      image: { type: String },
      order: { type: Number, default: 0 }
    }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const WelcomeGuide = mongoose.models.WelcomeGuide || mongoose.model<WelcomeGuideDocument>('WelcomeGuide', WelcomeGuideSchema);
