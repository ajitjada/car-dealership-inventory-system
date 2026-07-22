import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { purchaseService } from "../../services/purchase.service";
import { CustomerPurchase } from "../../types/purchase.types";

export const MyPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<CustomerPurchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await purchaseService.getMyPurchases();
      setPurchases(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to load purchase history";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            My Purchase History
          </h1>
          <p className="mt-2 text-emerald-100 text-xs sm:text-sm font-medium">
            View your order history, purchased vehicle details, and transaction receipts.
          </p>
        </div>
        <div className="flex-shrink-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
          <span className="text-[10px] uppercase text-emerald-200 font-bold tracking-wider block">Total Orders</span>
          <span className="text-2xl font-black text-white">{loading ? "..." : purchases.length}</span>
        </div>
      </div>

      {/* Main Table / Grid View */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Transactions</h2>
          <button
            onClick={fetchPurchases}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <span>🔄 Refresh</span>
          </button>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-16 bg-slate-100 rounded-2xl w-full"></div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div role="alert" className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-xs">
            <div className="flex items-start">
              <div className="flex-shrink-0 text-red-500 text-xl">⚠️</div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-bold text-red-800">Unable to load purchase history</h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
                <button
                  onClick={fetchPurchases}
                  className="mt-3 text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && purchases.length === 0 && (
          <div className="min-h-[320px] flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-emerald-100 shadow-2xs">
              🛍️
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Purchases Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium">
              You haven't purchased any vehicles yet. Explore our dealership inventory to place your first order.
            </p>
            <Link
              to="/dashboard"
              className="mt-5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Browse Inventory
            </Link>
          </div>
        )}

        {/* Purchases Table / Card View */}
        {!loading && !error && purchases.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Vehicle Name</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6 text-center">Qty</th>
                    <th className="py-4 px-6 text-right">Price</th>
                    <th className="py-4 px-6 text-right">Total Amount</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {purchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{purchase.vehicle}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                          {purchase.category || "Sedan"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold">{purchase.quantity}</td>
                      <td className="py-4 px-6 text-right">{formatCurrency(purchase.purchasePrice)}</td>
                      <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                        {formatCurrency(purchase.totalAmount)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1">
                          <span>✓</span> {purchase.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-500">{purchase.purchasedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="sm:hidden divide-y divide-slate-100">
              {purchases.map((purchase) => (
                <div key={purchase._id} className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{purchase.vehicle}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                        {purchase.category || "Sedan"}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider">
                      ✓ {purchase.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                      <span className="font-bold text-slate-800">{purchase.quantity} unit(s)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Purchase Date</span>
                      <span className="font-semibold text-slate-700">{purchase.purchasedAt}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Unit Price</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(purchase.purchasePrice)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Amount</span>
                      <span className="font-extrabold text-slate-900 text-sm">{formatCurrency(purchase.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
