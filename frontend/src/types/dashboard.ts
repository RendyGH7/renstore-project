import { Order } from './order';
import { Product } from './product';

export interface SalesPeriodData {
  period: string;
  date?: string;
  month?: string;
  year?: number;
  month_num?: number;
  total_sales: number;
  orders_count: number;
  completed_count?: number;
}

export interface CategorySalesData {
  id: number;
  category_name: string;
  category_slug: string;
  items_sold: number;
  total_revenue: number;
}

export interface PromoStatData {
  promo_code: string;
  times_used: number;
  total_discount_given: number;
  total_revenue_generated: number;
}

export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  processing_orders: number;
  completed_orders: number;
  cancelled_orders: number;
  total_products: number;
  active_products: number;
  low_stock_products_count: number;
  total_customers: number;
  today_revenue?: number;
  today_orders?: number;
  today_new_customers?: number;
  total_discount_given?: number;
  total_promo_orders?: number;
}

export interface MonthlySales extends SalesPeriodData {}

export interface TopSellingProduct {
  product_id: number;
  product_name: string;
  total_sold: number;
  total_revenue: number;
}

export interface DashboardStatsResponse {
  metrics: DashboardMetrics;
  recent_orders: Order[];
  low_stock_products: Product[];
  hourly_sales?: SalesPeriodData[];
  daily_sales?: SalesPeriodData[];
  monthly_sales: SalesPeriodData[];
  yearly_sales?: SalesPeriodData[];
  top_selling_products: TopSellingProduct[];
  category_sales?: CategorySalesData[];
  promo_stats?: PromoStatData[];
  timestamp?: string;
}
