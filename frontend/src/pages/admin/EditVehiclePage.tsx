import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { vehicleService } from "../../services/vehicle.service";
import { Vehicle } from "../../types/vehicle.types";

export interface EditVehicleFormInputs {
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  year?: number;
}

export const EditVehiclePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditVehicleFormInputs>();

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const vehicles = await vehicleService.getVehicles();
        const found = vehicles.find((v) => (v._id || v.id) === id);
        if (found) {
          setValue("make", found.make);
          setValue("model", found.model);
          setValue("category", found.category);
          setValue("price", found.price);
          setValue("quantity", found.quantity);
          if (found.year) setValue("year", found.year);
        } else {
          setApiError("Vehicle not found in database.");
        }
      } catch (err: any) {
        setApiError(err.message || "Failed to load vehicle details.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [id, setValue]);

  const onSubmit = async (data: EditVehicleFormInputs) => {
    if (!id) return;
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

      await vehicleService.updateVehicle(id, payload);
      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to update vehicle";
      setApiError(message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs text-slate-500 font-bold">Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Edit Vehicle Listing
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Update specifications, price, or inventory count.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="text-xs font-bold text-slate-700 hover:text-emerald-600 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100/80 space-y-6">
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start space-x-3">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="text-xs font-semibold text-red-800">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Make */}
            <div>
              <label htmlFor="make" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Make *
              </label>
              <input
                id="make"
                type="text"
                {...register("make", { required: "Vehicle make is required" })}
                className={`w-full px-3 py-2.5 border ${
                  errors.make ? "border-red-500" : "border-slate-300"
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.make && <p className="text-xs text-red-600 mt-1 font-medium">{errors.make.message}</p>}
            </div>

            {/* Model */}
            <div>
              <label htmlFor="model" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Model *
              </label>
              <input
                id="model"
                type="text"
                {...register("model", { required: "Vehicle model is required" })}
                className={`w-full px-3 py-2.5 border ${
                  errors.model ? "border-red-500" : "border-slate-300"
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.model && <p className="text-xs text-red-600 mt-1 font-medium">{errors.model.message}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                id="category"
                {...register("category", { required: "Category is required" })}
                className={`w-full px-3 py-2.5 border ${
                  errors.category ? "border-red-500" : "border-slate-300"
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-2xs`}
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Coupe">Coupe</option>
                <option value="Convertible">Convertible</option>
                <option value="Hatchback">Hatchback</option>
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1 font-medium">{errors.category.message}</p>}
            </div>

            {/* Year */}
            <div>
              <label htmlFor="year" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Year (Optional)
              </label>
              <input
                id="year"
                type="number"
                {...register("year", {
                  min: { value: 1900, message: "Year must be valid" },
                })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
              />
              {errors.year && <p className="text-xs text-red-600 mt-1 font-medium">{errors.year.message}</p>}
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Price ($) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 1, message: "Price must be greater than 0" },
                })}
                className={`w-full px-3 py-2.5 border ${
                  errors.price ? "border-red-500" : "border-slate-300"
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.price && <p className="text-xs text-red-600 mt-1 font-medium">{errors.price.message}</p>}
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                {...register("quantity", {
                  required: "Quantity is required",
                  min: { value: 0, message: "Quantity cannot be negative" },
                })}
                className={`w-full px-3 py-2.5 border ${
                  errors.quantity ? "border-red-500" : "border-slate-300"
                } rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs`}
              />
              {errors.quantity && <p className="text-xs text-red-600 mt-1 font-medium">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer focus:ring-2 focus:ring-emerald-500"
            >
              {isSubmitting ? (
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
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Vehicle</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
