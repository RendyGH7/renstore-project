import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  FileText, 
  ArrowRight, 
  AlertCircle, 
  ShoppingBag, 
  CheckCircle2,
  Lock,
  QrCode,
  Clock,
  RefreshCw,
  Sparkles,
  Zap,
  Home,
  Tag,
  TicketPercent,
  Check,
  X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import api from '../api/axios';
import { ApiResponse, Order, Product } from '../types';

interface AppliedPromo {
  code: string;
  discount: number;
  description: string;
  subtotal: number;
  final_total: number;
}

export const CheckoutPage: React.FC = () => {
  const { items, totalItems, totalAmount, refreshCart } = useCart();
  const { user } = useAuth();
  const { language, formatPrice, t } = useLocale();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Direct Buy detection
  const isDirect = searchParams.get('direct') === '1' && !!searchParams.get('product_id');
  const directProductId = searchParams.get('product_id');
  const directQuantity = Math.max(1, parseInt(searchParams.get('quantity') || '1', 10));

  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [isLoadingDirectProduct, setIsLoadingDirectProduct] = useState(isDirect);

  const [shippingAddress, setShippingAddress] = useState(user?.address || 'Jl. Jenderal Sudirman No. 10, Jakarta Selatan');
  const [phone, setPhone] = useState(user?.phone || '081298765432');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null);

  // QRIS Payment Modal State
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins default
  const pollingIntervalRef = useRef<number | null>(null);

  // Read order_number from query params if redirected from cart or existing order
  const queryOrderNumber = searchParams.get('order_number');

  // Fetch direct product if direct buy
  useEffect(() => {
    if (isDirect && directProductId) {
      setIsLoadingDirectProduct(true);
      api.get<ApiResponse<Product>>(`/products/${directProductId}`)
        .then((res) => {
          if (res.data?.data) {
            setDirectProduct(res.data.data);
          }
        })
        .catch(() => {
          setError(language === 'en' ? 'Product not found or unavailable.' : 'Produk tidak ditemukan atau tidak tersedia.');
        })
        .finally(() => {
          setIsLoadingDirectProduct(false);
        });
    }
  }, [isDirect, directProductId, language]);

  useEffect(() => {
    if (queryOrderNumber && !createdOrder) {
      api.get<ApiResponse<Order>>(`/orders/${queryOrderNumber}`)
        .then((res) => {
          if (res.data?.data) {
            setCreatedOrder(res.data.data);
          }
        })
        .catch(() => {});
    }
  }, [queryOrderNumber, createdOrder]);

  // Sync cart from backend when entering checkout page if not direct
  useEffect(() => {
    if (!createdOrder && !queryOrderNumber && !isDirect) {
      refreshCart();
    }
  }, [refreshCart, createdOrder, queryOrderNumber, isDirect]);

  // Calculate current subtotal and item count
  const currentSubtotal = isDirect 
    ? (directProduct ? Number(directProduct.price) * directQuantity : 0)
    : totalAmount;

  const currentItemCount = isDirect ? directQuantity : totalItems;

  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const finalCalculatedTotal = Math.max(1000, Math.max(0, currentSubtotal - discountAmount));

  // Handle apply promo code
  const handleApplyPromo = async (codeToApply?: string) => {
    const targetCode = (codeToApply || promoCodeInput).trim().toUpperCase();
    if (!targetCode) return;

    setIsApplyingPromo(true);
    setPromoError(null);
    setPromoSuccessMsg(null);

    try {
      const response = await api.post<ApiResponse<AppliedPromo>>('/promo/validate', {
        promo_code: targetCode,
        subtotal: currentSubtotal,
      });

      if (response.data?.data) {
        setAppliedPromo(response.data.data);
        setPromoCodeInput(targetCode);
        setPromoSuccessMsg(response.data.message || (language === 'en' ? 'Promo code applied successfully!' : 'Kode promo berhasil digunakan!'));
      }
    } catch (err: any) {
      setAppliedPromo(null);
      const msg = err.response?.data?.message || (language === 'en' ? 'Invalid promo code or requirements not met.' : 'Kode promo tidak valid atau syarat tidak terpenuhi.');
      setPromoError(msg);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
    setPromoSuccessMsg(null);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirect && items.length === 0) return;
    if (isDirect && !directProduct) return;

    setError(null);
    setIsProcessing(true);

    try {
      const payload: Record<string, any> = {
        shipping_address: shippingAddress,
        phone,
        notes: notes || undefined,
      };

      if (isDirect && directProductId) {
        payload.product_id = Number(directProductId);
        payload.quantity = directQuantity;
      }

      if (appliedPromo) {
        payload.promo_code = appliedPromo.code;
      }

      const response = await api.post<ApiResponse<Order>>('/checkout', payload);

      if (response.data?.data) {
        setCreatedOrder(response.data.data);
        if (!isDirect) {
          await refreshCart();
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || (language === 'en' ? 'Failed to process order. Please check your data.' : 'Gagal memproses pesanan. Periksa kembali data Anda.');
      setError(errMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Check order status manually or via polling
  const checkOrderStatus = useCallback(async (orderNumber: string, isManual = false) => {
    if (isManual) setIsCheckingPayment(true);
    try {
      const res = await api.get<ApiResponse<Order>>(`/orders/${orderNumber}`);
      if (res.data?.data) {
        const orderData = res.data.data;
        setCreatedOrder(orderData);

        if (orderData.payment_status === 'paid') {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          if (!isDirect) {
            await refreshCart();
          }
        }
      }
    } catch {
      // Ignored
    } finally {
      if (isManual) setIsCheckingPayment(false);
    }
  }, [refreshCart, isDirect]);

  // Start polling when order is created and unpaid
  useEffect(() => {
    if (!createdOrder) return;

    if (createdOrder.payment_status === 'unpaid') {
      pollingIntervalRef.current = window.setInterval(() => {
        checkOrderStatus(createdOrder.order_number);
      }, 3500);

      // 15-minute countdown timer
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        clearInterval(timer);
      };
    } else if (createdOrder.payment_status === 'paid') {
      if (!isDirect) {
        refreshCart();
      }
    }
  }, [createdOrder, checkOrderStatus, refreshCart, isDirect]);

  // Simulate instant payment success in development sandbox
  const handleSimulatePayment = async () => {
    if (!createdOrder) return;
    setIsSimulatingPayment(true);
    try {
      const res = await api.post<ApiResponse<Order>>(`/orders/${createdOrder.order_number}/simulate-paid`);
      if (res.data?.data) {
        setCreatedOrder(res.data.data);
        if (!isDirect) {
          await refreshCart();
        }
      }
    } catch {
      // Manual fallback
      checkOrderStatus(createdOrder.order_number, true);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Payment Success Confirmed Screen
  if (createdOrder && createdOrder.payment_status === 'paid') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" /> {language === 'en' ? 'QRIS Payment Verified' : 'Pembayaran QRIS Terverifikasi'}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('payment_success_title')}</h2>
            <p className="text-xs text-slate-500">
              {t('payment_success_desc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t('order_id')}:</span>
              <span className="font-mono font-bold text-blue-600">{createdOrder.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t('payment_method')}:</span>
              <span className="font-bold text-slate-900 uppercase">QRIS Realtime (Xendit)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t('order_status')}:</span>
              <span className="font-bold text-emerald-600 uppercase">{t('status_paid')}</span>
            </div>
            {createdOrder.promo_code && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span className="flex items-center gap-1"><TicketPercent className="w-3.5 h-3.5" /> Voucher:</span>
                <span>{createdOrder.promo_code} (-{formatPrice(Number(createdOrder.discount_amount || 0))})</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">{t('total')}:</span>
              <span className="font-black text-slate-900 text-sm">{formatPrice(Number(createdOrder.total_amount))}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium">{t('shipping_address')}:</span>
              <span className="font-semibold text-slate-800 max-w-[200px] truncate text-right">{createdOrder.shipping_address}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              to="/"
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              {t('back_to_home')}
            </Link>
            <button
              onClick={() => navigate(`/orders/${createdOrder.order_number}`)}
              className="w-full sm:flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {t('view_order_status')}
            </button>
            <Link
              to="/products"
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-slate-500" />
              {language === 'en' ? 'Shop More' : 'Belanja Lagi'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Dynamic QRIS Payment Screen (When order is UNPAID)
  if (createdOrder && createdOrder.payment_status === 'unpaid') {
    return (
      <div className="max-w-xl mx-auto py-8 px-4">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <QrCode className="w-3.5 h-3.5" /> Dynamic QRIS (Xendit Gateway)
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {language === 'en' ? 'Scan & Pay with QRIS' : 'Scan & Bayar dengan QRIS'}
            </h2>
            <p className="text-xs text-slate-500">
              {t('qris_scan_instruction')}
            </p>
          </div>

          {/* Amount & Countdown Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('total')}</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600">
                {formatPrice(createdOrder.total_amount)}
              </span>
              {createdOrder.promo_code && (
                <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                  Voucher {createdOrder.promo_code} (-{formatPrice(Number(createdOrder.discount_amount || 0))})
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-end gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> {language === 'en' ? 'Time Remaining' : 'Batas Waktu'}
              </span>
              <span className="font-mono text-sm sm:text-base font-extrabold text-amber-600">
                {formatTimer(timeLeft)}
              </span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 inline-block shadow-sm relative group">
            {/* QRIS Top Banner Mockup */}
            <div className="pb-3 mb-3 border-b border-slate-100 flex items-center justify-between gap-4">
              <span className="text-[11px] font-black tracking-widest text-slate-800 uppercase">
                QRIS
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">
                {language === 'en' ? 'National Payment Standard' : 'Standar Pembayaran Nasional'}
              </span>
            </div>

            {createdOrder.qr_string ? (
              <div className="p-2 bg-white rounded-xl flex items-center justify-center">
                <QRCodeSVG
                  value={createdOrder.qr_string}
                  size={210}
                  level="M"
                  includeMargin={false}
                />
              </div>
            ) : (
              <div className="w-52 h-52 bg-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400">
                {language === 'en' ? 'Loading Barcode...' : 'Memuat Barcode...'}
              </div>
            )}

            <div className="pt-3 mt-3 border-t border-slate-100">
              <p className="text-[10px] font-mono text-slate-500 font-semibold truncate max-w-[210px]">
                NMID: {createdOrder.order_number}
              </p>
            </div>
          </div>

          {/* Auto Verification Status & Manual Check */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-200">
              <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>{language === 'en' ? 'Waiting for automated payment webhook...' : 'Menunggu pembayaran otomatis terdeteksi via webhook...'}</span>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => checkOrderStatus(createdOrder.order_number, true)}
                disabled={isCheckingPayment}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCheckingPayment ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Check Payment Status' : 'Cek Status Pembayaran Manual'}
                  </>
                )}
              </button>

              {/* Instant Simulation Button (Development Sandbox) */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Sandbox / Testing Mode
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                    Dev Mode
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  disabled={isSimulatingPayment}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  title="Klik untuk mensimulasikan pembayaran QRIS sukses secara langsung"
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

          <p className="text-[11px] text-slate-400">
            {language === 'en'
              ? 'Once paid or simulated, your order status will immediately update to PAID.'
              : 'Setelah pembayaran selesai dipindai atau disimulasikan, status order akan otomatis berubah menjadi LUNAS (PAID).'}
          </p>
        </div>
      </div>
    );
  }

  // 3. Loading direct product state
  if (isDirect && isLoadingDirectProduct) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">{language === 'en' ? 'Preparing your direct checkout...' : 'Menyiapkan proses checkout langsung...'}</p>
      </div>
    );
  }

  // 4. Empty Cart fallback (only for non-direct mode)
  if (!isDirect && items.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto space-y-4 shadow-xs">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">{t('cart_empty_title')}</h2>
        <p className="text-xs text-slate-500">{t('cart_empty_desc')}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          {t('start_shopping')}
        </Link>
      </div>
    );
  }

  // 5. Standard Checkout Form
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b border-slate-200/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-blue-600" />
            {t('checkout_title')}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'en'
              ? 'Complete your shipping information to finish your order via Dynamic QRIS'
              : 'Lengkapi data pengiriman untuk menyelesaikan pesanan dengan pembayaran Dynamic QRIS'}
          </p>
        </div>

        {isDirect && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-xs">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {t('direct_checkout_badge')}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCreateOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              1. {t('shipping_info')}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">{t('shipping_address')}</label>
                <textarea
                  required
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder={language === 'en' ? 'Street name, house number, district, city, zip code...' : 'Nama jalan, nomor rumah, RT/RW, kecamatan, kota, kode pos...'}
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  {t('notes_optional')}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'en' ? 'e.g. Leave with security desk' : 'Contoh: Titipkan di satpam jika tidak ada orang di rumah'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              2. {t('payment_method')}
            </h2>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Dynamic QRIS (Xendit Gateway)</span>
                  <span className="text-[11px] text-slate-600">Scan via GoPay, OVO, ShopeePay, DANA, BCA, Mandiri</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-blue-600 text-white">
                {language === 'en' ? 'Instant' : 'Otomatis'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Promo Code */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 space-y-6 sticky top-24 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>{t('order_summary')}</span>
              <span className="text-xs text-slate-500 font-mono font-medium">{currentItemCount} {language === 'en' ? 'Items' : 'Item'}</span>
            </h3>

            {/* Items List Preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {isDirect && directProduct ? (
                <div className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <div className="truncate">
                    <p className="text-slate-900 font-bold truncate">{directProduct.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {formatPrice(directProduct.price)} × {directQuantity}
                    </p>
                  </div>
                  <span className="font-bold text-slate-800 shrink-0">
                    {formatPrice(Number(directProduct.price) * directQuantity)}
                  </span>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="truncate">
                      <p className="text-slate-900 font-bold truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-bold text-slate-800 shrink-0">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code Voucher Section */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <TicketPercent className="w-4 h-4 text-blue-600" />
                {t('promo_code')}
              </label>

              {appliedPromo ? (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{appliedPromo.code}</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      {appliedPromo.description} (-{formatPrice(appliedPromo.discount)})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title={t('remove_promo')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApplyPromo();
                          }
                        }}
                        placeholder={t('promo_code_placeholder')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 uppercase tracking-wider focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      disabled={isApplyingPromo || !promoCodeInput.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-40 shrink-0"
                    >
                      {isApplyingPromo ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t('apply_promo')
                      )}
                    </button>
                  </div>

                  {/* Available Promos Clickable Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-medium">{language === 'en' ? 'Try:' : 'Coba:'}</span>
                    {['DISKON50', 'RENSTORE2026', 'HEMAT10'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setPromoCodeInput(code);
                          handleApplyPromo(code);
                        }}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-red-500 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {promoError}
                </p>
              )}
              {promoSuccessMsg && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3 shrink-0" />
                  {promoSuccessMsg}
                </p>
              )}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>{language === 'en' ? `Subtotal (${currentItemCount} items)` : `Subtotal Produk (${currentItemCount} item)`}</span>
                <span>{formatPrice(currentSubtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    {t('discount')} ({appliedPromo?.code})
                  </span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>{t('shipping')}</span>
                <span className="text-emerald-600 font-bold">{t('free')}</span>
              </div>

              <div className="flex items-center justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>{t('total')}</span>
                <span className="text-base text-blue-600 font-black">
                  {formatPrice(finalCalculatedTotal)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing || (isDirect && !directProduct)}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {language === 'en' ? 'Generate QRIS & Place Order' : 'Generate QRIS & Buat Pesanan'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
