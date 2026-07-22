import React, { useState } from "react";
import { Vehicle } from "../../types/vehicle.types";

interface RestockVehicleDialogProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  isRestocking: boolean;
  onClose: () => void;
  onConfirm: (quantityToAdd: number) => void;
}

export const RestockVehicleDialog: React.FC<RestockVehicleDialogProps> = ({
  vehicle,
  isOpen,
  isRestocking,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !vehicle) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) {
      setError("Restock quantity must be a positive number greater than 0.");
      return;
    }
    setError(null);
    onConfirm(Number(quantity));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center space-x-3 text-indigo-600">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
            📦
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Restock Vehicle</h3>
            <p className="text-xs text-gray-500">
              Current stock:{" "}
              <strong className="text-indigo-600">{vehicle.quantity}</strong> units
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="restock-quantity"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1"
            >
              Quantity to Add
            </label>
            <input
              id="restock-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(Number(e.target.value));
                setError(null);
              }}
              placeholder="e.g., 5, 10, 20"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isRestocking}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRestocking}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isRestocking ? (
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
                  <span>Restocking...</span>
                </>
              ) : (
                <span>Confirm Restock</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
