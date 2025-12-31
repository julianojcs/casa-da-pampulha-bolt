import mongoose, { Schema, Document } from 'mongoose';
import { IGuestInfo } from '@/types';

export interface GuestInfoDocument extends Omit<IGuestInfo, '_id'>, Document {}

const GuestInfoSchema = new Schema<GuestInfoDocument>(
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
    showOnGuestDashboard: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GuestInfo = mongoose.models.GuestInfo || mongoose.model<GuestInfoDocument>('GuestInfo', GuestInfoSchema);
