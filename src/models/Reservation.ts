import mongoose, { Schema, Document } from 'mongoose';

export type ReservationStatus = 'pending' | 'upcoming' | 'current' | 'completed' | 'cancelled';

export interface IReservation {
  _id?: string;
  userId: string;
  guestName: string;
  guestEmail?: string;
  guestPhone: string;
  guestCountry?: string;
  checkInDate: Date;
  checkInTime: string;
  checkOutDate: Date;
  checkOutTime: string;
  numberOfGuests?: number;
  notes?: string;
  status: ReservationStatus;
  source?: 'airbnb' | 'direct' | 'other';
  confirmationCode?: string;
  totalAmount?: number;
  isPaid?: boolean;
  preRegistrationId?: string; // ID do pré-cadastro associado
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservationDocument extends Omit<IReservation, '_id'>, Document {}

const ReservationSchema = new Schema<ReservationDocument>(
  {
    userId: { type: String, required: true, index: true },
    guestName: { type: String, required: true },
    guestEmail: { type: String },
    guestPhone: { type: String, required: true },
    guestCountry: { type: String, default: 'Brasil' },
    checkInDate: { type: Date, required: true },
    checkInTime: { type: String, default: '15:00' },
    checkOutDate: { type: Date, required: true },
    checkOutTime: { type: String, default: '11:00' },
    numberOfGuests: { type: Number },
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'upcoming', 'current', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    source: {
      type: String,
      enum: ['airbnb', 'direct', 'other'],
      default: 'direct',
    },
    confirmationCode: { type: String },
    totalAmount: { type: Number },
    isPaid: { type: Boolean, default: false },
    preRegistrationId: { type: String, index: true }, // Referência ao pré-cadastro
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Índices para buscas frequentes
ReservationSchema.index({ checkInDate: 1 });
ReservationSchema.index({ checkOutDate: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ userId: 1, checkInDate: -1 });

// Método estático para atualizar status baseado nas datas
ReservationSchema.statics.updateStatuses = async function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Atualizar reservas que começaram hoje para 'current'
  await this.updateMany(
    {
      status: 'upcoming',
      checkInDate: { $lte: now },
      checkOutDate: { $gt: today }
    },
    { status: 'current' }
  );

  // Atualizar reservas que terminaram para 'completed'
  await this.updateMany(
    {
      status: { $in: ['upcoming', 'current'] },
      checkOutDate: { $lt: today }
    },
    { status: 'completed' }
  );
};

export const Reservation =
  mongoose.models.Reservation ||
  mongoose.model<ReservationDocument>('Reservation', ReservationSchema);
