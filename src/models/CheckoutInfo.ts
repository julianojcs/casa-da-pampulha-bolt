import mongoose from 'mongoose';

export interface ICheckoutInfo {
  title: string;
  instructions: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CheckoutInfoSchema = new mongoose.Schema<ICheckoutInfo>(
  {
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
    },
    instructions: {
      type: [String],
      required: [true, 'Instruções são obrigatórias'],
      validate: {
        validator: function(v: string[]) {
          return v && v.length > 0;
        },
        message: 'Deve haver pelo menos uma instrução',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const CheckoutInfo = mongoose.models.CheckoutInfo || mongoose.model<ICheckoutInfo>('CheckoutInfo', CheckoutInfoSchema);

export default CheckoutInfo;
