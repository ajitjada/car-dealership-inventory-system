import mongoose from "mongoose";
import { Vehicle, IVehicle } from "../models/Vehicle";

export interface CreateVehicleData {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export interface VehicleSearchQuery {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export interface UpdateVehicleData {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

export class VehicleService {
  async createVehicle(data: CreateVehicleData): Promise<IVehicle> {
    const { make, model, category, price, quantity } = data;

    if (!make || !model || !category || price === undefined || price === null || quantity === undefined || quantity === null) {
      const error: any = new Error("All fields (make, model, category, price, quantity) are required");
      error.statusCode = 400;
      throw error;
    }

    if (typeof price !== "number" || isNaN(price) || price <= 0) {
      const error: any = new Error("Price must be a number greater than 0");
      error.statusCode = 400;
      throw error;
    }

    if (typeof quantity !== "number" || isNaN(quantity) || quantity < 0) {
      const error: any = new Error("Quantity must be a non-negative number");
      error.statusCode = 400;
      throw error;
    }

    const existingVehicle = await Vehicle.findOne({
      make: { $regex: new RegExp(`^${make}$`, "i") },
      model: { $regex: new RegExp(`^${model}$`, "i") },
    });

    if (existingVehicle) {
      const error: any = new Error("A vehicle with this make and model already exists");
      error.statusCode = 409;
      throw error;
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity,
    });

    return vehicle;
  }

  async getAllVehicles(): Promise<IVehicle[]> {
    return await Vehicle.find();
  }

  async searchVehicles(query: VehicleSearchQuery): Promise<IVehicle[]> {
    const filter: any = {};

    if (query.make) {
      filter.make = { $regex: new RegExp(query.make, "i") };
    }

    if (query.model) {
      filter.model = { $regex: new RegExp(query.model, "i") };
    }

    if (query.category) {
      filter.category = { $regex: new RegExp(query.category, "i") };
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined && query.minPrice !== "") {
        filter.price.$gte = Number(query.minPrice);
      }
      if (query.maxPrice !== undefined && query.maxPrice !== "") {
        filter.price.$lte = Number(query.maxPrice);
      }
    }

    return await Vehicle.find(filter);
  }

  async updateVehicle(id: string, data: UpdateVehicleData): Promise<IVehicle> {
    if (!data || Object.keys(data).length === 0) {
      const error: any = new Error("Request body cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    if (data.price !== undefined) {
      if (typeof data.price !== "number" || isNaN(data.price) || data.price <= 0) {
        const error: any = new Error("Price must be a number greater than 0");
        error.statusCode = 400;
        throw error;
      }
    }

    if (data.quantity !== undefined) {
      if (typeof data.quantity !== "number" || isNaN(data.quantity) || data.quantity < 0) {
        const error: any = new Error("Quantity must be a non-negative number");
        error.statusCode = 400;
        throw error;
      }
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<IVehicle> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    const vehicle = await Vehicle.findByIdAndDelete(id);

    if (!vehicle) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    return vehicle;
  }

  async purchaseVehicle(id: string): Promise<IVehicle> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    if (vehicle.quantity <= 0) {
      const error: any = new Error("Vehicle is out of stock");
      error.statusCode = 400;
      throw error;
    }

    vehicle.quantity -= 1;
    await vehicle.save();

    return vehicle;
  }
}
