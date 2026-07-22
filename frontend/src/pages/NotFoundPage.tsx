import React from "react";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-12">
      <div className="w-24 h-24 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-4xl mb-6 shadow-xs">
        🧭
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-md mt-3 mb-8 font-medium">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
      >
        ← Return to Dashboard
      </Link>
    </div>
  );
};
