import React, { useState, useEffect } from "react";

interface SearchBarProps {
  onSearch: (make: string, model: string) => void;
  initialMake?: string;
  initialModel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialMake = "",
  initialModel = "",
}) => {
  const [make, setMake] = useState(initialMake);
  const [model, setModel] = useState(initialModel);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(make, model);
    }, 300);

    return () => clearTimeout(timer);
  }, [make, model, onSearch]);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label htmlFor="make-search" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Make
        </label>
        <div className="relative">
          <input
            id="make-search"
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Search by Make (e.g., Toyota, Tesla)..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
          <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
        </div>
      </div>

      <div className="flex-1">
        <label htmlFor="model-search" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Model
        </label>
        <div className="relative">
          <input
            id="model-search"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Search by Model (e.g., Camry, Civic)..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
          <span className="absolute left-3 top-3 text-slate-400 text-xs">🚘</span>
        </div>
      </div>
    </div>
  );
};
