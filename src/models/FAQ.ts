import mongoose, { Schema, Document } from 'mongoose';
import { IFAQ } from '@/types';

export interface FAQDocument extends Omit<IFAQ, '_id'>, Document {}

const FAQSchema = new Schema<FAQDocument>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const FAQ = mongoose.models.FAQ || mongoose.model<FAQDocument>('FAQ', FAQSchema);
