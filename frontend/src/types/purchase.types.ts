export interface CustomerPurchase {
  _id: string;
  vehicle: string;
  category?: string;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  status: string;
  purchasedAt: string;
}

export interface AdminPurchase {
  _id: string;
  customerName: string;
  customerEmail: string;
  vehicleName: string;
  category?: string;
  quantity: number;
  purchasePrice: number;
  totalAmount: number;
  status: string;
  purchasedAt: string;
}
