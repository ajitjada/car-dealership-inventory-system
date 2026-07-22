import mongoose, { Schema, Document } from "mongoose";

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  status: string;
  purchasedAt: Date;
}

const purchaseSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Purchased",
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);
