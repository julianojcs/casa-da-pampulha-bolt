import mongoose, { Schema, Document } from 'mongoose';
import { IHost } from '@/types';

export interface HostDocument extends Omit<IHost, '_id'>, Document {}

const HostSchema = new Schema<HostDocument>(
  {
    name: { type: String, required: true },
    bio: { type: String, required: true },
    photo: { type: String, required: true },
    role: { type: String, required: true },
    languages: [{ type: String }],
    responseTime: { type: String, required: true },
    responseRate: { type: String, required: true },
    isSuperhost: { type: Boolean, default: false },
    joinedDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Host = mongoose.models.Host || mongoose.model<HostDocument>('Host', HostSchema);
