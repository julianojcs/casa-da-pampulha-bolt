import mongoose, { Schema, Document } from 'mongoose';
import { IPlace } from '@/types';

export interface PlaceDocument extends Omit<IPlace, '_id'>, Document {}

const PlaceSchema = new Schema<PlaceDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    category: {
      type: String,
      enum: ['all', 'attractions', 'restaurants', 'kids', 'bars', 'services', 'sports'],
      required: true
    },
    rating: { type: Number, required: true, min: 0, max: 5 },
    distanceWalk: { type: String },
    distanceCar: { type: String },
    distance: { type: String },
    image: { type: String, required: true },
    mapUrl: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Place = mongoose.models.Place || mongoose.model<PlaceDocument>('Place', PlaceSchema);
