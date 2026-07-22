import React from "react";
import { Vehicle } from "../../types/vehicle.types";
import { VehicleCard } from "./VehicleCard";

interface VehicleGridProps {
  vehicles: Vehicle[];
}

export const VehicleGrid: React.FC<VehicleGridProps> = ({ vehicles }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle, index) => (
        <VehicleCard key={vehicle._id || vehicle.id || index} vehicle={vehicle} />
      ))}
    </div>
  );
};
