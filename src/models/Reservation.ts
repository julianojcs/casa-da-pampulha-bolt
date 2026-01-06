import mongoose, { Schema, Document } from 'mongoose';

export type ReservationStatus = 'pending' | 'upcoming' | 'current' | 'completed' | 'cancelled';

export interface IReservationGuest {
  name: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  documentType?: 'cpf' | 'rg' | 'passport' | 'other';
  documentNumber?: string;
  isMainGuest?: boolean;
}

export interface IReservationVehicle {
  brand: string;
  model: string;
  color: string;
  licensePlate: string;
}

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
  pets?: number;
  notes?: string;
  status: ReservationStatus;
  source?: 'airbnb' | 'booking' | 'vrbo' | 'direct' | 'other';
  reservationCode?: string;
  temporaryMainDoorPassword: {
    location: { type: String, required: true },
    password: { type: String, required: true },
    notes: { type: String },
  },
  totalAmount?: number;
  isPaid?: boolean;
  preRegistrationId?: string;
  guests?: IReservationGuest[];
  vehicles?: IReservationVehicle[];
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReservationDocument extends Omit<IReservation, '_id'>, Document {}

const ReservationGuestSchema = new Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    age: { type: Number },
    documentType: { type: String, enum: ['cpf', 'rg', 'passport', 'other'] },
    documentNumber: { type: String },
    isMainGuest: { type: Boolean, default: false },
  },
  { _id: true }
);

const ReservationVehicleSchema = new Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    licensePlate: { type: String, required: true },
  },
  { _id: true }
);

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
    pets: { type: Number, default: 0 },
    guests: [ReservationGuestSchema],
    notes: { type: String },
    status: {
      type: String,
      enum: ['pending', 'upcoming', 'current', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    source: {
      type: String,
      enum: ['airbnb', 'booking', 'vrbo', 'direct', 'other'],
      default: 'airbnb',
    },
    reservationCode: { type: String },
    temporaryMainDoorPassword: {
      location: { type: String, required: true },
      password: { type: String, required: true },
      notes: { type: String },
    },
    totalAmount: { type: Number },
    isPaid: { type: Boolean, default: false },
    preRegistrationId: { type: String, index: true },
    vehicles: [ReservationVehicleSchema],
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Índices para buscas frequentes
ReservationSchema.index({ checkInDate: 1 });
ReservationSchema.index({ checkOutDate: 1 });
ReservationSchema.index({ status: 1 });
ReservationSchema.index({ userId: 1, checkInDate: -1 });

// Virtual fields for guest counts by age category
// Adults: age > 12
// Children: age > 2 and <= 12
// Babies: age <= 2
ReservationSchema.virtual('adultsCount').get(function() {
  if (!this.guests || this.guests.length === 0) return 0;
  return this.guests.filter((g: IReservationGuest) => (g.age ?? 18) > 12).length;
});

ReservationSchema.virtual('childrenCount').get(function() {
  if (!this.guests || this.guests.length === 0) return 0;
  return this.guests.filter((g: IReservationGuest) => {
    const age = g.age ?? 18;
    return age > 2 && age <= 12;
  }).length;
});

ReservationSchema.virtual('babiesCount').get(function() {
  if (!this.guests || this.guests.length === 0) return 0;
  return this.guests.filter((g: IReservationGuest) => (g.age ?? 18) <= 2).length;
});

// Ensure virtuals are included when converting to JSON/Object
ReservationSchema.set('toJSON', { virtuals: true });
ReservationSchema.set('toObject', { virtuals: true });

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
