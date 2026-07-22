import { Vehicle, IVehicle } from "../models/Vehicle";

export interface CreateVehicleData {
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
}
