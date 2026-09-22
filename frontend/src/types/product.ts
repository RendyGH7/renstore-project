export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  is_active?: boolean;
  products_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order?: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  price: number;
  stock: number;
  attributes?: Record<string, string>;
}

export interface Product {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string | null;
  images?: ProductImage[];
  variants?: ProductVariant[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilterParams {
  search?: string;
  category_id?: number;
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'latest' | 'popular';
  page?: number;
  per_page?: number;
}
