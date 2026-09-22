import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ShoppingBag, 
  ArrowLeft,
  ArrowRight, 
  MapPin, 
  Phone, 
  Calendar, 
  Layers,
  QrCode,
  Zap,
  Sparkles,
  RefreshCw,
  Home
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import { Order, PaginatedResponse, ApiResponse } from '../types';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';
import { useCart } from '../contexts/CartContext';
import { useLocale } from '../contexts/LocaleContext';

export const OrdersPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber?: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { refreshCart } = useCart();
  const { language, formatPrice, t } = useLocale();

  // QRIS Payment state
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60);
  const pollingRef = useRef<number | null>(null);

  const fetchOrderData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      if (orderNumber) {
        const res = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
        if (res.data?.data) {
          setSingleOrder(res.data.data);
        }
      } else {
        const res = await api.get<PaginatedResponse<Order>>('/orders');
        if (res.data?.data) {
          setOrders(res.data.data);
        }
      }
    } catch {
      // Ignored
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  // Handle automatic polling if order is unpaid
  useEffect(() => {
    if (singleOrder && singleOrder.payment_status === 'unpaid') {
      pollingRef.current = window.setInterval(() => {
        fetchOrderData(true);
      }, 3500);

      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        clearInterval(timer);
      };
    }
  }, [singleOrder, fetchOrderData]);

  const handleSimulatePayment = async () => {
    if (!singleOrder) return;
    setIsSimulatingPayment(true);
    try {
      await api.post(`/orders/${singleOrder.order_number}/simulate-paid`);
      await fetchOrderData(true);
      await refreshCart();
    } catch {
      alert(language === 'en' ? 'Failed to simulate payment.' : 'Gagal mensimulasikan pembayaran.');
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const handleManualCheck = async () => {
    if (!singleOrder) return;
    setIsCheckingPayment(true);
    try {
      await fetchOrderData(true);
      await refreshCart();
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('status_completed')}
          </span>
        );
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> {t('status_paid')}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> {language === 'en' ? 'Processing' : 'Sedang Diproses'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3.5 h-3.5" /> {t('status_cancelled')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> {t('status_pending')}
          </span>
        );
    }
  };

  // Single Order Detail View
  if (orderNumber && singleOrder) {
    const isUnpaid = singleOrder.payment_status === 'unpaid';

    return (
      <AnimatedPage>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {singleOrder.order_number}
              </h1>
              {getStatusBadge(singleOrder.status)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(singleOrder.created_at).toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
          </div>

          <Link
            to="/orders"
            className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shadow-xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'All Orders History' : 'Semua Riwayat Pesanan'}</span>
          </Link>
        </div>

        {/* Dynamic QRIS Banner / Payment Card if UNPAID */}
        {isUnpaid && (
          <div className="bg-white border-2 border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
              {/* Left: Instructions & Details */}
              <div className="space-y-4 max-w-md text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <QrCode className="w-3.5 h-3.5" /> Dynamic QRIS Payment
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {language === 'en' ? 'Scan QRIS to Complete Payment' : 'Scan QRIS untuk Menyelesaikan Pembayaran'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {t('qris_scan_instruction')}
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{t('total')}:</span>
                    <span className="text-lg font-black text-blue-600 font-mono">
                      {formatPrice(singleOrder.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> {language === 'en' ? 'Time Remaining:' : 'Batas Waktu:'}
                    </span>
                    <span className="font-mono font-bold text-amber-600 text-sm">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Dev Simulation & Check Actions */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={handleManualCheck}
                    disabled={isCheckingPayment}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCheckingPayment ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        {language === 'en' ? 'Check Payment Status' : 'Cek Status Pembayaran'}
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Testing Sandbox
                      </span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                        Dev Mode
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isSimulatingPayment}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSimulatingPayment ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          {language === 'en' ? 'Simulate Payment Success' : 'Simulasikan Pembayaran Sukses'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: QR Code */}
              <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm text-center">
                <div className="pb-2.5 mb-2.5 border-b border-slate-100 flex items-center justify-between gap-4">
                  <span className="text-[11px] font-black tracking-widest text-slate-800 uppercase">
                    QRIS
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase">
                    {language === 'en' ? 'National Standard' : 'Pembayaran Nasional'}
                  </span>
                </div>

                {singleOrder.qr_string ? (
                  <div className="p-2 bg-white rounded-xl flex items-center justify-center">
                    <QRCodeSVG
                      value={singleOrder.qr_string}
                      size={200}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                    {language === 'en' ? 'Generating Barcode...' : 'Membuat Barcode...'}
                  </div>
                )}

                <div className="pt-2.5 mt-2.5 border-t border-slate-100">
                  <p className="text-[10px] font-mono text-slate-500 font-semibold truncate max-w-[200px]">
                    NMID: {singleOrder.order_number}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paid Confirmation Banner & Action Buttons if PAID */}
        {!isUnpaid && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-blue-500/10 border-2 border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">{t('payment_success_title')}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black tracking-wider uppercase">
                    {t('status_paid')}
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-xl">
                  {t('payment_success_desc')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
              <Link
                to="/"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Home className="w-4 h-4" />
                {t('back_to_home')}
              </Link>
              <Link
                to="/products"
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs"
              >
                <ShoppingBag className="w-4 h-4 text-slate-500" />
                {language === 'en' ? 'Shop More' : 'Belanja Lagi'}
              </Link>
            </div>
          </motion.div>
        )}

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              {t('shipping_address')}
            </h3>
            <p className="text-sm font-bold text-slate-900">{singleOrder.shipping_address}</p>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <Phone className="w-3 h-3 text-slate-400" />
              {singleOrder.phone}
            </p>
            {singleOrder.notes && (
              <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
                {language === 'en' ? 'Notes:' : 'Catatan:'} {singleOrder.notes}
              </p>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'en' ? 'Transaction & Total' : 'Status Transaksi & Total'}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{t('order_status')}:</span>
              <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                singleOrder.payment_status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {singleOrder.payment_status === 'paid' ? t('status_paid') : t('status_pending')}
              </span>
            </div>
            {singleOrder.promo_code && (
              <div className="flex items-center justify-between text-emerald-600 font-semibold text-xs">
                <span>Voucher ({singleOrder.promo_code}):</span>
                <span>-{formatPrice(Number(singleOrder.discount_amount || 0))}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-medium">{t('total')}:</span>
              <span className="text-base font-black text-blue-600">{formatPrice(singleOrder.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            {language === 'en' ? `Order Items Details (${singleOrder.order_items?.length || 0} Items)` : `Rincian Produk Pesanan (${singleOrder.order_items?.length || 0} Item)`}
          </h3>

          <div className="space-y-3">
            {singleOrder.order_items?.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.product_name}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {formatPrice(item.price)} × {item.quantity} unit
                  </p>
                </div>
                <span className="text-sm font-black text-blue-600">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions when Paid */}
        {!isUnpaid && (
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-bold text-slate-900">{language === 'en' ? 'Want to keep shopping?' : 'Ingin melanjutkan eksplorasi produk?'}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{language === 'en' ? 'Discover our full collection of premium tech and gadgets.' : 'Jelajahi berbagai pilihan produk gadget dan teknologi terbaik kami.'}</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                <Home className="w-4 h-4" />
                {t('back_to_home')}
              </Link>
              <Link
                to="/orders"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                <Package className="w-4 h-4 text-slate-500" />
                {language === 'en' ? 'All Orders' : 'Semua Pesanan'}
              </Link>
            </div>
          </div>
        )}
      </div>
      </AnimatedPage>
    );
  }

  // All orders listing view
  return (
    <AnimatedPage>
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Package className="w-6 h-6 text-blue-600" />
          {t('orders_history')}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'en' ? 'Track order processing and status of your purchases' : 'Pantau status pemrosesan dan rincian belanja akun Anda'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-xs" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3 shadow-xs">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">{t('orders_empty')}</h3>
          <p className="text-xs text-slate-500">{language === 'en' ? 'You have not placed any orders at RENSTORE yet.' : 'Anda belum pernah melakukan pemesanan di RENSTORE.'}</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all mt-2 shadow-xs"
          >
            {t('start_shopping')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <Link
              key={ord.id}
              to={`/orders/${ord.order_number}`}
              className="block p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-500/40 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 font-mono">{ord.order_number}</span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(ord.created_at).toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t('total')}</span>
                    <span className="text-sm sm:text-base font-black text-blue-600">
                      {formatPrice(ord.total_amount)}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </AnimatedPage>
  );
};

export default OrdersPage;
