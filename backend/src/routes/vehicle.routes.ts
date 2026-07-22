import { Router } from "express";
import { VehicleController } from "../controllers/vehicle.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const vehicleController = new VehicleController();

router.post("/", authenticate, (req, res) => vehicleController.createVehicle(req, res));
router.get("/search", authenticate, (req, res) => vehicleController.searchVehicles(req, res));
router.get("/", authenticate, (req, res) => vehicleController.getVehicles(req, res));
router.put("/:id", authenticate, (req, res) => vehicleController.updateVehicle(req, res));

export default router;
