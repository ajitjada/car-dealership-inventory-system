import mongoose, { Schema, Document } from "mongoose";

export interface IVehicleImage {
  url: string;
  publicId?: string;
}

export interface IVehicleData {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
  images: IVehicleImage[];
}

export type IVehicle = Omit<Document, "model"> & IVehicleData;

const vehicleSchema: Schema = new Schema(
  {
    make: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Vehicle = mongoose.model<IVehicle>("Vehicle", vehicleSchema);
