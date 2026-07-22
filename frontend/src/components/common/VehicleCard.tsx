import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Vehicle } from "../../types/vehicle.types";
import { authService } from "../../services/auth.service";
import { VehicleDetailsModal } from "./VehicleDetailsModal";

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
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const vehicleId = vehicle._id || vehicle.id || "";
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  const isOutOfStock = vehicle.quantity <= 0;
  const primaryImage = vehicle.images && vehicle.images.length > 0 ? vehicle.images[0].url : null;
  const totalImageCount = vehicle.images ? vehicle.images.length : 0;

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group hover:-translate-y-1">
        {/* Top Image Container */}
        <div
          onClick={() => setIsDetailsOpen(true)}
          className="relative h-48 w-full bg-slate-900 overflow-hidden cursor-pointer flex items-center justify-center group/img"
        >
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 group-hover/img:scale-105 transition-transform">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-emerald-400 flex items-center justify-center text-2xl border border-slate-700 shadow-inner">
                🚗
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                No Preview Image
              </span>
            </div>
          )}

          {/* Image Count Badge */}
          {totalImageCount > 0 && (
            <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-white/20 flex items-center space-x-1">
              <span>🖼️</span>
              <span>{totalImageCount} {totalImageCount === 1 ? "Image" : "Images"}</span>
            </span>
          )}

          {/* Category Pill */}
          <span className="absolute top-3 left-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-900/80 backdrop-blur-md text-emerald-200 border border-emerald-500/30 uppercase tracking-wider">
            {vehicle.category}
          </span>
        </div>

        {/* Card Body */}
        <div className="p-5 pb-3">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3
                onClick={() => setIsDetailsOpen(true)}
                className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-600 transition-colors cursor-pointer"
              >
                {vehicle.make} {vehicle.model}
              </h3>
              {vehicle.year && (
                <p className="text-xs text-slate-400 font-semibold">Year: {vehicle.year}</p>
              )}
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                isOutOfStock
                  ? "bg-red-50 text-red-600 border-red-100"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `${vehicle.quantity} In Stock`}
            </span>
          </div>
        </div>

        {/* Footer / Controls */}
        <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Price
              </span>
              <span className="text-xl font-black text-slate-900">{formattedPrice}</span>
            </div>
            <button
              onClick={() => setIsDetailsOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            >
              View Gallery
            </button>
          </div>

          {/* Admin Toolbar */}
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

      {/* Details & Gallery Modal */}
      <VehicleDetailsModal
        vehicle={vehicle}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onPurchase={onPurchase}
        isPurchasing={isPurchasing}
      />
    </>
  );
};
