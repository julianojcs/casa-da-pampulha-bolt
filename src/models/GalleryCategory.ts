import mongoose, { Schema, Document } from 'mongoose';

export interface IGalleryCategory {
  _id: string;
  name: string;
  isDefault: boolean;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryCategoryDocument extends Omit<IGalleryCategory, '_id'>, Document {}

const GalleryCategorySchema = new Schema<GalleryCategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isDefault: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure only one default category exists
GalleryCategorySchema.pre('save', async function(next) {
  if (this.isDefault) {
    await mongoose.model('GalleryCategory').updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { isDefault: false }
    );
  }
  next();
});

export const GalleryCategory = mongoose.models.GalleryCategory ||
  mongoose.model<GalleryCategoryDocument>('GalleryCategory', GalleryCategorySchema);
