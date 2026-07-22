import { Router } from "express";
import { VehicleController } from "../controllers/vehicle.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { uploadVehicleImages } from "../middleware/upload.middleware";

const router = Router();
const vehicleController = new VehicleController();

router.post("/", authenticate, uploadVehicleImages, (req, res) =>
  vehicleController.createVehicle(req, res)
);
router.get("/search", authenticate, (req, res) => vehicleController.searchVehicles(req, res));
router.get("/", authenticate, (req, res) => vehicleController.getVehicles(req, res));
router.get("/:id", authenticate, (req, res) => vehicleController.getVehicleById(req, res));
router.put("/:id", authenticate, uploadVehicleImages, (req, res) =>
  vehicleController.updateVehicle(req, res)
);
router.delete("/:id", authenticate, authorize("admin"), (req, res) =>
  vehicleController.deleteVehicle(req, res)
);
router.post("/:id/purchase", authenticate, (req, res) =>
  vehicleController.purchaseVehicle(req, res)
);
router.post("/:id/restock", authenticate, authorize("admin"), (req, res) =>
  vehicleController.restockVehicle(req, res)
);

export default router;
