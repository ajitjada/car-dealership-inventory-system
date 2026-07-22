import { Response } from "express";
import { VehicleService } from "../services/vehicle.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const vehicleService = new VehicleService();

export class VehicleController {
  async createVehicle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let { make, model, category, price, quantity, year, images } = req.body;

      if (price !== undefined && price !== null) price = Number(price);
      if (quantity !== undefined && quantity !== null) quantity = Number(quantity);
      if (year !== undefined && year !== null && year !== "") year = Number(year);

      if (typeof images === "string") {
        try {
          images = JSON.parse(images);
        } catch (e) {
          images = [];
        }
      }

      const files = req.files as Express.Multer.File[] | undefined;

      const vehicle = await vehicleService.createVehicle({
        make,
        model,
        category,
        price,
        quantity,
        year,
        images,
        files,
      });

      res.status(201).json({
        success: true,
        message: "Vehicle created successfully",
        data: vehicle,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getVehicles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const vehicles = await vehicleService.getAllVehicles();
      res.status(200).json({
        success: true,
        message: "Vehicles retrieved successfully",
        data: vehicles,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getVehicleById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const vehicle = await vehicleService.getVehicleById(id);

      res.status(200).json({
        success: true,
        message: "Vehicle retrieved successfully",
        data: vehicle,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async searchVehicles(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { make, model, category, minPrice, maxPrice } = req.query;
      const vehicles = await vehicleService.searchVehicles({
        make: make as string,
        model: model as string,
        category: category as string,
        minPrice: minPrice as string,
        maxPrice: maxPrice as string,
      });

      res.status(200).json({
        success: true,
        message: "Search completed successfully",
        data: vehicles,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateVehicle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      let { make, model, category, price, quantity, year, deletedPublicIds, deletedImageUrls } = req.body;

      if (price !== undefined && price !== null && price !== "") price = Number(price);
      if (quantity !== undefined && quantity !== null && quantity !== "") quantity = Number(quantity);
      if (year !== undefined && year !== null && year !== "") year = Number(year);

      if (typeof deletedPublicIds === "string") {
        try {
          deletedPublicIds = JSON.parse(deletedPublicIds);
        } catch (e) {
          deletedPublicIds = [deletedPublicIds];
        }
      }

      if (typeof deletedImageUrls === "string") {
        try {
          deletedImageUrls = JSON.parse(deletedImageUrls);
        } catch (e) {
          deletedImageUrls = [deletedImageUrls];
        }
      }

      const files = req.files as Express.Multer.File[] | undefined;

      const updatedVehicle = await vehicleService.updateVehicle(id, {
        make,
        model,
        category,
        price,
        quantity,
        year,
        deletedPublicIds,
        deletedImageUrls,
        files,
      });

      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: updatedVehicle,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteVehicle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      await vehicleService.deleteVehicle(id);

      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async purchaseVehicle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id;
      const vehicle = await vehicleService.purchaseVehicle(id, userId);

      res.status(200).json({
        success: true,
        message: "Vehicle purchased successfully",
        data: vehicle,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async restockVehicle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { quantity } = req.body;
      const vehicle = await vehicleService.restockVehicle(id, Number(quantity));

      res.status(200).json({
        success: true,
        message: "Vehicle restocked successfully",
        data: vehicle,
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
