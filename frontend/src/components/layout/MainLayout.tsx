import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © Car Dealership Inventory System
      </footer>
    </div>
  );
};
