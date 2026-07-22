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
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚙️</span> Filter & Refine
        </span>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div>
          <label htmlFor="category-select" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => onChange({ category: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-2xs"
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
          <label htmlFor="min-price" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Min Price ($)
          </label>
          <input
            id="min-price"
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => onChange({ minPrice: e.target.value })}
            placeholder="Min $"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
        </div>

        {/* Max Price Filter */}
        <div>
          <label htmlFor="max-price" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Max Price ($)
          </label>
          <input
            id="max-price"
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => onChange({ maxPrice: e.target.value })}
            placeholder="Max $"
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
};
