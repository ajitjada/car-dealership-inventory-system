export interface VehicleImage {
  url: string;
  publicId?: string;
}

export interface Vehicle {
  _id?: string;
  id?: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
  images?: VehicleImage[];
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
