import React from "react";
import { Vehicle } from "../../types/vehicle.types";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase?: (vehicleId: string) => void;
  isPurchasing?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPurchase,
  isPurchasing = false,
}) => {
  const vehicleId = vehicle._id || vehicle.id || "";
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

      {/* Footer / Price & Purchase Button */}
      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider block">Price</span>
            <span className="text-xl font-extrabold text-gray-900">{formattedPrice}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors">
            🚗
          </div>
        </div>

        {/* Purchase Action Button */}
        {onPurchase && (
          <button
            onClick={() => vehicleId && onPurchase(vehicleId)}
            disabled={isOutOfStock || isPurchasing}
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : isPurchasing
                ? "bg-indigo-400 text-white cursor-wait"
                : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99] shadow-sm hover:shadow"
            }`}
          >
            {isPurchasing ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing Purchase...</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <span>Purchase Vehicle</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
