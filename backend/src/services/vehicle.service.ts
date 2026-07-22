import mongoose from "mongoose";
import { Vehicle, IVehicle, IVehicleImage } from "../models/Vehicle";
import { Purchase } from "../models/Purchase";
import { uploadToCloudinary, deleteFromCloudinary } from "../config/cloudinary";

export interface CreateVehicleData {
  make?: string;
  model?: string;
  category?: string;
  price?: number;
  quantity?: number;
  year?: number;
  images?: IVehicleImage[];
  files?: Express.Multer.File[];
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
  year?: number;
  images?: IVehicleImage[];
  deletedPublicIds?: string[];
  deletedImageUrls?: string[];
  files?: Express.Multer.File[];
}

export class VehicleService {
  async createVehicle(data: CreateVehicleData): Promise<IVehicle> {
    const { make, model, category, price, quantity, year } = data;

    if (
      !make ||
      !model ||
      !category ||
      price === undefined ||
      price === null ||
      quantity === undefined ||
      quantity === null
    ) {
      const error: any = new Error(
        "All fields (make, model, category, price, quantity) are required"
      );
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
      const error: any = new Error(
        "A vehicle with this make and model already exists"
      );
      error.statusCode = 409;
      throw error;
    }

    const uploadedImages: IVehicleImage[] = [];

    // Handle JSON passed images if any
    if (data.images && Array.isArray(data.images)) {
      uploadedImages.push(...data.images);
    }

    // Handle Multer uploaded files
    if (data.files && Array.isArray(data.files) && data.files.length > 0) {
      if (uploadedImages.length + data.files.length > 5) {
        const error: any = new Error("Maximum 5 images allowed per vehicle");
        error.statusCode = 400;
        throw error;
      }

      for (const file of data.files) {
        const result = await uploadToCloudinary(file.buffer, file.mimetype);
        uploadedImages.push(result);
      }
    }

    const vehicle = await Vehicle.create({
      make,
      model,
      category,
      price,
      quantity,
      year: year ? Number(year) : undefined,
      images: uploadedImages,
    });

    return vehicle;
  }

  async getAllVehicles(): Promise<IVehicle[]> {
    return await Vehicle.find();
  }

  async getVehicleById(id: string): Promise<IVehicle> {
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

    return vehicle;
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    const hasData =
      data.make !== undefined ||
      data.model !== undefined ||
      data.category !== undefined ||
      data.price !== undefined ||
      data.quantity !== undefined ||
      data.year !== undefined ||
      (data.deletedPublicIds && data.deletedPublicIds.length > 0) ||
      (data.deletedImageUrls && data.deletedImageUrls.length > 0) ||
      (data.files && data.files.length > 0);

    if (!hasData) {
      const error: any = new Error("Request body cannot be empty");
      error.statusCode = 400;
      throw error;
    }

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      const error: any = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    if (data.price !== undefined) {
      if (typeof data.price !== "number" || isNaN(data.price) || data.price <= 0) {
        const error: any = new Error("Price must be a number greater than 0");
        error.statusCode = 400;
        throw error;
      }
      vehicle.price = data.price;
    }

    if (data.quantity !== undefined) {
      if (typeof data.quantity !== "number" || isNaN(data.quantity) || data.quantity < 0) {
        const error: any = new Error("Quantity must be a non-negative number");
        error.statusCode = 400;
        throw error;
      }
      vehicle.quantity = data.quantity;
    }

    if (data.make !== undefined) vehicle.make = data.make;
    if (data.model !== undefined) (vehicle as any).model = data.model;
    if (data.category !== undefined) vehicle.category = data.category;
    if (data.year !== undefined) vehicle.year = data.year ? Number(data.year) : undefined;

    // Delete selected existing images from Cloudinary & array
    if (data.deletedPublicIds && Array.isArray(data.deletedPublicIds) && data.deletedPublicIds.length > 0) {
      for (const publicId of data.deletedPublicIds) {
        await deleteFromCloudinary(publicId);
        vehicle.images = vehicle.images.filter((img) => img.publicId !== publicId);
      }
    }

    if (data.deletedImageUrls && Array.isArray(data.deletedImageUrls) && data.deletedImageUrls.length > 0) {
      for (const url of data.deletedImageUrls) {
        const targetImg = vehicle.images.find((img) => img.url === url);
        if (targetImg && targetImg.publicId) {
          await deleteFromCloudinary(targetImg.publicId);
        }
        vehicle.images = vehicle.images.filter((img) => img.url !== url);
      }
    }

    // Upload new files
    if (data.files && Array.isArray(data.files) && data.files.length > 0) {
      if (vehicle.images.length + data.files.length > 5) {
        const error: any = new Error("Maximum 5 images allowed per vehicle");
        error.statusCode = 400;
        throw error;
      }

      for (const file of data.files) {
        const result = await uploadToCloudinary(file.buffer, file.mimetype);
        vehicle.images.push(result);
      }
    }

    await vehicle.save();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<IVehicle> {
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

    // Clean up images from Cloudinary
    if (vehicle.images && vehicle.images.length > 0) {
      for (const img of vehicle.images) {
        if (img.publicId) {
          await deleteFromCloudinary(img.publicId);
        }
      }
    }

    await Vehicle.findByIdAndDelete(id);
    return vehicle;
  }

  async purchaseVehicle(id: string, userId?: string): Promise<IVehicle> {
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

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      await Purchase.create({
        user: new mongoose.Types.ObjectId(userId),
        vehicle: vehicle._id,
        quantity: 1,
        purchasePrice: vehicle.price,
        totalAmount: vehicle.price * 1,
        status: "Purchased",
        purchasedAt: new Date(),
      });
    }

    return vehicle;
  }

  async restockVehicle(id: string, quantityToAdd: number): Promise<IVehicle> {
    if (typeof quantityToAdd !== "number" || isNaN(quantityToAdd) || quantityToAdd <= 0) {
      const error: any = new Error("Restock quantity must be a number greater than 0");
      error.statusCode = 400;
      throw error;
    }

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

    vehicle.quantity += quantityToAdd;
    await vehicle.save();

    return vehicle;
  }
}
