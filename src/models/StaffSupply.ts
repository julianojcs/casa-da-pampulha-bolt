import mongoose, { Schema, Document } from 'mongoose';

export type SupplyCategory = 'limpeza' | 'piscina' | 'jardim' | 'cozinha' | 'banheiro' | 'geral';
export type SupplyStatus = 'ok' | 'low' | 'critical' | 'out-of-stock';
export type SupplyUrgency = 'normal' | 'urgent';

export interface IStaffSupply {
  _id?: string;
  name: string;
  description?: string;
  image?: string;
  category: SupplyCategory;
  status: SupplyStatus;
  urgency: SupplyUrgency;
  quantity?: number;
  unit?: string;
  minQuantity?: number;
  requestedBy?: string;
  requestedByName?: string;
  approvedBy?: string;
  approvedAt?: Date;
  purchasedAt?: Date;
  notes?: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StaffSupplyDocument extends Omit<IStaffSupply, '_id'>, Document {}

const StaffSupplySchema = new Schema<StaffSupplyDocument>(
  {
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    category: {
      type: String,
      enum: ['limpeza', 'piscina', 'jardim', 'cozinha', 'banheiro', 'geral'],
      default: 'geral',
    },
    status: {
      type: String,
      enum: ['ok', 'low', 'critical', 'out-of-stock'],
      default: 'ok',
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
    },
    quantity: { type: Number },
    unit: { type: String },
    minQuantity: { type: Number },
    requestedBy: { type: String },
    requestedByName: { type: String },
    approvedBy: { type: String },
    approvedAt: { type: Date },
    purchasedAt: { type: Date },
    notes: { type: String },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

StaffSupplySchema.index({ category: 1, status: 1 });

export const StaffSupply =
  mongoose.models.StaffSupply ||
  mongoose.model<StaffSupplyDocument>('StaffSupply', StaffSupplySchema);
