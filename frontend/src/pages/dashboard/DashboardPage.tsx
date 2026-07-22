import React from "react";
import { authService } from "../../services/auth.service";

export const DashboardPage: React.FC = () => {
  const user = authService.getCurrentUser();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Welcome back, {user?.name || user?.email || "User"}!
        </h1>
        <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-2xl">
          Manage dealership inventory, monitor vehicle stock levels, and oversee sales operations seamlessly.
        </p>
      </div>

      {/* Dashboard Overview Cards Placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total Inventory</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">🚗</div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">--</p>
          <span className="text-xs text-gray-400">Inventory features coming soon</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Available Categories</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">🏷️</div>
          </div>
          <p className="mt-4 text-3xl font-extrabold text-gray-900">--</p>
          <span className="text-xs text-gray-400">Categories coming soon</span>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">User Role</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">👤</div>
          </div>
          <p className="mt-4 text-xl font-bold text-gray-900 uppercase">
            {user?.role || "Customer"}
          </p>
          <span className="text-xs text-gray-400">Authenticated Session</span>
        </div>
      </div>

      {/* Content Placeholder */}
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center py-12">
        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          📋
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Dashboard Area Placeholder</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          Vehicle listings, search filters, and management actions will be displayed here in subsequent features.
        </p>
      </div>
    </div>
  );
};
