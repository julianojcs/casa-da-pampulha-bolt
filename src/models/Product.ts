import mongoose, { Schema, Document } from 'mongoose';

export type ProductCategory = 'limpeza' | 'piscina' | 'jardim' | 'manutencao' | 'cozinha' | 'banheiro' | 'geral';
export type MeasurementType = 'weight' | 'volume' | 'unit';

export interface IProduct {
  _id?: string;
  name: string;
  description?: string;
  image?: string; // Cloudinary URL - stored in "products" folder
  purchaseUrl?: string; // URL for purchasing the product
  category: ProductCategory;
  measurementType: MeasurementType;
  measurementValue?: number;
  measurementUnit?: string; // 'kg', 'g', 'L', 'ml', 'un'
  brand?: string;
  barcode?: string;
  suggestedSupplier?: string;
  averagePrice?: number;
  notes?: string;
  isActive: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductDocument extends Omit<IProduct, '_id'>, Document {}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    purchaseUrl: { type: String },
    category: {
      type: String,
      enum: ['limpeza', 'piscina', 'jardim', 'manutencao', 'cozinha', 'banheiro', 'geral'],
      default: 'geral',
    },
    measurementType: {
      type: String,
      enum: ['weight', 'volume', 'unit'],
      default: 'unit',
    },
    measurementValue: { type: Number },
    measurementUnit: { type: String }, // 'kg', 'g', 'L', 'ml', 'un'
    brand: { type: String },
    barcode: { type: String },
    suggestedSupplier: { type: String },
    averagePrice: { type: Number },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

export const Product =
  mongoose.models.Product ||
  mongoose.model<ProductDocument>('Product', ProductSchema);
