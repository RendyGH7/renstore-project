import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  Package, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Plus, 
  Minus,
  Sparkles,
  Zap
} from 'lucide-react';
import api from '../api/axios';
import { Product, ApiResponse, PaginatedResponse } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import SkeletonLoader from '../components/SkeletonLoader';
import ProductCard from '../components/ProductCard';
import AnimatedPage from '../components/AnimatedPage';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { language, formatPrice, t } = useLocale();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<ApiResponse<Product>>(`/products/${slug}`);
        if (res.data?.data) {
          const currentProduct = res.data.data;
          setProduct(currentProduct);
          setQuantity(1);

          // Fetch related products in the same category
          if (currentProduct.category?.slug) {
            const relRes = await api.get<PaginatedResponse<Product>>('/products', {
              params: {
                category_slug: currentProduct.category.slug,
                per_page: 4,
              }
            });
            if (relRes.data?.data) {
              setRelatedProducts(relRes.data.data.filter((p) => p.id !== currentProduct.id));
            }
          }
        }
      } catch {
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch {
      // Ignored
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout?direct=1&product_id=${product.id}&quantity=${quantity}`)}`);
      return;
    }
    navigate(`/checkout?direct=1&product_id=${product.id}&quantity=${quantity}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-6 bg-slate-200 rounded w-28"></div>
        <SkeletonLoader type="detail" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-4 shadow-xs">
        <Package className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{t('no_products_found')}</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t('no_products_desc')}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back_to_catalog')}
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;

  return (
    <AnimatedPage>
    <div className="space-y-12">
      {/* Back to Catalog Link */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('back_to_catalog')}
      </Link>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
        {/* Product Image Preview */}
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-200/80 p-8 flex items-center justify-center shadow-xs">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'}
            alt={product.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800';
            }}
            className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300"
          />
          {product.category && (
            <span className="absolute top-4 left-4 bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border border-slate-200">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-wider">
                {t('sku')}: {product.slug}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Price Display */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('price')}</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-600">
                  {formatPrice(product.price)}
                </span>
              </div>
              <div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  outOfStock
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {outOfStock ? t('out_of_stock') : `${t('in_stock')}: ${product.stock} Unit`}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{t('product_description')}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          </div>

          {/* Quantity & Add to Cart Controls */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">{t('quantity')}:</span>
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || outOfStock}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-slate-900 px-3 min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || outOfStock}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || isAdding}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
                  isAdded
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : outOfStock
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 active:scale-98 shadow-xs'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    {t('added_to_cart')}
                  </>
                ) : isAdding ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 text-slate-700" />
                    {t('add_to_cart')}
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  outOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white hover:shadow-blue-500/25 active:scale-98'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                {t('buy_now')}
              </button>
            </div>

            {/* Feature Assurances */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-center space-y-1 shadow-xs">
                <Truck className="w-4 h-4 text-blue-600 mx-auto" />
                <span className="text-[10px] text-slate-600 block font-semibold">{t('feature_shipping_title')}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-center space-y-1 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                <span className="text-[10px] text-slate-600 block font-semibold">{t('feature_warranty_title')}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-center space-y-1 shadow-xs">
                <RefreshCw className="w-4 h-4 text-purple-600 mx-auto" />
                <span className="text-[10px] text-slate-600 block font-semibold">2-Year Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products from Category */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              {language === 'en' ? 'Related Products in Same Category' : 'Produk Terkait di Kategori yang Sama'}
            </h2>
            <Link
              to={`/products?category_slug=${product.category?.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>{language === 'en' ? 'View Category' : 'Lihat Kategori Lengkap'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.slice(0, 3).map((rel, idx) => (
              <ProductCard key={rel.id} product={rel} index={idx} />
            ))}
          </div>
        </div>
      )}
    </div>
    </AnimatedPage>
  );
};

export default ProductDetailPage;
