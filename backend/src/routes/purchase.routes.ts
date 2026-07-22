import { Router } from "express";
import { PurchaseController } from "../controllers/purchase.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();
const purchaseController = new PurchaseController();

router.get("/me", authenticate, (req, res) => purchaseController.getMyPurchases(req, res));
router.get("/", authenticate, authorize("admin"), (req, res) => purchaseController.getAllPurchases(req, res));

export default router;
