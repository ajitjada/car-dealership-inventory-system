import api from "../api/axios";
import { Vehicle, VehicleSearchFilters } from "../types/vehicle.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const response = await api.get<ApiResponse<Vehicle[]>>("/vehicles");
    return response.data.data;
  },

  async getVehicleById(id: string): Promise<Vehicle> {
    const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);
    return response.data.data;
  },

  async searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (filters.make) params.append("make", filters.make);
    if (filters.model) params.append("model", filters.model);
    if (filters.category) params.append("category", filters.category);
    if (filters.minPrice !== undefined && filters.minPrice !== "")
      params.append("minPrice", String(filters.minPrice));
    if (filters.maxPrice !== undefined && filters.maxPrice !== "")
      params.append("maxPrice", String(filters.maxPrice));

    const response = await api.get<ApiResponse<Vehicle[]>>(`/vehicles/search?${params.toString()}`);
    return response.data.data;
  },

  async createVehicle(data: FormData | Partial<Vehicle>): Promise<Vehicle> {
    const isFormData = data instanceof FormData;
    const response = await api.post<ApiResponse<Vehicle>>(
      "/vehicles",
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return response.data.data;
  },

  async updateVehicle(id: string, data: FormData | Partial<Vehicle>): Promise<Vehicle> {
    const isFormData = data instanceof FormData;
    const response = await api.put<ApiResponse<Vehicle>>(
      `/vehicles/${id}`,
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    return response.data.data;
  },

  async deleteVehicle(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`);
  },

  async purchaseVehicle(id: string): Promise<Vehicle> {
    const response = await api.post<ApiResponse<Vehicle>>(`/vehicles/${id}/purchase`);
    return response.data.data;
  },

  async restockVehicle(id: string, quantity: number): Promise<Vehicle> {
    const response = await api.post<ApiResponse<Vehicle>>(`/vehicles/${id}/restock`, {
      quantity,
    });
    return response.data.data;
  },
};
