import { Product } from './product';
import { User } from './auth';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  discount_amount?: number;
  promo_code?: string | null;
  status: OrderStatus;
  shipping_address: string;
  phone: string;
  notes?: string | null;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  qr_id?: string | null;
  qr_string?: string | null;
  qr_expires_at?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  order_items?: OrderItem[];
}

export interface CheckoutPayload {
  shipping_address: string;
  phone: string;
  notes?: string;
  product_id?: number;
  quantity?: number;
  promo_code?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}
