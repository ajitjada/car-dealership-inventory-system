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

  const isAdmin = user?.role === "admin";

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* App Logo & Title */}
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform text-lg">
              🚗
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight block group-hover:text-emerald-600 transition-colors">
                DriveStock
              </span>
              <span className="text-xs text-slate-500 font-medium block -mt-1">
                Inventory System
              </span>
            </div>
          </Link>

          {/* Navigation Links for Authenticated Users */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 text-xs font-bold">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-xl transition-colors ${location.pathname === "/dashboard"
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  }`}
              >
                Inventory
              </Link>

              {!isAdmin && (
                <Link
                  to="/my-purchases"
                  className={`px-3 py-2 rounded-xl transition-colors ${location.pathname === "/my-purchases"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                    }`}
                >
                  My Purchases
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/admin/purchases"
                  className={`px-3 py-2 rounded-xl transition-colors ${location.pathname === "/admin/purchases"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                    }`}
                >
                  Purchase History
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* User Info & Logout Button */}
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-100/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-emerald-900">{user.email}</span>
              {user.role && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white uppercase tracking-wider">
                  {user.role}
                </span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400"
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
              className="text-xs font-semibold text-slate-700 hover:text-emerald-600 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-xs font-semibold text-white bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
