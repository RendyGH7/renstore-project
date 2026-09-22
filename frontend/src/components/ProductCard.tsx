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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col justify-between bg-white border border-slate-200/80 hover:border-blue-500/50 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300"
    >
      {/* Product Image Link */}
      <Link 
        to={`/products/${product.slug}`} 
        className="relative aspect-square overflow-hidden bg-white flex items-center justify-center p-6 block"
      >
        <motion.img
          src={product.image_url || DEFAULT_PRODUCT_IMG}
          alt={product.name}
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_PRODUCT_IMG;
          }}
          className="w-full h-full object-contain mix-blend-multiply"
          loading="lazy"
          whileHover={{ scale: 1.09 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />

        {/* Category Badge with Glassmorphism */}
        {product.category && (
          <span className="absolute top-3.5 left-3.5 bg-white/90 backdrop-blur-md border border-slate-200/80 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-xl shadow-2xs">
            {product.category.name}
          </span>
        )}

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center">
            <span className="text-xs font-extrabold text-red-600 uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/90 shadow-2xs">
              {t('out_of_stock')}
            </span>
          </div>
        )}

        {/* Quick View Hover Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
          className="absolute bottom-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <div className="p-2.5 rounded-xl bg-white/95 backdrop-blur-sm border border-slate-200 text-slate-700 shadow-md">
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
        </motion.div>
      </Link>

      {/* Product Details */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 border-t border-slate-100/80 bg-gradient-to-b from-white to-slate-50/30">
        <div className="space-y-1.5">
          <Link to={`/products/${product.slug}`}>
            <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
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
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                {language === 'en' ? `Stock: ${product.stock}` : `Stok: ${product.stock}`}
              </span>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              onClick={handleAddToCart}
              disabled={outOfStock || isAdding}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: outOfStock ? 1 : 1.02 }}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 border ${
                isAdded
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : outOfStock
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs'
              }`}
              title={t('add_to_cart')}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{t('added_to_cart')}</span>
                </>
              ) : isAdding ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="truncate">+ {language === 'en' ? 'Cart' : 'Keranjang'}</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleBuyNow}
              disabled={outOfStock}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: outOfStock ? 1 : 1.02 }}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs ${
                outOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20'
              }`}
              title={t('buy_now')}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
              <span className="truncate">{language === 'en' ? 'Buy Now' : 'Beli Langsung'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
