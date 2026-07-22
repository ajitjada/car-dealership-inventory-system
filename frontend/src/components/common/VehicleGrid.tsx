import React from "react";
import { Vehicle } from "../../types/vehicle.types";
import { VehicleCard } from "./VehicleCard";

interface VehicleGridProps {
  vehicles: Vehicle[];
  onPurchase?: (vehicleId: string) => void;
  purchasingId?: string | null;
}

export const VehicleGrid: React.FC<VehicleGridProps> = ({
  vehicles,
  onPurchase,
  purchasingId,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vehicles.map((vehicle, index) => {
        const vehicleId = vehicle._id || vehicle.id || String(index);
        return (
          <VehicleCard
            key={vehicleId}
            vehicle={vehicle}
            onPurchase={onPurchase}
            isPurchasing={purchasingId === vehicleId}
          />
        );
      })}
    </div>
  );
};
