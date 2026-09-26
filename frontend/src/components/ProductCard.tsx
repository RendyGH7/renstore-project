import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';

const DEFAULT_PRODUCT_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { language, formatPrice, t } = useLocale();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1500);
    } catch {
      // Ignored
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout?direct=1&product_id=${product.id}&quantity=1`)}`);
      return;
    }
    navigate(`/checkout?direct=1&product_id=${product.id}&quantity=1`);
  };

  const outOfStock = product.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col justify-between bg-white hover:bg-white border border-slate-200/80 hover:border-blue-400/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-blue-500/12 hover:-translate-y-1.5 transition-all duration-200 ease-out cursor-pointer"
    >
      {/* Top Specular Sheen & Corner Ambient Highlight */}
      <div className="absolute top-0 inset-x-6 h-[1.5px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      <div className="absolute -top-16 -left-16 w-36 h-36 bg-blue-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-300 ease-out z-0" />

      {/* Product Image Showcase Container */}
      <Link 
        to={`/products/${product.slug}`} 
        className="relative aspect-square overflow-hidden bg-slate-50 flex items-center justify-center p-6 block border-b border-slate-100 z-10"
      >
        <img
          src={product.image_url || DEFAULT_PRODUCT_IMG}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMG;
          }}
          className="w-full h-full object-contain relative z-10 transition-transform duration-300 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Category Badge */}
        {product.category && (
          <span className="absolute top-3.5 left-3.5 z-20 bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-2xs">
            {product.category.name}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
            <span className="text-xs font-black text-red-600 uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/90 shadow-2xs">
              {t('out_of_stock')}
            </span>
          </div>
        )}

        {/* Quick View Hover Icon */}
        <div className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-20">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-blue-600 shadow-md hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-150">
            <Eye className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 bg-white z-10">
        <div className="space-y-1.5">
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors duration-150 line-clamp-2 leading-snug tracking-tight">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs font-medium text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 space-y-3">
          {/* Price and Stock status */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">{t('price')}</span>
              <span className="text-sm sm:text-base font-black text-blue-600 tracking-tight">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.stock > 0 && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                {language === 'en' ? `Stock: ${product.stock}` : `Stok: ${product.stock}`}
              </span>
            )}
          </div>

          {/* Action Buttons: Pill Buy Now & Circular Add to Cart */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-black flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer ${
                outOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.98] text-white shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35'
              }`}
              title={t('buy_now')}
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
              <span className="truncate font-extrabold">{language === 'en' ? 'Buy Now' : 'Beli Langsung'}</span>
            </button>

            <button
              onClick={handleAddToCart}
              disabled={outOfStock || isAdding}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 border cursor-pointer ${
                isAdded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                  : outOfStock
                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
              }`}
              title={t('add_to_cart')}
            >
              {isAdded ? (
                <Check className="w-4 h-4 text-white" />
              ) : isAdding ? (
                <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
