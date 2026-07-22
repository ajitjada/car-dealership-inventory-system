import React from "react";
import { Vehicle } from "../../types/vehicle.types";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between group">
      {/* Header / Category Badge */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wider">
            {vehicle.category}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isOutOfStock
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : `${vehicle.quantity} In Stock`}
          </span>
        </div>

        {/* Make & Model Title */}
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.year && (
          <p className="text-xs text-gray-400 font-medium mt-1">Year: {vehicle.year}</p>
        )}
      </div>

      {/* Details Footer / Price */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500 uppercase tracking-wider block">Price</span>
          <span className="text-xl font-extrabold text-gray-900">{formattedPrice}</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
          🚗
        </div>
      </div>
    </div>
  );
};
