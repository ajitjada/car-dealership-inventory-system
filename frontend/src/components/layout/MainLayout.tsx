import React from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 mb-10 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};
