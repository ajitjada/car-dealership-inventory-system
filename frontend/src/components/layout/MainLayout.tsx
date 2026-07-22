import React from "react";
import { Outlet } from "react-router-dom";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Car Dealership Inventory</h1>
        </div>
      </header>
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © Car Dealership Inventory System
      </footer>
    </div>
  );
};
