import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authService } from "../../services/auth.service";
import { User } from "../../types/auth.types";

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, [location]);

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser());
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const handleLogout = () => {
    authService.clearAuthSession();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* App Logo & Title */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md group-hover:bg-indigo-700 transition-colors text-lg">
            🚗
          </div>
          <div>
            <span className="text-lg font-bold text-gray-900 tracking-tight block">
              DriveStock
            </span>
            <span className="text-xs text-gray-500 block -mt-1">
              Inventory System
            </span>
          </div>
        </Link>

        {/* User Info & Logout Button */}
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium text-gray-700">{user.email}</span>
              {user.role && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 uppercase">
                  {user.role}
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg shadow-sm transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
