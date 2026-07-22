import { Response } from "express";
import { VehicleService } from "../services/vehicle.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const vehicleService = new VehicleService();

export class VehicleController {
  async createVehicle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { make, model, category, price, quantity } = req.body;
      const vehicle = await vehicleService.createVehicle({
        make,
        model,
        category,
        price,
        quantity,
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
      const updatedVehicle = await vehicleService.updateVehicle(id, req.body);

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
      const vehicle = await vehicleService.purchaseVehicle(id);

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
      const vehicle = await vehicleService.restockVehicle(id, quantity);

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
