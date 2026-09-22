import { Product } from './product';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: Product;
  is_in_stock: boolean;
  available_stock: number;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_amount: number;
}

export interface AddToCartPayload {
  product_id: number;
  quantity?: number;
}

export interface UpdateCartPayload {
  quantity: number;
}
