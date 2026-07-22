import React from "react";

interface FilterPanelProps {
  category: string;
  minPrice: string;
  maxPrice: string;
  categories: string[];
  onChange: (updates: { category?: string; minPrice?: string; maxPrice?: string }) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  category,
  minPrice,
  maxPrice,
  categories,
  onChange,
  onReset,
}) => {
  const hasActiveFilters = category !== "" || minPrice !== "" || maxPrice !== "";

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚙️</span> Filter & Refine
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category-select" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Filter */}
        <div>
          <label htmlFor="min-price" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Min Price ($)
          </label>
          <input
            id="min-price"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            placeholder="Min $"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label htmlFor="max-price" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Max Price ($)
          </label>
          <input
            id="max-price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            placeholder="Max $"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
