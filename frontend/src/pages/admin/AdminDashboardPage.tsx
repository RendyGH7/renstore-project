import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  Award,
  Zap
} from 'lucide-react';
import api from '../../api/axios';
import { ApiResponse, DashboardStatsResponse, SalesPeriodData } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { RealtimeLineChart } from '../../components/admin/RealtimeLineChart';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Realtime Analytics controls
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '6months' | 'yearly'>('6months');
  const [metricFilter, setMetricFilter] = useState<'all' | 'revenue' | 'volume'>('all');
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const timerRef = useRef<number | null>(null);

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<DashboardStatsResponse>>('/admin/dashboard/stats');
      if (res.data?.data) {
        setStats(res.data.data);
      } else {
        if (!isSilent) setError('Gagal memuat data statistik.');
      }
    } catch (err: any) {
      if (!isSilent) {
        setError(err.response?.data?.message || 'Gagal memuat data statistik dari server.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  // Real-time polling timer (every 15 seconds)
  useEffect(() => {
    if (!autoSync) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      fetchDashboard(true);
    }, 15000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoSync, fetchDashboard]);

  const formatPrice = (price: number | string | undefined) => {
    return 'IDR ' + Number(price || 0).toLocaleString('id-ID');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-200/80 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200/80 rounded-3xl"></div>
          <div className="h-96 bg-slate-200/80 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Gagal Memuat Dashboard</h3>
          <p className="text-xs text-slate-500 mt-1">{error}</p>
        </div>
        <button
          onClick={() => fetchDashboard(false)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Coba Lagi
        </button>
      </div>
    );
  }

  const metrics = stats?.metrics;
  const recentOrders = stats?.recent_orders || [];
  const topSelling = stats?.top_selling_products || [];

  // Determine current active breakdown list based on period selector
  let activePeriodData: SalesPeriodData[] = [];
  if (selectedPeriod === 'today') {
    activePeriodData = stats?.hourly_sales || [];
  } else if (selectedPeriod === '7days') {
    activePeriodData = stats?.daily_sales || [];
  } else if (selectedPeriod === 'yearly') {
    activePeriodData = stats?.yearly_sales || [];
  } else {
    activePeriodData = stats?.monthly_sales || [];
  }

  const periodTotalRevenue = activePeriodData.reduce((acc, curr) => acc + (Number(curr.total_sales) || 0), 0);
  const periodTotalOrders = activePeriodData.reduce((acc, curr) => acc + (Number(curr.orders_count) || 0), 0);
  const periodCompletedOrders = activePeriodData.reduce((acc, curr) => acc + (Number(curr.completed_count) || 0), 0);
  const periodAvgTicket = periodTotalOrders > 0 ? Math.round(periodTotalRevenue / periodTotalOrders) : 0;
  const periodSuccessRate = periodTotalOrders > 0 ? Math.round((periodCompletedOrders / periodTotalOrders) * 100) : 100;

  // Find peak period in current dataset
  const peakPeriodItem = activePeriodData.reduce((prev, current) => {
    return (Number(current.total_sales) > Number(prev.total_sales)) ? current : prev;
  }, activePeriodData[0] || { period: '-', total_sales: 0 });

  const avgOrderValue = metrics?.total_orders && metrics.total_orders > 0
    ? Math.round(Number(metrics.total_revenue || 0) / metrics.total_orders)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome Back, {user?.name || 'Administrator'}!
          </h1>

        </div>

        <div className="flex items-center gap-2">
          {/* Auto-Sync Toggle Button */}
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs cursor-pointer ${autoSync
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            title={autoSync ? "Auto-Sync Realtime Aktif (Pembaruan Otomatis 15 detik)" : "Auto-Sync Nonaktif"}
          >
            <span className={`w-2 h-2 rounded-full ${autoSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{autoSync ? 'Live Sync ON' : 'Live Sync OFF'}</span>
          </button>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh Data Sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Sinkronisasi...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 5 Soft Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Soft Peach - Ecommerce Revenue */}
        <div className="p-5 rounded-2xl bg-[#fff1ed] border border-[#fed7cc]/60 flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-slate-700">Ecommerce Revenue</span>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 block truncate">
              {formatPrice(metrics?.total_revenue)}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <ArrowUpRight className="w-3 h-3" /> +14.9%
              </span>
              <span className="text-[10px] text-slate-500 font-medium truncate">vs bulan lalu</span>
            </div>
          </div>
        </div>

        {/* Card 2: Soft Mint Green - New Customers */}
        <div className="p-5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0]/60 flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-slate-700">New Customers</span>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 block">
              {metrics?.total_customers ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <ArrowUpRight className="w-3 h-3" /> +8.6%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Akun aktif</span>
            </div>
          </div>
        </div>

        {/* Card 3: Soft Blue - Total Orders */}
        <div className="p-5 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe]/60 flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-slate-700">Total Volume Order</span>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 block">
              {metrics?.total_orders ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                <ArrowUpRight className="w-3 h-3" /> +25.4%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{metrics?.completed_orders ?? 0} selesai</span>
            </div>
          </div>
        </div>

        {/* Card 4: Soft Yellow/Amber - Average Order Value */}
        <div className="p-5 rounded-2xl bg-[#fefce8] border border-[#fef08a]/60 flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-slate-700">Average Order Value</span>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 block truncate">
              {formatPrice(avgOrderValue)}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <ArrowUpRight className="w-3 h-3" /> +35.2%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">per checkout</span>
            </div>
          </div>
        </div>

        {/* Card 5: Soft Purple - Active Products */}
        <div className="p-5 rounded-2xl bg-[#f5f3ff] border border-[#ddd6fe]/60 flex flex-col justify-between space-y-3">
          <span className="text-xs font-semibold text-slate-700">Active Products</span>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 block">
              {metrics?.active_products ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold">
                {metrics?.total_products ?? 0} total SKU
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Modern Line Chart Analytics + Most Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Professional Interactive Line Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/80 space-y-6 shadow-xs">
          {/* Quick Snapshot Metrics for Selected Period */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Pendapatan
              </span>
              <span className="text-sm sm:text-base font-extrabold text-blue-600 block mt-0.5 truncate">
                {formatPrice(periodTotalRevenue)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Transaksi
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-900 block mt-0.5">
                {periodTotalOrders} Order
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Order Selesai
              </span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-600 block mt-0.5">
                {periodCompletedOrders} ({periodSuccessRate}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Rata-rata Order
              </span>
              <span className="text-sm sm:text-base font-extrabold text-slate-700 block mt-0.5 truncate">
                {formatPrice(periodAvgTicket)}
              </span>
            </div>
          </div>

          {/* Render Realtime SVG Line Chart */}
          <RealtimeLineChart
            data={activePeriodData}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            metricFilter={metricFilter}
            onMetricFilterChange={setMetricFilter}
            formatPrice={formatPrice}
          />

          {/* Bottom Insights Bar */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                Puncak Penjualan:{' '}
                <strong className="text-slate-800 font-bold">{peakPeriodItem.period}</strong>{' '}
                ({formatPrice(peakPeriodItem.total_sales)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>Garis Biru: Income Growth</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2" />
              <span>Garis Hijau: Order Volume</span>
            </div>
          </div>
        </div>

        {/* Right: Most Selling Products Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Award className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Most Selling Products</h2>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">Belum ada penjualan produk.</p>
            ) : (
              topSelling.map((prod, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors">
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{prod.product_name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">ID SKU: #{prod.product_id}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white border border-slate-200 text-slate-800 shadow-2xs">
                      {prod.total_sold} Terjual
                    </span>
                    <span className="text-[11px] font-extrabold text-blue-600 block mt-0.5 font-mono">
                      {formatPrice(prod.total_revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table (Image 2 Match) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
          <span className="text-xs font-semibold text-blue-600">Real-time Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-3 font-semibold">Nomor Order</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Nominal</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Waktu Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Belum ada pesanan terbaru.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-slate-900">{ord.order_number}</td>
                    <td className="py-3.5 text-slate-700 font-medium">{ord.user?.name || 'Customer'}</td>
                    <td className="py-3.5 font-bold text-slate-900">{formatPrice(ord.total_amount)}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ord.status === 'completed' ? 'bg-emerald-500' : ord.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                          }`}></span>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">
                      {new Date(ord.created_at).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
