import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLocale } from '../contexts/LocaleContext';
import api from '../api/axios';
import { ApiResponse, Order } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

export const CartPage: React.FC = () => {
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart, refreshCart, isLoading } = useCart();
  const { language, formatPrice, t } = useLocale();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState('Jl. Jenderal Sudirman No. 10, Jakarta Selatan');
  const [phone, setPhone] = useState('081298765432');
  const [notes, setNotes] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync cart from backend when entering CartPage
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setError(null);
    setIsCheckingOut(true);

    try {
      const response = await api.post<ApiResponse<Order>>('/checkout', {
        shipping_address: shippingAddress,
        phone,
        notes,
      });

      if (response.data?.data) {
        await refreshCart();
        navigate(`/orders/${response.data.data.order_number}`, { replace: true });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || (language === 'en' ? 'Failed to process checkout. Please check your cart.' : 'Gagal memproses checkout. Silakan periksa kembali keranjang Anda.'));
      await refreshCart();
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0 && !isLoading) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-xl mx-auto space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">{t('cart_empty_title')}</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {t('cart_empty_desc')}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs"
        >
          {t('start_shopping')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <AnimatedPage>
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            {t('shopping_cart')} ({totalItems} {language === 'en' ? 'Items' : 'Item'})
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'en'
              ? 'Review product quantities before proceeding to checkout'
              : 'Kelola kuantitas produk sebelum melanjutkan ke alur checkout'}
          </p>
        </div>

        <button
          onClick={() => clearCart()}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          {t('clear_cart')}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Cart Items & Checkout Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
          {items.map((item, idx) => {
            const product = item.product;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-slate-300 shadow-xs"
              >
                <div className="flex items-center gap-4">
                    <img
                      src={product?.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'}
                      alt={product?.name}
                      className="w-16 h-16 rounded-xl object-contain bg-white border border-slate-200/60 p-1 mix-blend-multiply"
                    />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {product?.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {formatPrice(item.price)} / unit
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {language === 'en' ? `In stock: ${item.available_stock}` : `Stok tersedia: ${item.available_stock}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Quantity Controller */}
                  <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 px-2 min-w-[24px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.available_stock}
                      className="p-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-30 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">{t('subtotal')}</span>
                    <span className="text-sm font-black text-blue-600">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title={t('remove_item')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>

        {/* Checkout Summary Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCheckout} className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-6 sticky top-24 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {t('shipping_info')}
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  {t('shipping_address')}
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Alamat lengkap tujuan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  {t('phone_number')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {language === 'en' ? 'Order Notes (Optional)' : 'Catatan Pesanan (Opsional)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Leave at front door' : 'Misal: titip di pos security'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                />
              </div>
            </div>

            {/* Total Cost Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{language === 'en' ? `Subtotal (${totalItems} items)` : `Subtotal Barang (${totalItems} item)`}</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>{t('shipping')}</span>
                <span className="text-emerald-600 font-bold">{t('free')}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>{t('total')}</span>
                <span className="text-base text-blue-600 font-black">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCheckingOut || items.length === 0}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {t('proceed_to_checkout')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
    </AnimatedPage>
  );
};

export default CartPage;
