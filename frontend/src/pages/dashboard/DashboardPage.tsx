import React, { useEffect, useState, useCallback, useMemo } from "react";
import { vehicleService } from "../../services/vehicle.service";
import { Vehicle, VehicleSearchFilters } from "../../types/vehicle.types";
import { VehicleGrid } from "../../components/common/VehicleGrid";
import { SearchBar } from "../../components/common/SearchBar";
import { FilterPanel } from "../../components/common/FilterPanel";
import { authService } from "../../services/auth.service";

export const DashboardPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [make, setMake] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const user = authService.getCurrentUser();

  // Known categories for dropdown selection
  const availableCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    vehicles.forEach((v) => {
      if (v.category) categoriesSet.add(v.category);
    });
    // Add default common categories if inventory is empty/filtered
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

  // Effect to trigger search when category or price filters change
  useEffect(() => {
    const filters: VehicleSearchFilters = {
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      category: category || undefined,
      minPrice: minPrice !== "" ? minPrice : undefined,
      maxPrice: maxPrice !== "" ? maxPrice : undefined,
    };
    executeSearch(filters);
  }, [make, model, category, minPrice, maxPrice, executeSearch]);

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
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || user?.email || "User"}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-xl">
            Search dealership inventory by make or model, filter by price range or category.
          </p>
        </div>
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center sm:text-right">
          <span className="text-xs uppercase text-indigo-200 tracking-wider block">Matching Vehicles</span>
          <span className="text-2xl font-extrabold text-white">{loading ? "..." : vehicles.length}</span>
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
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {isFiltered ? "Search Results" : "All Vehicles"}
          </h2>
          {isFiltered && (
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
              Filtering Active ({vehicles.length} found)
            </span>
          )}
        </div>

        {/* Loading Spinner State */}
        {loading && (
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-gray-500">Searching inventory...</p>
          </div>
        )}

        {/* Error Alert State */}
        {!loading && error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-red-500 text-xl">⚠️</div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-bold text-red-800">Search error occurred</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => executeSearch({ make, model, category, minPrice, maxPrice })}
                  className="mt-3 text-xs font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty Search Results State */}
        {!loading && !error && vehicles.length === 0 && (
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-3xl mb-4">
              🔍
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Vehicles Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              No vehicles matched your search filters. Try adjusting your make, model, or price criteria.
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="mt-4 text-xs font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Clear All Search Filters
              </button>
            )}
          </div>
        )}

        {/* Vehicle Grid */}
        {!loading && !error && vehicles.length > 0 && (
          <VehicleGrid vehicles={vehicles} />
        )}
      </div>
    </div>
  );
};
