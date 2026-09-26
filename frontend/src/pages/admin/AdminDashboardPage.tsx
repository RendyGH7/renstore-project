import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  AlertCircle,
  RefreshCw,
  Award,
  Zap,
  AlertTriangle,
  Check,
  Copy,
  Download,
  Ticket,
  PieChart,
  Boxes,
  Clock,
  CheckCircle2,
  Users,
  Eye
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

  // Quick Action States
  const [restockingId, setRestockingId] = useState<number | null>(null);
  const [quickRestockSuccess, setQuickRestockSuccess] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<DashboardStatsResponse>>('/admin/dashboard/stats');
      if (res.data?.data) {
        setStats(res.data.data);
      } else {
        throw new Error('Fallback to mock');
      }
    } catch {
      // Portfolio Showcase Fallback
      setStats({
        metrics: {
          total_revenue: 148750000,
          total_orders: 48,
          pending_orders: 4,
          processing_orders: 8,
          completed_orders: 34,
          cancelled_orders: 2,
          total_products: 24,
          active_products: 24,
          low_stock_products_count: 1,
          total_customers: 128,
          today_revenue: 12500000,
          today_orders: 4,
          today_new_customers: 3,
        },
        hourly_sales: [
          { period: '00:00 - 04:00', total_sales: 0, orders_count: 0, completed_count: 0 },
          { period: '04:00 - 08:00', total_sales: 1500000, orders_count: 1, completed_count: 1 },
          { period: '08:00 - 12:00', total_sales: 3200000, orders_count: 1, completed_count: 1 },
          { period: '12:00 - 16:00', total_sales: 4800000, orders_count: 2, completed_count: 2 },
          { period: '16:00 - 20:00', total_sales: 3000000, orders_count: 1, completed_count: 1 },
          { period: '20:00 - 24:00', total_sales: 0, orders_count: 0, completed_count: 0 },
        ],
        daily_sales: [
          { period: 'Senin', total_sales: 12000000, orders_count: 4, completed_count: 4 },
          { period: 'Selasa', total_sales: 15000000, orders_count: 5, completed_count: 4 },
          { period: 'Rabu', total_sales: 9500000, orders_count: 3, completed_count: 3 },
          { period: 'Kamis', total_sales: 18000000, orders_count: 6, completed_count: 5 },
          { period: 'Jumat', total_sales: 22000000, orders_count: 7, completed_count: 6 },
          { period: 'Sabtu', total_sales: 14000000, orders_count: 5, completed_count: 4 },
          { period: 'Minggu', total_sales: 8000000, orders_count: 2, completed_count: 2 },
        ],
        monthly_sales: [
          { period: 'Apr', total_sales: 45000000, orders_count: 15, completed_count: 14 },
          { period: 'Mei', total_sales: 52000000, orders_count: 18, completed_count: 16 },
          { period: 'Jun', total_sales: 48000000, orders_count: 16, completed_count: 15 },
          { period: 'Jul', total_sales: 68000000, orders_count: 22, completed_count: 20 },
          { period: 'Agu', total_sales: 62000000, orders_count: 20, completed_count: 19 },
          { period: 'Sep', total_sales: 70000000, orders_count: 21, completed_count: 20 },
        ],
        yearly_sales: [
          { period: '2024', total_sales: 180000000, orders_count: 60, completed_count: 55 },
          { period: '2025', total_sales: 240000000, orders_count: 78, completed_count: 72 },
          { period: '2026', total_sales: 260000000, orders_count: 82, completed_count: 78 },
        ],
        top_selling_products: [
          { product_id: 1, product_name: 'Apple iPhone 16 Pro Max 256GB', total_sold: 14, total_revenue: 349986000 },
          { product_id: 3, product_name: 'MacBook Pro 14 M4 Pro Space Black', total_sold: 8, total_revenue: 255992000 },
          { product_id: 5, product_name: 'Sony WH-1000XM5 Wireless Headphones', total_sold: 22, total_revenue: 109978000 },
        ],
        low_stock_products: [
          {
            id: 3,
            category_id: 2,
            name: 'MacBook Pro 14 M4 Pro Space Black',
            slug: 'macbook-pro-14-m4-pro-space-black',
            description: 'Laptop performa tinggi.',
            price: 31999000,
            stock: 3,
            image_url: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop',
            is_active: true,
          },
        ],
        recent_orders: [
          {
            id: 1,
            order_number: 'ORD-20260926-001',
            user_id: 2,
            total_amount: 24999000,
            status: 'completed',
            payment_method: 'qris',
            payment_status: 'paid',
            phone: '089876543210',
            shipping_address: 'Jl. Thamrin No. 25, Jakarta Pusat',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user: {
              id: 2,
              name: 'Customer Renstore',
              email: 'customer@renstore.com',
              role: 'customer',
              created_at: new Date().toISOString(),
            },
            order_items: [],
          },
          {
            id: 2,
            order_number: 'ORD-20260926-002',
            user_id: 2,
            total_amount: 4999000,
            status: 'processing',
            payment_method: 'bca',
            payment_status: 'paid',
            phone: '089876543210',
            shipping_address: 'Jl. Thamrin No. 25, Jakarta Pusat',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString(),
            user: {
              id: 2,
              name: 'Customer Renstore',
              email: 'customer@renstore.com',
              role: 'customer',
              created_at: new Date().toISOString(),
            },
            order_items: [],
          },
        ],
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  // Real-time polling timer (every 5 seconds) and event-based instant sync
  useEffect(() => {
    // 1. Instant sync when tab/window gains focus or becomes visible
    const handleFocusOrVisible = () => {
      if (!document.hidden) {
        fetchDashboard(true);
      }
    };

    // 2. Instant sync when an order is created or updated in another tab or same window
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'renstore_last_order_time') {
        fetchDashboard(true);
      }
    };

    const handleCustomOrderEvent = () => {
      fetchDashboard(true);
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('renstore_order_created', handleCustomOrderEvent);

    // 3. Regular live polling every 5 seconds if autoSync is enabled
    if (autoSync) {
      timerRef.current = window.setInterval(() => {
        fetchDashboard(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('renstore_order_created', handleCustomOrderEvent);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoSync, fetchDashboard]);

  const formatPrice = (price: number | string | undefined) => {
    return 'IDR ' + Number(price || 0).toLocaleString('id-ID');
  };

  // Quick Restock Handler (Direct PUT /admin/products/{id})
  const handleQuickRestock = async (productId: number, addAmount: number) => {
    const product = stats?.low_stock_products.find((p) => p.id === productId);
    if (!product) return;
    const newStock = Math.max(0, (product.stock || 0) + addAmount);
    setRestockingId(productId);
    try {
      await api.put(`/admin/products/${productId}`, {
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: newStock,
        is_active: product.is_active,
      });
      setQuickRestockSuccess(`Stok "${product.name}" berhasil ditambah menjadi ${newStock} unit!`);
      setTimeout(() => setQuickRestockSuccess(null), 3500);
      await fetchDashboard(true);
    } catch {
      alert('Gagal memperbarui stok produk.');
    } finally {
      setRestockingId(null);
    }
  };

  // Quick Order Status Handler (Direct PATCH /admin/orders/{id}/status)
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      localStorage.setItem('renstore_last_order_time', String(Date.now()));
      window.dispatchEvent(new Event('renstore_order_created'));
      await fetchDashboard(true);
    } catch {
      alert('Gagal memperbarui status pesanan.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCopyOrder = (orderNum: string) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderNumber(orderNum);
    setTimeout(() => setCopiedOrderNumber(null), 2000);
  };

  // CSV Report Generator
  const handleExportReport = () => {
    if (!stats) return;
    const rows = [
      ['LAPORAN ANALISIS & STATISTIK TOKO RENSTORE'],
      ['Waktu Unduh', new Date().toLocaleString('id-ID')],
      ['Periode Dipilih', selectedPeriod.toUpperCase()],
      [''],
      ['RINGKASAN METRIK'],
      ['Total Pendapatan Terbayar (IDR)', stats.metrics.total_revenue],
      ['Total Transaksi', stats.metrics.total_orders],
      ['Pesanan Selesai', stats.metrics.completed_orders],
      ['Pesanan Dalam Proses', stats.metrics.processing_orders],
      ['Pesanan Pending', stats.metrics.pending_orders],
      ['Total Pelanggan', stats.metrics.total_customers],
      ['Total Produk SKU', stats.metrics.total_products],
      [''],
      ['RINCIAN PERIODE TRANSAKSI (' + selectedPeriod.toUpperCase() + ')'],
      ['Periode', 'Total Penjualan (IDR)', 'Volume Order', 'Order Selesai'],
      ...activePeriodData.map((d) => [
        `"${d.period}"`,
        d.total_sales,
        d.orders_count,
        d.completed_count || 0,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `renstore_analytics_${selectedPeriod}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  const lowStockProducts = stats?.low_stock_products || [];
  const categorySales = stats?.category_sales || [];
  const promoStats = stats?.promo_stats || [];

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

  const totalCategoryRevenue = categorySales.reduce((acc, c) => acc + Number(c.total_revenue || 0), 0);

  return (
    <div className="space-y-8">
      {/* Toast Alert for Quick Restock */}
      {quickRestockSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{quickRestockSuccess}</span>
          </div>
          <button
            onClick={() => setQuickRestockSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Welcome Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome Back, {user?.name || 'Administrator'}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ringkasan performa penjualan real-time, manajemen stok, dan operasional toko
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            title="Download Laporan Format CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          {/* Auto-Sync Toggle Button */}
          <button
            onClick={() => setAutoSync(!autoSync)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs cursor-pointer ${
              autoSync
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title={autoSync ? "Auto-Sync Realtime Aktif (Pembaruan Otomatis 5 detik)" : "Auto-Sync Nonaktif"}
          >
            <span className={`w-2 h-2 rounded-full ${autoSync ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{autoSync ? 'Live Sync ON' : 'Live Sync OFF'}</span>
          </button>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            title="Refresh Data Sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Memuat...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Feature 1: Real-Time Operational Alert & Pulse Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/admin/orders"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 flex items-center justify-between transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-100 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pesanan Pending</span>
              <span className="text-sm font-extrabold text-slate-900">{metrics?.pending_orders ?? 0} Perlu Proses</span>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>

        <a
          href="#inventory-alert-section"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-red-300 flex items-center justify-between transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs border border-red-100 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Stok Kritis</span>
              <span className="text-sm font-extrabold text-red-600">{metrics?.low_stock_products_count ?? 0} SKU Menipis</span>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" />
        </a>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs border border-emerald-100">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Omset Hari Ini (WIB)</span>
              <span className="text-sm font-extrabold text-emerald-600">{formatPrice(metrics?.today_revenue)}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-400">Live</span>
        </div>

        <Link
          to="/admin/users"
          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 flex items-center justify-between transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Pelanggan Baru Hari Ini</span>
              <span className="text-sm font-extrabold text-blue-600">+{metrics?.today_new_customers ?? 0} Pengguna</span>
            </div>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>
      </div>

      {/* 5 Soft Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Soft Peach - Ecommerce Revenue */}
        <div className="p-5 rounded-2xl bg-[#fff1ed] border border-[#fed7cc]/60 flex flex-col justify-between space-y-3 shadow-2xs">
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
        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0]/60 hover:border-emerald-400 flex flex-col justify-between space-y-3 shadow-2xs transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Total Pelanggan</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 block">
              {metrics?.total_customers ?? 0}
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                <ArrowUpRight className="w-3 h-3" /> +8.6%
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Kelola Akun →</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Soft Blue - Total Orders */}
        <div className="p-5 rounded-2xl bg-[#eff6ff] border border-[#bfdbfe]/60 flex flex-col justify-between space-y-3 shadow-2xs">
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
        <div className="p-5 rounded-2xl bg-[#fefce8] border border-[#fef08a]/60 flex flex-col justify-between space-y-3 shadow-2xs">
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
        <div className="p-5 rounded-2xl bg-[#f5f3ff] border border-[#ddd6fe]/60 flex flex-col justify-between space-y-3 shadow-2xs">
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
              <h2 className="text-base font-bold text-slate-900">Produk Terlaris</h2>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Lihat Semua
            </Link>
          </div>

          <div className="space-y-3">
            {topSelling.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 text-center">Belum ada data penjualan produk.</p>
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

      {/* Feature 2: Category Share & Promo Voucher Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Market Share Breakdown */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <PieChart className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Distribusi Penjualan Kategori</h2>
            </div>
            <Link to="/admin/categories" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              Kelola Kategori
            </Link>
          </div>

          <div className="space-y-4 pt-1">
            {categorySales.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada transaksi berdasarkan kategori.</p>
            ) : (
              categorySales.map((cat, idx) => {
                const percentage = totalCategoryRevenue > 0
                  ? Math.round((Number(cat.total_revenue) / totalCategoryRevenue) * 100)
                  : 0;

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="font-bold text-slate-800">{cat.category_name}</span>
                        <span className="text-[10px] text-slate-400">({cat.items_sold} item)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">{formatPrice(cat.total_revenue)}</span>
                        <span className="font-extrabold text-blue-600 text-[11px]">({percentage}%)</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Promo Voucher & Campaign Tracker */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Ticket className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Performa Kupon &amp; Voucher Promo</h2>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {metrics?.total_promo_orders ?? 0} Order Promo
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {promoStats.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada penggunaan kode promo pada pesanan.</p>
            ) : (
              promoStats.map((promo, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-mono text-xs font-black text-slate-900 shadow-2xs">
                      {promo.promo_code}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Digunakan</span>
                      <span className="text-xs font-bold text-slate-800">{promo.times_used}x Transaksi</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-red-500 font-semibold block">
                      Potongan: -{formatPrice(promo.total_discount_given)}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-600 block">
                      Omset: {formatPrice(promo.total_revenue_generated)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Feature 3: Low Stock Inventory Alert & Instant Quick Restock Tool */}
      <div id="inventory-alert-section" className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Peringatan Stok Rendah &amp; Restok Cepat
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-700">
                  {lowStockProducts.length} Produk Kritis
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Tambah stok barang langsung tanpa harus berpindah halaman
              </p>
            </div>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <Boxes className="w-3.5 h-3.5" />
            Buka Katalog Produk
          </Link>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center text-xs text-emerald-800 font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Semua persediaan produk dalam kondisi aman (Stok &gt; 5 unit).
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {lowStockProducts.map((prod) => (
              <div
                key={prod.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3 hover:bg-slate-100/60 transition-all shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="truncate">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                      {prod.category?.name || 'Kategori'}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5" title={prod.name}>
                      {prod.name}
                    </h3>
                    <span className="text-[11px] font-black text-blue-600 block mt-1">
                      {formatPrice(prod.price)}
                    </span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black shrink-0 ${
                    prod.stock === 0
                      ? 'bg-red-600 text-white'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {prod.stock === 0 ? 'Habis' : `Sisa ${prod.stock}`}
                  </span>
                </div>

                {/* Quick Restock Buttons */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-500">Restok Instan:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickRestock(prod.id, 5)}
                      disabled={restockingId === prod.id}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-[11px] font-bold text-slate-700 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                      title="Tambah 5 unit stok"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleQuickRestock(prod.id, 10)}
                      disabled={restockingId === prod.id}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-slate-200 text-[11px] font-bold text-slate-700 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                      title="Tambah 10 unit stok"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleQuickRestock(prod.id, 20)}
                      disabled={restockingId === prod.id}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                      title="Tambah 20 unit stok"
                    >
                      +20
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feature 4: Enhanced Recent Orders with Direct Status Approval & Copy */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Pesanan Masuk Terbaru</h2>
            <p className="text-xs text-slate-500">
              Ubah status transaksi langsung dari tabel dashboard secara real-time
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Kelola Semua Pesanan ({metrics?.total_orders ?? 0})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="pb-3 font-semibold">Nomor Order</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Nominal</th>
                <th className="pb-3 font-semibold">Status Saat Ini</th>
                <th className="pb-3 font-semibold">Aksi Cepat</th>
                <th className="pb-3 font-semibold text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada pesanan terbaru.
                  </td>
                </tr>
              ) : (
                recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                        <span>{ord.order_number}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyOrder(ord.order_number)}
                          className="p-1 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Salin Nomor Pesanan"
                        >
                          {copiedOrderNumber === ord.order_number ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-700 font-medium">
                      <div className="truncate max-w-[140px]">
                        <span className="block font-bold truncate">{ord.user?.name || 'Customer'}</span>
                        <span className="text-[10px] text-slate-400 truncate block">{ord.phone || ord.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">{formatPrice(ord.total_amount)}</td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ord.status === 'cancelled'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : ord.status === 'processing'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ord.status === 'completed'
                            ? 'bg-emerald-500'
                            : ord.status === 'cancelled'
                              ? 'bg-red-500'
                              : ord.status === 'processing'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                        }`} />
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {/* Direct Status Action Dropdown */}
                      <select
                        value={ord.status}
                        disabled={updatingOrderId === ord.id}
                        onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-700 hover:border-blue-500 focus:outline-none focus:border-blue-600 disabled:opacity-50 cursor-pointer shadow-2xs"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Proses (Paid)</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Batalkan</option>
                      </select>
                    </td>
                    <td className="py-3.5 text-slate-400 text-right">
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
