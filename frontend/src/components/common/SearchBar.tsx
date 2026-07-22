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
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label htmlFor="make-search" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Make
        </label>
        <div className="relative">
          <input
            id="make-search"
            type="text"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            placeholder="Search by Make (e.g., Toyota, Tesla)..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
        </div>
      </div>

      <div className="flex-1">
        <label htmlFor="model-search" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Model
        </label>
        <div className="relative">
          <input
            id="model-search"
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Search by Model (e.g., Camry, Civic)..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🚘</span>
        </div>
      </div>
    </div>
  );
};
