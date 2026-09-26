<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get aggregate analytics & dashboard metrics for admin.
     */
    public function stats(): JsonResponse
    {
        // 1. Total Revenue (from paid/completed/processing orders)
        $totalRevenue = (float) Order::where('status', '!=', 'cancelled')
            ->where(function ($q) {
                $q->where('payment_status', 'paid')
                  ->orWhere('status', 'completed');
            })
            ->sum('total_amount');

        // 2. Orders summary counts
        $totalOrders = Order::count();
        $pendingOrders = Order::where('status', 'pending')->count();
        $processingOrders = Order::where('status', 'processing')->count();
        $completedOrders = Order::where('status', 'completed')->count();
        $cancelledOrders = Order::where('status', 'cancelled')->count();

        // 3. Products & Stock metrics
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $lowStockProductsCount = Product::where('stock', '<=', 5)->count();
        $lowStockProducts = Product::where('stock', '<=', 5)
            ->with('category')
            ->orderBy('stock', 'asc')
            ->limit(5)
            ->get();

        // 4. Customers Count
        $totalCustomers = User::where('role', 'customer')->count();

        // 5. Recent 5 Orders
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // 6. Realtime Hourly Breakdown for Today (24 Hours in 6 time slots)
        $today = Carbon::today();
        $hourlySlots = [
            ['label' => '00:00 - 04:00', 'start' => 0, 'end' => 3],
            ['label' => '04:00 - 08:00', 'start' => 4, 'end' => 7],
            ['label' => '08:00 - 12:00', 'start' => 8, 'end' => 11],
            ['label' => '12:00 - 16:00', 'start' => 12, 'end' => 15],
            ['label' => '16:00 - 20:00', 'start' => 16, 'end' => 19],
            ['label' => '20:00 - 23:59', 'start' => 20, 'end' => 23],
        ];

        $hourlySales = [];
        foreach ($hourlySlots as $slot) {
            $slotStart = $today->copy()->setHour($slot['start'])->setMinute(0)->setSecond(0);
            $slotEnd = $today->copy()->setHour($slot['end'])->setMinute(59)->setSecond(59);

            $sales = (float) Order::where('status', '!=', 'cancelled')
                ->where(function ($q) {
                    $q->where('payment_status', 'paid')
                      ->orWhere('status', 'completed');
                })
                ->whereBetween('created_at', [$slotStart, $slotEnd])
                ->sum('total_amount');

            $count = Order::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$slotStart, $slotEnd])
                ->count();

            $completed = Order::where('status', 'completed')
                ->whereBetween('created_at', [$slotStart, $slotEnd])
                ->count();

            $hourlySales[] = [
                'period' => $slot['label'],
                'total_sales' => $sales,
                'orders_count' => $count,
                'completed_count' => $completed,
            ];
        }

        // 7. Realtime Daily Sales Breakdown (Last 7 Days)
        $dailySales = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $dayStart = $day->copy()->startOfDay();
            $dayEnd = $day->copy()->endOfDay();

            $dayLabel = $i === 0 ? 'Hari Ini' : ($i === 1 ? 'Kemarin' : $day->translatedFormat('D, d M'));

            $sales = (float) Order::where('status', '!=', 'cancelled')
                ->where(function ($q) {
                    $q->where('payment_status', 'paid')
                      ->orWhere('status', 'completed');
                })
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->sum('total_amount');

            $count = Order::where('status', '!=', 'cancelled')
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->count();

            $completed = Order::where('status', 'completed')
                ->whereBetween('created_at', [$dayStart, $dayEnd])
                ->count();

            $dailySales[] = [
                'period' => $dayLabel,
                'date' => $day->format('Y-m-d'),
                'total_sales' => $sales,
                'orders_count' => $count,
                'completed_count' => $completed,
            ];
        }

        // 8. Monthly Sales Breakdown (Last 6 Months)
        $monthlySales = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $year = $date->year;
            $month = $date->month;
            $monthLabel = $date->translatedFormat('M Y');

            $salesSum = (float) Order::where('status', '!=', 'cancelled')
                ->where(function ($q) {
                    $q->where('payment_status', 'paid')
                      ->orWhere('status', 'completed');
                })
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->sum('total_amount');

            $ordersCount = Order::where('status', '!=', 'cancelled')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $completed = Order::where('status', 'completed')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->count();

            $monthlySales[] = [
                'period' => $monthLabel,
                'month' => $monthLabel,
                'year' => $year,
                'month_num' => $month,
                'total_sales' => $salesSum,
                'orders_count' => $ordersCount,
                'completed_count' => $completed,
            ];
        }

        // 9. Yearly Sales Breakdown (Last 3 Years)
        $yearlySales = [];
        $currentYear = Carbon::now()->year;
        for ($y = $currentYear - 2; $y <= $currentYear; $y++) {
            $salesSum = (float) Order::where('status', '!=', 'cancelled')
                ->where(function ($q) {
                    $q->where('payment_status', 'paid')
                      ->orWhere('status', 'completed');
                })
                ->whereYear('created_at', $y)
                ->sum('total_amount');

            $ordersCount = Order::where('status', '!=', 'cancelled')
                ->whereYear('created_at', $y)
                ->count();

            $completed = Order::where('status', 'completed')
                ->whereYear('created_at', $y)
                ->count();

            $yearlySales[] = [
                'period' => "Tahun $y",
                'year' => $y,
                'total_sales' => $salesSum,
                'orders_count' => $ordersCount,
                'completed_count' => $completed,
            ];
        }

        // 10. Top Selling Products
        $topSelling = OrderItem::select(
            'product_id',
            'product_name',
            DB::raw('SUM(quantity) as total_sold'),
            DB::raw('SUM(subtotal) as total_revenue')
        )
        ->whereHas('order', function ($q) {
            $q->where('status', '!=', 'cancelled');
        })
        ->groupBy('product_id', 'product_name')
        ->orderByDesc('total_sold')
        ->limit(5)
        ->get();

        // 11. Category Sales Breakdown & Market Share
        $categorySales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', '!=', 'cancelled')
            ->select(
                'categories.id',
                'categories.name as category_name',
                'categories.slug as category_slug',
                DB::raw('SUM(order_items.quantity) as items_sold'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('categories.id', 'categories.name', 'categories.slug')
            ->orderByDesc('total_revenue')
            ->limit(6)
            ->get();

        // 12. Promo Voucher Usage & Performance
        $promoStats = Order::whereNotNull('promo_code')
            ->where('promo_code', '!=', '')
            ->where('status', '!=', 'cancelled')
            ->select(
                'promo_code',
                DB::raw('COUNT(*) as times_used'),
                DB::raw('SUM(discount_amount) as total_discount_given'),
                DB::raw('SUM(total_amount) as total_revenue_generated')
            )
            ->groupBy('promo_code')
            ->orderByDesc('times_used')
            ->limit(5)
            ->get();

        $totalDiscountGiven = (float) Order::where('status', '!=', 'cancelled')->sum('discount_amount');
        $totalPromoOrders = Order::whereNotNull('promo_code')->where('promo_code', '!=', '')->where('status', '!=', 'cancelled')->count();

        // 13. Realtime Overview Metrics
        $todayOrders = Order::where('status', '!=', 'cancelled')
            ->whereDate('created_at', Carbon::today())
            ->count();
        $todayRevenue = (float) Order::whereDate('created_at', Carbon::today())
            ->where('status', '!=', 'cancelled')
            ->where(function ($q) {
                $q->where('payment_status', 'paid')
                  ->orWhere('status', 'completed');
            })
            ->sum('total_amount');
        $todayNewCustomers = User::where('role', 'customer')
            ->whereDate('created_at', Carbon::today())
            ->count();

        return response()->json([
            'status' => true,
            'message' => 'Statistik dashboard admin realtime berhasil diambil.',
            'data' => [
                'metrics' => [
                    'total_revenue' => $totalRevenue,
                    'total_orders' => $totalOrders,
                    'pending_orders' => $pendingOrders,
                    'processing_orders' => $processingOrders,
                    'completed_orders' => $completedOrders,
                    'cancelled_orders' => $cancelledOrders,
                    'total_products' => $totalProducts,
                    'active_products' => $activeProducts,
                    'low_stock_products_count' => $lowStockProductsCount,
                    'total_customers' => $totalCustomers,
                    'today_revenue' => $todayRevenue,
                    'today_orders' => $todayOrders,
                    'today_new_customers' => $todayNewCustomers,
                    'total_discount_given' => $totalDiscountGiven,
                    'total_promo_orders' => $totalPromoOrders,
                ],
                'recent_orders' => $recentOrders,
                'low_stock_products' => $lowStockProducts,
                'hourly_sales' => $hourlySales,
                'daily_sales' => $dailySales,
                'monthly_sales' => $monthlySales,
                'yearly_sales' => $yearlySales,
                'top_selling_products' => $topSelling,
                'category_sales' => $categorySales,
                'promo_stats' => $promoStats,
                'timestamp' => Carbon::now()->toIso8601String(),
            ],
        ]);
    }
}
