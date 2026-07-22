export interface Vehicle {
  _id?: string;
  id?: string;
  make: string;
  model: string;
  year?: number;
  category: string;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleSearchFilters {
  make?: string;
  model?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
}

export interface VehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
}
