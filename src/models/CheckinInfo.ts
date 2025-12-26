import mongoose, { Schema, Document } from 'mongoose';
import { ICheckinInfo } from '@/types';

export interface CheckinInfoDocument extends Omit<ICheckinInfo, '_id'>, Document {}

const CheckinInfoSchema = new Schema<CheckinInfoDocument>(
  {
    type: {
      type: String,
      enum: ['checkin', 'checkout', 'rule', 'instruction'],
      required: true
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    icon: { type: String },
    order: { type: Number, default: 0 },
    isRestricted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CheckinInfo = mongoose.models.CheckinInfo || mongoose.model<CheckinInfoDocument>('CheckinInfo', CheckinInfoSchema);
