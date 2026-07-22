import React from "react";

export const VehicleSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 animate-pulse"
        >
          <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
            <div className="h-5 bg-gray-200 rounded-full w-24"></div>
          </div>
          <div className="h-7 bg-gray-200 rounded-lg w-3/4"></div>
          <div className="h-4 bg-gray-100 rounded-lg w-1/3"></div>
          <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
            <div className="space-y-1 w-1/2">
              <div className="h-3 bg-gray-100 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-10 bg-gray-100 rounded-xl"></div>
        </div>
      ))}
    </div>
  );
};
