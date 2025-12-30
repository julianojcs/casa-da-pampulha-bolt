import mongoose, { Schema, Document } from 'mongoose';

export type MessagePriority = 'normal' | 'important' | 'urgent';
export type MessageType = 'announcement' | 'reminder' | 'instruction' | 'alert';

export interface IStaffMessage {
  _id?: string;
  title: string;
  content: string;
  type: MessageType;
  priority: MessagePriority;
  createdBy: string;
  createdByName?: string;
  targetRoles?: string[]; // 'all', 'piscineiro', 'jardineiro', etc.
  targetUsers?: string[]; // IDs específicos
  expiresAt?: Date;
  isPinned?: boolean;
  readBy?: string[]; // IDs de quem já leu
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StaffMessageDocument extends Omit<IStaffMessage, '_id'>, Document {}

const StaffMessageSchema = new Schema<StaffMessageDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ['announcement', 'reminder', 'instruction', 'alert'],
      default: 'announcement',
    },
    priority: {
      type: String,
      enum: ['normal', 'important', 'urgent'],
      default: 'normal',
    },
    createdBy: { type: String, required: true },
    createdByName: { type: String },
    targetRoles: [{ type: String }],
    targetUsers: [{ type: String }],
    expiresAt: { type: Date },
    isPinned: { type: Boolean, default: false },
    readBy: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StaffMessageSchema.index({ isActive: 1, isPinned: -1, createdAt: -1 });
StaffMessageSchema.index({ targetRoles: 1 });

export const StaffMessage =
  mongoose.models.StaffMessage ||
  mongoose.model<StaffMessageDocument>('StaffMessage', StaffMessageSchema);
