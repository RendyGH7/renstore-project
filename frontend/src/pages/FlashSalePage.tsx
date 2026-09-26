import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Clock,
  Zap,
  ShoppingBag,
  ShoppingCart,
  Check,
  Lock
} from 'lucide-react';
import api from '../api/axios';
import { Product, PaginatedResponse } from '../types';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedPage from '../components/AnimatedPage';
import { useLocale } from '../contexts/LocaleContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface FlashSaleItem {
  product: Product;
  discountPercent: number;
  originalPrice: number;
  salePrice: number;
  soldCount: number;
  stockTotal: number;
  tag: string;
}

// Helper to get exact Indonesian Western Time (WIB / UTC+7)
const getWibTime = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 7 * 3600000);
};

export const FlashSalePage: React.FC = () => {
  const { language, formatPrice } = useLocale();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string>('slot-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [addedId, setAddedId] = useState<number | null>(null);

  // Real WIB Countdown State
  const [wibHour, setWibHour] = useState<number>(() => getWibTime().getHours());
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Update countdown every second based on real WIB time
  useEffect(() => {
    const updateCountdown = () => {
      const wib = getWibTime();
      const hours = wib.getHours();
      const minutes = wib.getMinutes();
      const seconds = wib.getSeconds();

      setWibHour(hours);

      // Determine which 3-slot cycle is LIVE
      // Slot 1: 00:00 - 12:00
      // Slot 2: 12:00 - 18:00
      // Slot 3: 18:00 - 24:00
      let targetEndHour = 12;
      if (hours >= 12 && hours < 18) {
        targetEndHour = 18;
      } else if (hours >= 18) {
        targetEndHour = 24;
      }

      const totalCurrentSec = hours * 3600 + minutes * 60 + seconds;
      const totalTargetSec = targetEndHour * 3600;
      const diffSec = Math.max(0, totalTargetSec - totalCurrentSec);

      setTimeLeft({
        hours: Math.floor(diffSec / 3600),
        minutes: Math.floor((diffSec % 3600) / 60),
        seconds: diffSec % 60,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Determine current active live slot ID
  const activeLiveSlotId = useMemo(() => {
    if (wibHour >= 0 && wibHour < 12) return 'slot-1';
    if (wibHour >= 12 && wibHour < 18) return 'slot-2';
    return 'slot-3';
  }, [wibHour]);

  // Set initial selected slot to currently live slot
  useEffect(() => {
    setSelectedSlot(activeLiveSlotId);
  }, [activeLiveSlotId]);

  // Generate dynamic time slots with real WIB labels and status
  const timeSlots = useMemo(() => {
    return [
      {
        id: 'slot-1',
        time: '00:00 - 12:00',
        labelId: wibHour < 12 ? 'Sedang Berlangsung' : 'Selesai',
        labelEn: wibHour < 12 ? 'Happening Now' : 'Ended',
        isLive: wibHour >= 0 && wibHour < 12,
        status: (wibHour < 12 ? 'live' : 'ended') as 'live' | 'upcoming' | 'ended',
      },
      {
        id: 'slot-2',
        time: '12:00 - 18:00',
        labelId: wibHour >= 12 && wibHour < 18 ? 'Sedang Berlangsung' : wibHour < 12 ? 'Akan Datang (12:00 WIB)' : 'Selesai',
        labelEn: wibHour >= 12 && wibHour < 18 ? 'Happening Now' : wibHour < 12 ? 'Upcoming 12:00' : 'Ended',
        isLive: wibHour >= 12 && wibHour < 18,
        status: (wibHour >= 12 && wibHour < 18 ? 'live' : wibHour < 12 ? 'upcoming' : 'ended') as 'live' | 'upcoming' | 'ended',
      },
      {
        id: 'slot-3',
        time: '18:00 - 24:00',
        labelId: wibHour >= 18 ? 'Sedang Berlangsung' : 'Malam Ini (18:00 WIB)',
        labelEn: wibHour >= 18 ? 'Happening Now' : 'Tonight 18:00',
        isLive: wibHour >= 18,
        status: (wibHour >= 18 ? 'live' : 'upcoming') as 'live' | 'upcoming' | 'ended',
      },
    ];
  }, [wibHour]);

  // Current selected slot status
  const selectedSlotData = useMemo(() => {
    return timeSlots.find((s) => s.id === selectedSlot) || timeSlots[0];
  }, [timeSlots, selectedSlot]);

  const isSlotLive = selectedSlotData.isLive;
  const isSlotUpcoming = selectedSlotData.status === 'upcoming';

  // Fetch Products
  useEffect(() => {
    const fetchFlashProducts = async () => {
      setIsLoading(true);
      try {
        const res = await api.get<PaginatedResponse<Product>>('/products', {
          params: { per_page: 30, sort: 'latest' },
        });

        if (res.data?.data) {
          setRawProducts(res.data.data);
        }
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlashProducts();
  }, []);

  // Compute products specifically rotated & discounted for the selected slot
  const currentSlotItems: FlashSaleItem[] = useMemo(() => {
    if (rawProducts.length === 0) return [];

    // Distinct rotation offset per session
    const offset = selectedSlot === 'slot-1' ? 0 : selectedSlot === 'slot-2' ? 4 : 8;
    const rotated = rawProducts.map((_, i, arr) => arr[(i + offset) % arr.length]);

    return rotated.slice(0, 12).map((p, idx) => {
      const discountsBySlot = selectedSlot === 'slot-1'
        ? [40, 50, 30, 45, 35, 60, 25, 55]
        : selectedSlot === 'slot-2'
        ? [50, 35, 60, 25, 45, 30, 55, 40]
        : [60, 45, 50, 35, 55, 40, 30, 25];

      const discountPercent = discountsBySlot[idx % discountsBySlot.length];
      const originalPrice = Math.round((p.price / (1 - discountPercent / 100)) / 10000) * 10000;
      const stockTotal = 15 + ((p.id * 11 + idx * 7) % 35);
      const isLiveNow = selectedSlot === activeLiveSlotId;
      const soldMultiplier = isLiveNow ? 0.65 : 0.25;
      const soldCount = Math.min(stockTotal - 1, Math.floor(stockTotal * (soldMultiplier + ((p.id * 5) % 25) / 100)));

      return {
        product: p,
        discountPercent,
        originalPrice,
        salePrice: p.price,
        soldCount: Math.max(1, soldCount),
        stockTotal,
        tag: idx % 3 === 0 ? 'SUPER DEAL' : idx % 2 === 0 ? 'BEST SELLER' : 'LIMITED QUOTA',
      };
    });
  }, [rawProducts, selectedSlot, activeLiveSlotId]);

  // Dynamically extract categories that actually exist in the currently active slot's products
  const availableCategories = useMemo(() => {
    const catsMap = new Map<string, { id: string; nameId: string; nameEn: string }>();

    currentSlotItems.forEach((item) => {
      if (item.product.category) {
        catsMap.set(item.product.category.slug, {
          id: item.product.category.slug,
          nameId: item.product.category.name,
          nameEn: item.product.category.name,
        });
      }
    });

    return [
      { id: 'all', nameId: 'Semua Produk', nameEn: 'All Products' },
      ...Array.from(catsMap.values()),
    ];
  }, [currentSlotItems]);

  // If selected category is no longer in available categories, reset to 'all'
  useEffect(() => {
    if (selectedCategory !== 'all' && !availableCategories.some((c) => c.id === selectedCategory)) {
      setSelectedCategory('all');
    }
  }, [availableCategories, selectedCategory]);

  const handleQuickAdd = async (p: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Strict WIB Time Lock: Only live session can be added to cart
    if (!isSlotLive) return;

    try {
      await addToCart(p.id, 1);
      setAddedId(p.id);
      setTimeout(() => setAddedId(null), 1800);
    } catch {
      // Ignored
    }
  };

  const handleDirectBuy = (p: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Strict WIB Time Lock: Only live session can be directly purchased
    if (!isSlotLive) return;

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout?direct=1&product_id=${p.id}&quantity=1`)}`);
      return;
    }
    navigate(`/checkout?direct=1&product_id=${p.id}&quantity=1`);
  };

  const filteredItems = currentSlotItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.product.category?.slug === selectedCategory;
  });

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <AnimatedPage>
      <div className="space-y-8 pb-16">
        {/* Flash Sale Hero Banner */}
        <motion.div
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 sm:p-10 shadow-2xl shadow-rose-600/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center lg:text-left max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-wider text-amber-200">
                <Flame className="w-4 h-4 text-amber-300 animate-bounce" />
                {language === 'en' ? 'WIB Flash Deals • Limited Quota' : 'Flash Sale Waktu Indonesia (WIB) • Kuota Terbatas'}
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {language === 'en' ? 'Exclusive Flash Sale Up to 60% OFF' : 'Flash Sale Spesial Diskon s/d 60%'}
              </h1>

              <p className="text-xs sm:text-sm text-rose-100 leading-relaxed font-medium">
                {language === 'en'
                  ? 'Grab authentic flagship tech & lifestyle items with 1-click instant direct checkout before the WIB timer hits zero!'
                  : 'Dapatkan produk original impian Anda dengan harga spesial & beli langsung tanpa antre sesuai sesi waktu Indonesia (WIB)!'}
              </p>
            </div>

            {/* Live Ticking Countdown Capsule (WIB Time) */}
            <div className="bg-white/15 backdrop-blur-2xl border border-white/30 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col items-center shrink-0 min-w-[280px]">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-200 flex items-center gap-1.5 mb-3">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                {language === 'en' ? 'Live Session Ends in (WIB)' : 'Sesi Berakhir Dalam (WIB)'}
              </span>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <div className="w-13 sm:w-15 h-13 sm:h-15 rounded-2xl bg-slate-900/90 text-white flex items-center justify-center font-mono font-black text-xl sm:text-2xl shadow-lg border border-white/10">
                    {formatNumber(timeLeft.hours)}
                  </div>
                  <span className="text-[10px] font-bold text-rose-100 mt-1 uppercase">Jam</span>
                </div>

                <span className="text-2xl font-black text-white/90 -mt-4">:</span>

                <div className="flex flex-col items-center">
                  <div className="w-13 sm:w-15 h-13 sm:h-15 rounded-2xl bg-slate-900/90 text-white flex items-center justify-center font-mono font-black text-xl sm:text-2xl shadow-lg border border-white/10">
                    {formatNumber(timeLeft.minutes)}
                  </div>
                  <span className="text-[10px] font-bold text-rose-100 mt-1 uppercase">Menit</span>
                </div>

                <span className="text-2xl font-black text-white/90 -mt-4">:</span>

                <div className="flex flex-col items-center">
                  <div className="w-13 sm:w-15 h-13 sm:h-15 rounded-2xl bg-slate-900/90 text-amber-300 flex items-center justify-center font-mono font-black text-xl sm:text-2xl shadow-lg border border-white/10 animate-pulse">
                    {formatNumber(timeLeft.seconds)}
                  </div>
                  <span className="text-[10px] font-bold text-rose-100 mt-1 uppercase">Detik</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Time Slots Session Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => {
                  setSelectedSlot(slot.id);
                  setSelectedCategory('all');
                }}
                className={`p-4 rounded-3xl border transition-all duration-200 ease-out text-left flex items-center justify-between cursor-pointer hover:-translate-y-1 ${
                  isSelected
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white border-transparent shadow-lg shadow-rose-600/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-800 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-rose-500'}`} />
                    <span className="text-sm font-black">{slot.time} WIB</span>
                  </div>
                  <span className={`text-xs font-semibold ${isSelected ? 'text-rose-100' : 'text-slate-500'}`}>
                    {language === 'en' ? slot.labelEn : slot.labelId}
                  </span>
                </div>
                {slot.isLive && (
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse ${
                    isSelected ? 'bg-white text-rose-600 shadow-xs' : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Session Status Notice Banner (when viewing non-live slot) */}
        {!isSlotLive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 sm:p-5 rounded-2xl border flex items-center gap-3.5 ${
              isSlotUpcoming
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            {isSlotUpcoming ? (
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            ) : (
              <Lock className="w-5 h-5 text-slate-500 shrink-0" />
            )}
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold block">
                {isSlotUpcoming
                  ? (language === 'en' ? `Session ${selectedSlotData.time} WIB is Upcoming` : `Sesi ${selectedSlotData.time} WIB Belum Dimulai`)
                  : (language === 'en' ? `Session ${selectedSlotData.time} WIB has Ended` : `Sesi ${selectedSlotData.time} WIB Telah Berakhir`)}
              </span>
              <span className="opacity-90 font-medium text-xs">
                {isSlotUpcoming
                  ? (language === 'en' ? 'Products in this session can only be purchased once the session becomes LIVE according to Western Indonesia Time (WIB).' : 'Produk pada sesi ini baru dapat dibeli saat jam sesi aktif sesuai Waktu Indonesia Barat (WIB).')
                  : (language === 'en' ? 'Flash sale promo for this session is over. Please check our currently LIVE session to claim deals.' : 'Promo flash sale sesi ini telah selesai. Silakan pilih sesi yang sedang LIVE untuk membeli produk dengan harga promo.')}
              </span>
            </div>
          </motion.div>
        )}

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all duration-150 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {language === 'en' ? cat.nameEn : cat.nameId}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <SkeletonLoader count={8} />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? 'No Flash Sale Items in this Category' : 'Belum Ada Produk Flash Sale di Kategori Ini'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'en' ? 'Please check back in the next flash sale session.' : 'Silakan pilih kategori lain atau cek sesi flash sale lainnya.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredItems.map((item) => {
              const { product, discountPercent, originalPrice, salePrice, soldCount, stockTotal, tag } = item;
              const percentSold = Math.round((soldCount / stockTotal) * 100);
              const isAlmostGone = percentSold >= 80;

              return (
                <div
                  key={product.id}
                  className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-1.5 transition-all duration-200 ease-out overflow-hidden flex flex-col justify-between group relative ${
                    !isSlotLive ? 'opacity-90 hover:border-slate-300' : 'hover:border-rose-300'
                  }`}
                >
                  {/* Floating Discount Tag Badge */}
                  <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 z-20 flex flex-col gap-1">
                    <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-white font-black text-[9px] sm:text-[11px] shadow-md flex items-center gap-1 ${
                      isSlotLive ? 'bg-gradient-to-r from-red-600 to-rose-600 shadow-red-600/30' : 'bg-slate-700 shadow-slate-900/20'
                    }`}>
                      <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300" />
                      -{discountPercent}%
                    </span>
                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg text-white font-black text-[8px] sm:text-[9px] uppercase tracking-wider shadow-xs ${
                      isSlotLive ? 'bg-amber-500' : 'bg-slate-500'
                    }`}>
                      {tag}
                    </span>
                  </div>

                  <div>
                    {/* Product Image Box (Strict 1:1 Square) */}
                    <Link
                      to={`/products/${product.slug}`}
                      className="block relative aspect-square w-full bg-slate-100 overflow-hidden"
                    >
                      <img
                        src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600'}
                        alt={product.name}
                        className="w-full h-full aspect-square object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600';
                        }}
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                      <div className="space-y-0.5 sm:space-y-1">
                        <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {product.category?.name || 'TECH'}
                        </span>
                        <Link
                          to={`/products/${product.slug}`}
                          className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors duration-150 line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-0.5">
                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
                          <span className="text-xs sm:text-base lg:text-lg font-black text-rose-600">
                            {formatPrice(salePrice)}
                          </span>
                          <span className="text-[10px] sm:text-xs text-slate-400 line-through font-medium">
                            {formatPrice(originalPrice)}
                          </span>
                        </div>
                      </div>

                      {/* Sold Progress Bar */}
                      <div className="space-y-1 sm:space-y-1.5 pt-0.5 sm:pt-1">
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                          <span className={`${isAlmostGone && isSlotLive ? 'text-rose-600' : 'text-slate-600'} truncate`}>
                            {isAlmostGone && isSlotLive ? (
                              <span className="flex items-center gap-1 font-black text-rose-600 animate-pulse">
                                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-600 shrink-0" />
                                {language === 'en' ? `Left ${stockTotal - soldCount}` : `Sisa ${stockTotal - soldCount}`}
                              </span>
                            ) : (
                              `${language === 'en' ? 'Sold' : 'Terjual'} ${soldCount}`
                            )}
                          </span>
                          <span className="text-slate-400 font-medium">{percentSold}%</span>
                        </div>

                        <div className="h-1.5 sm:h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              !isSlotLive
                                ? 'bg-slate-300'
                                : isAlmostGone
                                ? 'bg-gradient-to-r from-red-600 to-rose-500'
                                : 'bg-gradient-to-r from-amber-500 to-rose-500'
                            }`}
                            style={{ width: `${percentSold}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Direct Buy (Main) + Add to Cart (Secondary) with strict WIB lock */}
                  <div className="p-3 sm:p-5 pt-0 flex items-center gap-1.5 sm:gap-2">
                    {isSlotLive ? (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleDirectBuy(product, e)}
                          className="flex-1 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-xl sm:rounded-full font-black text-[10px] sm:text-xs flex items-center justify-center gap-1 sm:gap-2 transition-all duration-150 cursor-pointer bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-700 hover:via-rose-700 hover:to-orange-600 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 active:scale-[0.98]"
                        >
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 shrink-0" />
                          <span className="truncate font-extrabold">{language === 'en' ? 'Buy' : 'Beli'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          title={language === 'en' ? 'Add to Cart' : 'Tambah ke Keranjang'}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-full flex items-center justify-center shrink-0 transition-all duration-150 border cursor-pointer ${
                            addedId === product.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                              : 'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm'
                          }`}
                        >
                          {addedId === product.id ? (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          ) : (
                            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
                          )}
                        </button>
                      </>
                    ) : isSlotUpcoming ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl sm:rounded-full font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 cursor-not-allowed select-none"
                      >
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          {language === 'en' ? `${selectedSlotData.time.split(' - ')[0]}` : `Jam ${selectedSlotData.time.split(' - ')[0]}`}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl sm:rounded-full font-bold text-[10px] sm:text-xs flex items-center justify-center gap-1.5 bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed select-none"
                      >
                        <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {language === 'en' ? 'Ended' : 'Selesai'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default FlashSalePage;

