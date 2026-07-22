import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { vehicleService } from "../../services/vehicle.service";
import { Vehicle } from "../../types/vehicle.types";

export interface AddVehicleFormInputs {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
}

export const AddVehiclePage: React.FC = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddVehicleFormInputs>();

  const onSubmit = async (data: AddVehicleFormInputs) => {
    setApiError(null);
    try {
      const payload: Partial<Vehicle> = {
        make: data.make.trim(),
        model: data.model.trim(),
        category: data.category.trim(),
        price: Number(data.price),
        quantity: Number(data.quantity),
      };
      if (data.year) payload.year = Number(data.year);

      await vehicleService.createVehicle(payload);
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to create vehicle";
      setApiError(message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Add New Vehicle
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create a new vehicle listing in the dealership inventory database.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-sm transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start space-x-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-sm font-medium text-red-700">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Make */}
            <div>
              <label htmlFor="make" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Make *
              </label>
              <input
                id="make"
                type="text"
                placeholder="e.g., Toyota"
                {...register("make", { required: "Vehicle make is required" })}
                className={`w-full px-3 py-2.5 border ${
                  errors.make ? "border-red-500" : "border-gray-300"
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.make && <p className="text-xs text-red-600 mt-1">{errors.make.message}</p>}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Model *
              </label>
              <input
                id="model"
                type="text"
                placeholder="e.g., Camry"
                {...register("model", { required: "Vehicle model is required" })}
                className={`w-full px-3 py-2.5 border ${
                  errors.model ? "border-red-500" : "border-gray-300"
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.model && <p className="text-xs text-red-600 mt-1">{errors.model.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                id="category"
                {...register("category", { required: "Category is required" })}
                className={`w-full px-3 py-2.5 border ${
                  errors.category ? "border-red-500" : "border-gray-300"
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white`}
              >
                <option value="">Select Category</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Hatchback">Hatchback</option>
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Year (Optional)
              </label>
              <input
                id="year"
                type="number"
                placeholder="e.g., 2024"
                {...register("year", {
                  min: { value: 1900, message: "Year must be valid" },
                })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.year && <p className="text-xs text-red-600 mt-1">{errors.year.message}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Price ($) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                placeholder="25000"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 1, message: "Price must be greater than 0" },
                })}
                className={`w-full px-3 py-2.5 border ${
                  errors.price ? "border-red-500" : "border-gray-300"
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                placeholder="5"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
                className={`w-full px-3 py-2.5 border ${
                  errors.quantity ? "border-red-500" : "border-gray-300"
                } rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              {errors.quantity && <p className="text-xs text-red-600 mt-1">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                  <span>Creating Vehicle...</span>
                </>
              ) : (
                <span>Save Vehicle Listing</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
