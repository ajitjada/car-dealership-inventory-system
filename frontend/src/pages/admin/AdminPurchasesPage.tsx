import React, { useEffect, useState, useMemo } from "react";
import { purchaseService } from "../../services/purchase.service";
import { AdminPurchase } from "../../types/purchase.types";

export const AdminPurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [customerQuery, setCustomerQuery] = useState<string>("");
  const [vehicleQuery, setVehicleQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await purchaseService.getAllPurchases();
      setPurchases(data);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to load admin purchase history";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const filteredPurchases = useMemo(() => {
    let result = [...purchases];

    if (customerQuery.trim() !== "") {
      const q = customerQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.customerName.toLowerCase().includes(q) ||
          p.customerEmail.toLowerCase().includes(q)
      );
    }

    if (vehicleQuery.trim() !== "") {
      const q = vehicleQuery.toLowerCase();
      result = result.filter((p) => p.vehicleName.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const dateA = new Date(a.purchasedAt).getTime();
      const dateB = new Date(b.purchasedAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [purchases, customerQuery, vehicleQuery, sortOrder]);

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
      <div className="bg-linear-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Customer Purchase History
            </h1>
            <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-300 text-emerald-950 uppercase tracking-widest shadow-xs">
              ADMIN CONTROL
            </span>
          </div>
          <p className="mt-2 text-emerald-100 text-xs sm:text-sm font-medium">
            Monitor system-wide sales transactions, customer orders, and transaction timestamps.
          </p>
        </div>
        <div className="shrink-0 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
          <span className="text-[10px] uppercase text-emerald-200 font-bold tracking-wider block">Total Transactions</span>
          <span className="text-2xl font-black text-white">{loading ? "..." : purchases.length}</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="customer-search" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Search Customer
          </label>
          <input
            id="customer-search"
            type="text"
            value={customerQuery}
            onChange={(e) => setCustomerQuery(e.target.value)}
            placeholder="Search by Customer Name or Email..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
        </div>

        <div className="flex-1">
          <label htmlFor="vehicle-search" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Search Vehicle
          </label>
          <input
            id="vehicle-search"
            type="text"
            value={vehicleQuery}
            onChange={(e) => setVehicleQuery(e.target.value)}
            placeholder="Search by Vehicle Name..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
          />
        </div>

        <div className="w-full sm:w-48">
          <label htmlFor="sort-order" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Sort Order
          </label>
          <select
            id="sort-order"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-2xs"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Transactions</h2>
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
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 bg-slate-100 rounded-2xl w-full"></div>
            ))}
          </div>
        )}

        {/* Error Alert */}
        {!loading && error && (
          <div role="alert" className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl shadow-xs">
            <div className="flex items-start">
              <div className="shrink-0 text-red-500 text-xl">⚠️</div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-bold text-red-800">Unable to load purchase records</h3>
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
        {!loading && !error && filteredPurchases.length === 0 && (
          <div className="min-h-80 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4 border border-emerald-100 shadow-2xs">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Purchase Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium">
              No transactions matched your search criteria. Try clearing or adjusting your customer or vehicle search filters.
            </p>
          </div>
        )}

        {/* Transactions Table */}
        {!loading && !error && filteredPurchases.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Vehicle Name</th>
                    <th className="py-4 px-6 text-center">Qty</th>
                    <th className="py-4 px-6 text-right">Unit Price</th>
                    <th className="py-4 px-6 text-right">Total Amount</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Purchase Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase._id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{purchase.customerName}</td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">{purchase.customerEmail}</td>
                      <td className="py-4 px-6 font-bold text-emerald-950">{purchase.vehicleName}</td>
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
                      <td className="py-4 px-6 text-right text-slate-500 font-medium">{purchase.purchasedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
