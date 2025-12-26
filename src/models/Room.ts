import mongoose, { Schema, Document } from 'mongoose';
import { IRoom } from '@/types';

export interface RoomDocument extends Omit<IRoom, '_id'>, Document {}

const RoomSchema = new Schema<RoomDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    beds: [{
      type: { type: String, required: true },
      quantity: { type: Number, required: true }
    }],
    maxGuests: { type: Number, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Room = mongoose.models.Room || mongoose.model<RoomDocument>('Room', RoomSchema);
