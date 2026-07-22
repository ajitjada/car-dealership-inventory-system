import api from "../api/axios";
import { CustomerPurchase, AdminPurchase } from "../types/purchase.types";

export const purchaseService = {
  async getMyPurchases(): Promise<CustomerPurchase[]> {
    const response = await api.get<CustomerPurchase[]>("/purchases/me");
    return response.data;
  },

  async getAllPurchases(): Promise<AdminPurchase[]> {
    const response = await api.get<AdminPurchase[]>("/purchases");
    return response.data;
  },
};
