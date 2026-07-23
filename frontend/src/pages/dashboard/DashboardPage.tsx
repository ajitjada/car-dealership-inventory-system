import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { vehicleService } from "../../services/vehicle.service";
import { Vehicle, VehicleSearchFilters } from "../../types/vehicle.types";
import { VehicleGrid } from "../../components/common/VehicleGrid";
import { VehicleSkeleton } from "../../components/common/VehicleSkeleton";
import { SearchBar } from "../../components/common/SearchBar";
import { FilterPanel } from "../../components/common/FilterPanel";
import { DeleteVehicleDialog } from "../../components/common/DeleteVehicleDialog";
import { RestockVehicleDialog } from "../../components/common/RestockVehicleDialog";
import { authService } from "../../services/auth.service";

interface ToastNotification {
  message: string;
  type: "success" | "error";
}

export const DashboardPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Purchase & Admin Action States
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Delete Dialog State
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Restock Dialog State
  const [restockingVehicle, setRestockingVehicle] = useState<Vehicle | null>(null);
  const [isRestocking, setIsRestocking] = useState<boolean>(false);

  // Search & Filter State
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const user = authService.getCurrentUser();
  const isAdmin = user?.role === "admin";

  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.category) categoriesSet.add(v.category);
    });
    ["Sedan", "SUV", "Truck", "Coupe", "Convertible", "Hatchback"].forEach((c) =>
      categoriesSet.add(c)
    );
    return Array.from(categoriesSet).sort();
  }, [vehicles]);

  const executeSearch = useCallback(async (filters: VehicleSearchFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.searchVehicles(filters);
      setVehicles(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to search vehicle inventory";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const currentFilters = useMemo(
    (): VehicleSearchFilters => ({
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      category: category || undefined,
      minPrice: minPrice !== "" ? minPrice : undefined,
      maxPrice: maxPrice !== "" ? maxPrice : undefined,
    }),
    [make, model, category, minPrice, maxPrice]
  );

  useEffect(() => {
    executeSearch(currentFilters);
  }, [currentFilters, executeSearch]);

  // Customer Purchase Handler
  const handlePurchase = async (vehicleId: string) => {
    const targetVehicle = vehicles.find((v) => (v._id || v.id) === vehicleId);
    const vehicleName = targetVehicle ? `${targetVehicle.make} ${targetVehicle.model}` : "Vehicle";

    setPurchasingId(vehicleId);
    setToast(null);

    try {
      await vehicleService.purchaseVehicle(vehicleId);
      setToast({
        message: `Successfully purchased ${vehicleName}! Quantity updated.`,
        type: "success",
      });
      await executeSearch(currentFilters);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || `Failed to purchase ${vehicleName}`;
      setToast({
        message,
        type: "error",
      });
    } finally {
      setPurchasingId(null);
    }
  };

  // Admin Delete Handler
  const handleConfirmDelete = async () => {
    if (!deletingVehicle) return;
    const vehicleId = deletingVehicle._id || deletingVehicle.id;
    if (!vehicleId) return;

    setIsDeleting(true);
    setToast(null);
    try {
      await vehicleService.deleteVehicle(vehicleId);
      setToast({
        message: `Successfully deleted ${deletingVehicle.make} ${deletingVehicle.model}!`,
        type: "success",
      });
      setDeletingVehicle(null);
      await executeSearch(currentFilters);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete vehicle";
      setToast({ message, type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  // Admin Restock Handler
  const handleConfirmRestock = async (quantityToAdd: number) => {
    if (!restockingVehicle) return;
    const vehicleId = restockingVehicle._id || restockingVehicle.id;
    if (!vehicleId) return;

    setIsRestocking(true);
    setToast(null);
    try {
      await vehicleService.restockVehicle(vehicleId, quantityToAdd);
      setToast({
        message: `Successfully added ${quantityToAdd} units to ${restockingVehicle.make} ${restockingVehicle.model}!`,
        type: "success",
      });
      setRestockingVehicle(null);
      await executeSearch(currentFilters);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to restock vehicle";
      setToast({ message, type: "error" });
    } finally {
      setIsRestocking(false);
    }
  };

  const handleSearchChange = useCallback((newMake: string, newModel: string) => {
    setMake(newMake);
    setModel(newModel);
  }, []);

  const handleFilterChange = (updates: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => {
    if (updates.category !== undefined) setCategory(updates.category);
    if (updates.minPrice !== undefined) setMinPrice(updates.minPrice);
    if (updates.maxPrice !== undefined) setMaxPrice(updates.maxPrice);
  };

  const handleResetFilters = () => {
    setMake("");
    setModel("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  const isFiltered = make !== "" || model !== "" || category !== "" || minPrice !== "" || maxPrice !== "";

  return (
    <div className="space-y-8">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          role="alert"
          className={`p-4 rounded-2xl shadow-md border flex items-center justify-between transition-all ${toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-red-50 border-red-200 text-red-900"
            }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-xl">{toast.type === "success" ? "🎉" : "⚠️"}</span>
            <span className="text-xs font-bold">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Welcome Hero Banner - Emerald Green Gradient */}
      <div className="bg-linear-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || user?.email || "User"}
            </h1>
            {isAdmin && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-300 text-emerald-950 uppercase tracking-widest shadow-xs">
                ADMIN ACCESS
              </span>
            )}
          </div>
          <p className="mt-2 text-emerald-100 text-xs sm:text-sm max-w-xl font-medium leading-relaxed">
            {isAdmin
              ? "Manage dealership inventory, add new listings, edit specifications, and restock vehicle inventory."
              : "Browse available inventory, purchase vehicles, and check real-time stock levels."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin/vehicles/new"
              className="w-full sm:w-auto px-5 py-3 bg-emerald-300 hover:bg-emerald-200 text-emerald-950 font-black text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              <span>➕ Add New Vehicle</span>
            </Link>
          )}
          <div className="shrink-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
            <span className="text-[10px] uppercase text-emerald-200 font-bold tracking-wider block">Available Vehicles</span>
            <span className="text-2xl font-black text-white">{loading ? "..." : vehicles.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-4">
        <SearchBar onSearch={handleSearchChange} initialMake={make} initialModel={model} />
        <FilterPanel
          category={category}
          minPrice={minPrice}
          maxPrice={maxPrice}
          categories={availableCategories}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Results Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isFiltered ? "Search Results" : "All Vehicles"}
          </h2>
          {isFiltered && (
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              Filtering Active ({vehicles.length} found)
            </span>
          )}
        </div>

        {/* Loading Skeleton State */}
        {loading && <VehicleSkeleton />}

        {/* Error Alert State */}
        {!loading && error && (
          <div role="alert" className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-xs">
            <div className="flex items-start">
              <div className="shrink-0 text-red-500 text-xl">⚠️</div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-bold text-red-800">Search error occurred</h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => executeSearch(currentFilters)}
                  className="mt-3 text-xs font-bold bg-red-600 text-white px-3.5 py-2 rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty Search Results State */}
        {!loading && !error && vehicles.length === 0 && (
          <div className="min-h-75 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-emerald-100 shadow-2xs">
              🚘
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Vehicles Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium">
              No vehicles matched your search criteria. Try adjusting your make, model, or price filters.
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="mt-5 text-xs font-bold bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all shadow-md cursor-pointer"
              >
                Clear All Search Filters
              </button>
            )}
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && !error && vehicles.length > 0 && (
          <VehicleGrid
            vehicles={vehicles}
            onPurchase={handlePurchase}
            onRestock={(v) => setRestockingVehicle(v)}
            onDelete={(v) => setDeletingVehicle(v)}
            purchasingId={purchasingId}
          />
        )}
      </div>

      {/* Admin Dialog Modals */}
      <DeleteVehicleDialog
        vehicle={deletingVehicle}
        isOpen={deletingVehicle !== null}
        isDeleting={isDeleting}
        onClose={() => setDeletingVehicle(null)}
        onConfirm={handleConfirmDelete}
      />

      <RestockVehicleDialog
        vehicle={restockingVehicle}
        isOpen={restockingVehicle !== null}
        isRestocking={isRestocking}
        onClose={() => setRestockingVehicle(null)}
        onConfirm={handleConfirmRestock}
      />
    </div>
  );
};
