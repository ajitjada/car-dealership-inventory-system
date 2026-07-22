import { Response } from "express";
import { PurchaseService } from "../services/purchase.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const purchaseService = new PurchaseService();

export class PurchaseController {
  async getMyPurchases(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const purchases = await purchaseService.getMyPurchases(userId);
      res.status(200).json(purchases);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve purchase history",
      });
    }
  }

  async getAllPurchases(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const purchases = await purchaseService.getAllPurchases();
      res.status(200).json(purchases);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve purchase history",
      });
    }
  }
}
