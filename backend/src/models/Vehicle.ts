import { Schema, model } from "mongoose";

export interface IVehicle {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    make: {
      type: String,
      required: [true, "Make is required"],
      trim: true,
    },
    model: {
      type: String,
      required: [true, "Model is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0.01, "Price must be greater than 0"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

vehicleSchema.index({ make: 1, model: 1 }, { unique: true });

export const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);
