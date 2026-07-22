import React from "react";
import { Link } from "react-router-dom";
import { Vehicle } from "../../types/vehicle.types";
import { authService } from "../../services/auth.service";

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase?: (vehicleId: string) => void;
  onRestock?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  isPurchasing?: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onPurchase,
  onRestock,
  onDelete,
  isPurchasing = false,
}) => {
  const vehicleId = vehicle._id || vehicle.id || "";
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  const isOutOfStock = vehicle.quantity <= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1">
      {/* Header / Category & Admin Badges */}
      <div className="p-5 pb-4">
        <div className="flex justify-between items-start mb-3">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
            {vehicle.category}
          </span>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              isOutOfStock
                ? "bg-red-50 text-red-600 border-red-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isOutOfStock ? "Out of Stock" : `${vehicle.quantity} In Stock`}
          </span>
        </div>

        {/* Make & Model Title */}
        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors">
          {vehicle.make} {vehicle.model}
        </h3>
        {vehicle.year && (
          <p className="text-xs text-slate-400 font-semibold mt-1">Year: {vehicle.year}</p>
        )}
      </div>

      {/* Footer / Price & Action Controls */}
      <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Price</span>
            <span className="text-xl font-black text-slate-900">{formattedPrice}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
            🚗
          </div>
        </div>

        {/* Admin Management Toolbar */}
        {isAdmin && (
          <div className="pt-2 border-t border-slate-200/60 grid grid-cols-3 gap-2">
            <Link
              to={`/admin/vehicles/edit/${vehicleId}`}
              className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-bold text-center transition-colors"
            >
              ✏️ Edit
            </Link>
            <button
              onClick={() => onRestock && onRestock(vehicle)}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              📦 Restock
            </button>
            <button
              onClick={() => onDelete && onDelete(vehicle)}
              className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              🗑️ Delete
            </button>
          </div>
        )}

        {/* Customer Purchase Action Button */}
        {onPurchase && !isAdmin && (
          <button
            onClick={() => vehicleId && onPurchase(vehicleId)}
            disabled={isOutOfStock || isPurchasing}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : isPurchasing
                ? "bg-emerald-400 text-white cursor-wait"
                : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.99] shadow-md hover:shadow-lg focus:ring-2 focus:ring-emerald-500"
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
                <span>Processing...</span>
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
