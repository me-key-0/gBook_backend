import { IPayment } from '@/types';
import mongoose, { Schema, Document } from 'mongoose';



const paymentSchema = new Schema<IPayment>(
  {
    receiptNo: { type: String, unique: true, required: true },
    payerName: String,
    payerTelebirrNo: String,
    creditedPartyName: String,
    creditedPartyAccountNo: String,
    transactionStatus: String,
    serviceFee: String,
    paymentDate: Date,
    settledAmount: String,
    totalPaidAmount: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    discountApplied: {
      type: Boolean,
      default: false,
    },
    finalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);



