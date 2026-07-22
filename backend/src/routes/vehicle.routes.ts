import { Router } from "express";
import { VehicleController } from "../controllers/vehicle.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const vehicleController = new VehicleController();

router.post("/", authenticate, (req, res) => vehicleController.createVehicle(req, res));

export default router;
