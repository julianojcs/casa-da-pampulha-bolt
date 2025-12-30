import mongoose, { Schema, Document } from 'mongoose';

export interface ILegalItem {
  _id?: string;
  title: string;
  content: string;
  order: number;
}

export interface ILegalContent extends Document {
  type: 'privacy' | 'terms';
  items: ILegalItem[];
  updatedAt: Date;
  createdAt: Date;
}

const LegalItemSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true },
});

const LegalContentSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: ['privacy', 'terms'],
    unique: true
  },
  items: [LegalItemSchema],
}, { timestamps: true });

export const LegalContent = mongoose.models.LegalContent || mongoose.model<ILegalContent>('LegalContent', LegalContentSchema);
