import api from "../api/axios";
import { VehicleResponse, Vehicle, VehicleSearchFilters } from "../types/vehicle.types";

export const vehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const response = await api.get<VehicleResponse>("/vehicles");
    return response.data.data;
  },

  async searchVehicles(filters: VehicleSearchFilters): Promise<Vehicle[]> {
    const params = new URLSearchParams();
    if (filters.make) params.append("make", filters.make);
    if (filters.model) params.append("model", filters.model);
    if (filters.category) params.append("category", filters.category);
    if (filters.minPrice !== undefined && filters.minPrice !== "") {
      params.append("minPrice", String(filters.minPrice));
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== "") {
      params.append("maxPrice", String(filters.maxPrice));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/vehicles/search?${queryString}` : "/vehicles/search";
    const response = await api.get<VehicleResponse>(endpoint);
    return response.data.data;
  },

  async purchaseVehicle(id: string): Promise<Vehicle> {
    const response = await api.post<{ success: boolean; message: string; data: Vehicle }>(
      `/vehicles/${id}/purchase`
    );
    return response.data.data;
  },
};
