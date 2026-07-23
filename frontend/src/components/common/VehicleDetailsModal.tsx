import React, { useState } from "react";
import { Vehicle } from "../../types/vehicle.types";
import { authService } from "../../services/auth.service";

interface VehicleDetailsModalProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (vehicleId: string) => void;
  isPurchasing?: boolean;
}

export const VehicleDetailsModal: React.FC<VehicleDetailsModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onPurchase,
  isPurchasing = false,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  if (!isOpen || !vehicle) return null;

  const vehicleId = vehicle._id || vehicle.id || "";
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const isOutOfStock = vehicle.quantity <= 0;

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [];
  const currentMainImage = images[selectedImageIndex]?.url || null;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                {vehicle.category}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isOutOfStock
                    ? "bg-red-50 text-red-600 border-red-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isOutOfStock ? "Out of Stock" : `${vehicle.quantity} In Stock`}
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {vehicle.make} {vehicle.model}
            </h2>
            {vehicle.year && (
              <p className="text-xs font-semibold text-slate-400">Model Year: {vehicle.year}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Gallery Section */}
        <div className="space-y-3">
          {/* Main Large Image */}
          <div className="relative h-64 sm:h-80 w-full bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-slate-200">
            {currentMainImage ? (
              <img
                src={currentMainImage}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-full object-cover transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 space-y-2 p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center text-3xl border border-slate-800">
                  🚗
                </div>
                <p className="text-xs font-bold text-slate-400">No Vehicle Images Uploaded</p>
                <p className="text-[10px] text-slate-600">Default dealer preview graphic</p>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery Row */}
          {images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vehicle Information Grid */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Make</span>
            <span className="font-extrabold text-slate-900">{vehicle.make}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Model</span>
            <span className="font-extrabold text-slate-900">{vehicle.model}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
            <span className="font-extrabold text-slate-900">{vehicle.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Price</span>
            <span className="font-black text-emerald-600 text-sm">{formattedPrice}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Total Price
            </span>
            <span className="text-2xl font-black text-slate-900">{formattedPrice}</span>
          </div>

          {onPurchase && !isAdmin && (
            <button
              onClick={() => vehicleId && onPurchase(vehicleId)}
              disabled={isOutOfStock || isPurchasing}
              className={`py-3 px-6 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : isPurchasing
                  ? "bg-emerald-400 text-white cursor-wait"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-emerald-500"
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
    </div>
  );
};
