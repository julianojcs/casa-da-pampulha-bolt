import mongoose, { Schema, Document } from 'mongoose';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskCategory = 'limpeza' | 'manutencao' | 'piscina' | 'jardim' | 'compras' | 'geral';

export interface IStaffTask {
  _id?: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: string; // User ID do funcionário
  assignedToName?: string;
  createdBy: string; // User ID do admin/anfitrião
  createdByName?: string;
  dueDate?: Date;
  dueTime?: string;
  completedAt?: Date;
  completedBy?: string;
  notes?: string;
  reservationId?: string; // Vincular a uma reserva específica
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'per-checkout';
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StaffTaskDocument extends Omit<IStaffTask, '_id'>, Document {}

const StaffTaskSchema = new Schema<StaffTaskDocument>(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['limpeza', 'manutencao', 'piscina', 'jardim', 'compras', 'geral'],
      default: 'geral',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    assignedTo: { type: String, index: true },
    assignedToName: { type: String },
    createdBy: { type: String, required: true },
    createdByName: { type: String },
    dueDate: { type: Date },
    dueTime: { type: String },
    completedAt: { type: Date },
    completedBy: { type: String },
    notes: { type: String },
    reservationId: { type: String, index: true },
    isRecurring: { type: Boolean, default: false },
    recurringPattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'per-checkout'],
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Índices para buscas frequentes
StaffTaskSchema.index({ status: 1, dueDate: 1 });
StaffTaskSchema.index({ assignedTo: 1, status: 1 });

export const StaffTask =
  mongoose.models.StaffTask ||
  mongoose.model<StaffTaskDocument>('StaffTask', StaffTaskSchema);
