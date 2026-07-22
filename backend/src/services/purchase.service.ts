import { Purchase } from "../models/Purchase";

export class PurchaseService {
  async getMyPurchases(userId: string) {
    const purchases = await Purchase.find({ user: userId })
      .populate("vehicle", "make model category price")
      .sort({ purchasedAt: -1, createdAt: -1 });

    return purchases.map((p: any) => {
      const vehicleName = p.vehicle
        ? `${p.vehicle.make} ${p.vehicle.model}`
        : "Vehicle";
      const category = p.vehicle ? p.vehicle.category : "Unknown";

      return {
        _id: p._id.toString(),
        vehicle: vehicleName,
        category: category,
        quantity: p.quantity,
        purchasePrice: p.purchasePrice,
        totalAmount: p.totalAmount,
        status: p.status,
        purchasedAt: p.purchasedAt
          ? new Date(p.purchasedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
    });
  }

  async getAllPurchases() {
    const purchases = await Purchase.find()
      .populate("user", "name email")
      .populate("vehicle", "make model category")
      .sort({ purchasedAt: -1, createdAt: -1 });

    return purchases.map((p: any) => {
      const customerName = p.user ? p.user.name : "Customer";
      const customerEmail = p.user ? p.user.email : "N/A";
      const vehicleName = p.vehicle
        ? `${p.vehicle.make} ${p.vehicle.model}`
        : "Vehicle";
      const category = p.vehicle ? p.vehicle.category : "Unknown";

      return {
        _id: p._id.toString(),
        customerName,
        customerEmail,
        vehicleName,
        category,
        quantity: p.quantity,
        purchasePrice: p.purchasePrice,
        totalAmount: p.totalAmount,
        status: p.status,
        purchasedAt: p.purchasedAt
          ? new Date(p.purchasedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };
    });
  }
}
