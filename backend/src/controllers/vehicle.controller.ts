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
}
