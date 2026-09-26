import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search,
  Bell,
  Truck,
  Tag,
  Check,
  Copy,
  CheckCheck,
  ArrowRight,
  LogOut, 
  Shield, 
  Menu, 
  X, 
  Package, 
  ChevronDown,
  Globe,
  Coins,
  User as UserIcon,
  Sparkles,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocale } from '../contexts/LocaleContext';
import { WibNotificationItem, getDynamicWibNotifications } from '../utils/wibTime';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, currency, setLanguage, setCurrency, t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGuestLocaleOpen, setIsGuestLocaleOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAllNotifModalOpen, setIsAllNotifModalOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'order' | 'promo'>('all');
  const [notifications, setNotifications] = useState<WibNotificationItem[]>(() => getDynamicWibNotifications());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const guestLocaleRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const homeTabRef = useRef<HTMLAnchorElement>(null);
  const catalogTabRef = useRef<HTMLAnchorElement>(null);
  const flashSaleTabRef = useRef<HTMLAnchorElement>(null);
  const blogsTabRef = useRef<HTMLAnchorElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Global hotkey (Cmd+K / Ctrl+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync search input with URL search param
  useEffect(() => {
    const searchParam = new URLSearchParams(location.search).get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    } else if (!location.pathname.startsWith('/products')) {
      setSearchQuery('');
    }
  }, [location.search, location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMobileMenuOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleCopyCode = (code: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleNotificationClick = (item: WibNotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
    );
    if (item.link) {
      setIsAllNotifModalOpen(false);
      setIsNotificationOpen(false);
      navigate(item.link);
    } else if (item.voucherCode) {
      handleCopyCode(item.voucherCode);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === 'order') return n.category === 'order';
    if (notificationFilter === 'promo') return n.category === 'promo' || n.category === 'voucher';
    return true;
  });

  useEffect(() => {
    let targetEl: HTMLElement | null = null;
    if (location.pathname === '/') {
      targetEl = homeTabRef.current;
    } else if (location.pathname.startsWith('/products')) {
      targetEl = catalogTabRef.current;
    } else if (location.pathname.startsWith('/flash-sale')) {
      targetEl = flashSaleTabRef.current;
    } else if (location.pathname.startsWith('/blogs')) {
      targetEl = blogsTabRef.current;
    }

    if (targetEl) {
      setPillStyle({
        left: targetEl.offsetLeft,
        width: targetEl.offsetWidth,
        opacity: 1,
      });
    } else {
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [location.pathname, language]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change or outside click
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsGuestLocaleOpen(false);
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (guestLocaleRef.current && !guestLocaleRef.current.contains(event.target as Node)) {
        setIsGuestLocaleOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.header
      className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full transition-all duration-300 pointer-events-none"
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Floating Glassmorphic Navbar Capsule */}
      <div
        className={`pointer-events-auto transition-all duration-300 rounded-2xl sm:rounded-3xl border backdrop-blur-2xl backdrop-saturate-200 relative ${
          scrolled
            ? 'bg-white/60 border-white/80 shadow-[0_12px_40px_rgba(15,23,42,0.1),inset_0_1px_2px_rgba(255,255,255,0.95)]'
            : 'bg-white/35 border-white/70 shadow-[0_10px_35px_rgba(30,58,138,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)]'
        }`}
      >
        {/* Glass Sheen Top Specular Line */}
        <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none rounded-t-full" />

        <div className="px-3.5 sm:px-5 lg:px-6 h-16 sm:h-[68px] flex items-center justify-between gap-3 sm:gap-4 relative z-10">
          {/* Left: Brand Logo & Desktop Nav Links */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/35 transition-all">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                RENSTORE
              </span>
            </Link>

            {/* Desktop Nav Links (Fluid Horizontal Sliding Capsule) */}
            <nav className="relative hidden lg:flex items-center gap-1 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
              {/* Strictly Horizontal Sliding Pill - Immune to vertical page scroll */}
              {pillStyle.opacity > 0 && (
                <motion.div
                  className="absolute top-1 bottom-1 bg-white rounded-full shadow-xs border border-slate-200/80 z-0 pointer-events-none"
                  initial={false}
                  animate={{
                    left: pillStyle.left,
                    width: pillStyle.width,
                    opacity: pillStyle.opacity,
                  }}
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              <Link
                ref={homeTabRef}
                to="/"
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 z-10 ${
                  location.pathname === '/'
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('home')}
              </Link>
              <Link
                ref={catalogTabRef}
                to="/products"
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 z-10 ${
                  location.pathname.startsWith('/products')
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('catalog')}
              </Link>

              <Link
                ref={flashSaleTabRef}
                to="/flash-sale"
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 z-10 flex items-center gap-1.5 ${
                  location.pathname.startsWith('/flash-sale')
                    ? 'text-rose-600'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>{t('flash_sale')}</span>
              </Link>
              <Link
                ref={blogsTabRef}
                to="/blogs"
                className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 z-10 ${
                  location.pathname.startsWith('/blogs')
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t('blogs')}
              </Link>
            </nav>
          </div>

          {/* Center: Desktop Interactive Search Omnibox */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2 lg:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <div className="relative flex items-center w-full">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'en' ? 'Search products, gadgets...' : 'Cari produk, kategori, gadget...'}
                  className="w-full bg-slate-100/80 hover:bg-slate-100/95 focus:bg-white border border-slate-200/80 focus:border-blue-500/80 focus:ring-4 focus:ring-blue-500/10 rounded-full pl-9 pr-14 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all duration-200 outline-none shadow-2xs"
                />
                <div className="absolute right-2.5 flex items-center gap-1.5">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                      title="Clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-extrabold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs select-none pointer-events-none">
                      ⌘K
                    </kbd>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Center Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border backdrop-blur-md shadow-2xs transition-all duration-200 flex items-center justify-center group ${
                  isNotificationOpen
                    ? 'bg-white text-blue-600 border-blue-500/40 shadow-md shadow-blue-500/10'
                    : 'bg-white/60 hover:bg-white/90 text-slate-700 hover:text-blue-600 border-white/80'
                }`}
                title={language === 'en' ? 'Notifications' : 'Notifikasi'}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center shadow-md shadow-red-500/40 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Card */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-[310px] sm:w-[380px] bg-white border border-slate-200 rounded-3xl shadow-2xl shadow-slate-900/25 animate-in fade-in slide-in-from-top-2 duration-150 z-50 overflow-hidden flex flex-col max-h-[85vh]">
                  {/* Header */}
                  <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">
                        {language === 'en' ? 'Notifications' : 'Notifikasi'}
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-600 border border-blue-200">
                          {unreadCount} {language === 'en' ? 'New' : 'Baru'}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        {language === 'en' ? 'Mark all read' : 'Tandai dibaca'}
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-3 pt-2.5 pb-2 flex gap-1.5 border-b border-slate-100 bg-white">
                    <button
                      type="button"
                      onClick={() => setNotificationFilter('all')}
                      className={`px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                        notificationFilter === 'all'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {language === 'en' ? 'All' : 'Semua'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter('order')}
                      className={`px-3 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 ${
                        notificationFilter === 'order'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Truck className="w-3 h-3" />
                      {language === 'en' ? 'Shipping' : 'Pesanan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationFilter('promo')}
                      className={`px-3 py-1 rounded-full text-[11px] font-black transition-all flex items-center gap-1 ${
                        notificationFilter === 'promo'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {language === 'en' ? 'Promos' : 'Promo'}
                    </button>
                  </div>

                    {/* Notification List Scroll Area */}
                  <div className="overflow-y-auto divide-y divide-slate-100 max-h-[360px] p-2 space-y-1">
                    {filteredNotifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-400 text-xs font-semibold">
                        {language === 'en' ? 'No notifications yet' : 'Belum ada notifikasi'}
                      </div>
                    ) : (
                      filteredNotifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3 rounded-2xl transition-all cursor-pointer select-none group/item ${
                            item.isRead ? 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 hover:shadow-2xs' : 'bg-blue-50/30 hover:bg-blue-50/70 border border-blue-100/60 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 sm:gap-3">
                            {/* Icon Indicator */}
                            <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/80 shrink-0 mt-0.5 group-hover/item:scale-105 transition-transform">
                              {item.category === 'order' ? (
                                <Truck className="w-4 h-4 text-blue-600" />
                              ) : item.category === 'voucher' ? (
                                <Sparkles className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Tag className="w-4 h-4 text-amber-500" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-black text-slate-900 truncate group-hover/item:text-blue-600 transition-colors">
                                  {language === 'en' ? item.titleEn : item.titleId}
                                </h4>
                                <span className="text-[9px] font-bold text-slate-400 shrink-0">
                                  {language === 'en' ? item.timestampEn : item.timestampId}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                                {language === 'en' ? item.descEn : item.descId}
                              </p>

                              {/* Order Shipping Tracking Live Card */}
                              {item.category === 'order' && item.courierStatusId && (
                                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                                  <div className="truncate">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                      {language === 'en' ? 'Live Courier Status' : 'Status Pengiriman'}
                                    </span>
                                    <span className="text-[11px] font-extrabold text-blue-600 truncate block">
                                      {language === 'en' ? item.courierStatusEn : item.courierStatusId}
                                    </span>
                                  </div>
                                  <Link
                                    to={item.link}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsNotificationOpen(false);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shrink-0 flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                                  >
                                    {language === 'en' ? 'Track' : 'Lacak'}
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              )}

                              {/* Voucher Code Copy Pill */}
                              {item.voucherCode && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[10px] font-mono font-black text-purple-700 tracking-wider">
                                    {item.voucherCode}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => handleCopyCode(item.voucherCode!, e)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    {copiedCode === item.voucherCode ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span className="text-emerald-700 font-extrabold">
                                          {language === 'en' ? 'Copied!' : 'Tersalin!'}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-500" />
                                        <span>{language === 'en' ? 'Copy Code' : 'Salin Kode'}</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAllNotifModalOpen(true);
                        setIsNotificationOpen(false);
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center justify-center gap-1.5 w-full py-1.5 cursor-pointer transition-colors group"
                    >
                      <span className="group-hover:underline">{language === 'en' ? 'View All Notifications' : 'Tampilkan Semua Notifikasi'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon Button */}
            <Link
              to="/cart"
              className="relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-md text-slate-700 hover:text-blue-600 shadow-2xs transition-all duration-200"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-blue-600/30 animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Account / Profile with Language & Currency Switchers */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 sm:pr-3 rounded-xl sm:rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-md text-slate-800 shadow-2xs transition-all"
                >
                  <div className="w-7 h-7 rounded-lg sm:rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300';
                        }}
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="hidden sm:inline font-bold text-xs truncate max-w-[100px]">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-72 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl shadow-slate-900/25 animate-in fade-in slide-in-from-top-2 duration-150 z-50 divide-y divide-slate-100">
                    {/* User Profile Header */}
                    <div className="flex items-center gap-3 px-2 py-2 pb-3.5">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-blue-500/20 overflow-hidden shrink-0">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300';
                            }}
                          />
                        ) : (
                          user?.name?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user?.name}</p>
                        <p className="text-xs font-semibold text-slate-500 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 mt-1 tracking-wider">
                            {t('role_admin')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Integrated Language & Currency Preferences Section */}
                    <div className="py-3 px-2 space-y-3">
                      {/* Language (Translate) Switcher */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold">{language === 'en' ? 'Language' : 'Bahasa'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setLanguage('id')}
                            className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                              language === 'id' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            ID
                          </button>
                          <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                              language === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                      {/* Currency Converter Switcher */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Coins className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold">{language === 'en' ? 'Currency' : 'Mata Uang'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setCurrency('IDR')}
                            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                              currency === 'IDR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            IDR
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                              currency === 'USD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            USD
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="pt-2.5 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        {t('view_profile')}
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 shrink-0 text-blue-600" />
                          {t('admin_dashboard')}
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-500 shrink-0" />
                        {t('orders_history')}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 shrink-0 text-red-600" />
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                {/* Guest Language & Currency Selector Popover */}
                <div className="relative" ref={guestLocaleRef}>
                  <button
                    type="button"
                    onClick={() => setIsGuestLocaleOpen(!isGuestLocaleOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-md text-slate-700 text-xs font-bold transition-all shadow-2xs"
                    title="Preferences / Pengaturan Bahasa & Mata Uang"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language.toUpperCase()}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-emerald-600">{currency}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isGuestLocaleOpen && (
                    <div className="absolute right-0 top-full mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xl shadow-slate-900/25 space-y-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-bold">{language === 'en' ? 'Language' : 'Bahasa'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setLanguage('id')}
                            className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                              language === 'id' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            ID
                          </button>
                          <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all ${
                              language === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-800">
                          <Coins className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold">{language === 'en' ? 'Currency' : 'Mata Uang'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setCurrency('IDR')}
                            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                              currency === 'IDR' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            IDR
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`px-2.5 py-1 text-[11px] font-black rounded-lg transition-all ${
                              currency === 'USD' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
                            }`}
                          >
                            USD
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/login"
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-md text-slate-700 hover:text-slate-900 transition-all shadow-2xs"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-600/25 border border-blue-500/40"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-white/60 hover:bg-white/90 border border-white/80 backdrop-blur-md text-slate-600 hover:text-slate-900 shadow-2xs"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Solid White Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="pointer-events-auto lg:hidden mt-2.5 rounded-2xl bg-white border border-slate-200 p-4 space-y-4 shadow-2xl shadow-slate-900/25 animate-in slide-in-from-top duration-150">
          {/* Mobile Language & Currency Switchers */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${
                    language === 'id' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${
                    language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setCurrency('IDR')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${
                    currency === 'IDR' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  IDR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 text-xs rounded-md font-bold ${
                    currency === 'USD' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white"
            />
          </form>

          <nav className="space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
            >
              {t('home')}
            </Link>
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
            >
              {t('catalog')}
            </Link>
            <Link
              to="/flash-sale"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50/70 hover:bg-rose-100/70"
            >
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>{t('flash_sale')}</span>
            </Link>
            <Link
              to="/blogs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-100"
            >
              {t('blogs')}
            </Link>
          </nav>

          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <Link
                to="/login"
                className="text-center py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-2xs"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="text-center py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-600/25"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Full Notifications Modal (Tampilkan Semua Notifikasi) */}
      <AnimatePresence>
        {isAllNotifModalOpen && (
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsAllNotifModalOpen(false);
            }}
            className="fixed inset-0 z-[999] pointer-events-auto flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-150"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden text-left pointer-events-auto"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      {language === 'en' ? 'All Notifications' : 'Semua Pesan & Notifikasi'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {language === 'en' ? 'WIB Real-Time Updates & Promotions' : 'Pembaruan Real-Time & Promo Waktu Indonesia (WIB)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Mark read' : 'Tandai dibaca'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAllNotifModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Filter Tabs */}
              <div className="px-5 pt-3 pb-2.5 flex gap-2 border-b border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={() => setNotificationFilter('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
                    notificationFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {language === 'en' ? 'All' : 'Semua'} ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationFilter('order')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    notificationFilter === 'order'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Orders' : 'Pesanan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationFilter('promo')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    notificationFilter === 'promo'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{language === 'en' ? 'Promos' : 'Promo'}</span>
                </button>
              </div>

              {/* Modal Notifications Scroll List */}
              <div className="overflow-y-auto p-4 sm:p-5 space-y-3 flex-1 divide-y divide-slate-100">
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                    {language === 'en' ? 'No notifications found' : 'Tidak ada notifikasi'}
                  </div>
                ) : (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-4 rounded-2xl transition-all cursor-pointer select-none group/modal-item ${
                        item.isRead
                          ? 'bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-blue-200 hover:shadow-xs'
                          : 'bg-blue-50/40 border border-blue-200 hover:bg-blue-50/80 hover:border-blue-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-200/80 shrink-0 mt-0.5 group-hover/modal-item:scale-105 transition-transform">
                          {item.category === 'order' ? (
                            <Truck className="w-5 h-5 text-blue-600" />
                          ) : item.category === 'voucher' ? (
                            <Sparkles className="w-5 h-5 text-purple-600" />
                          ) : item.category === 'system' ? (
                            <Shield className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Tag className="w-5 h-5 text-amber-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover/modal-item:text-blue-600 transition-colors">
                              {language === 'en' ? item.titleEn : item.titleId}
                            </h4>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0 bg-white px-2 py-0.5 rounded-md border border-slate-200/60">
                              {language === 'en' ? item.timestampEn : item.timestampId}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {language === 'en' ? item.descEn : item.descId}
                          </p>

                          {item.category === 'order' && item.courierStatusId && (
                            <div className="mt-2.5 p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-3">
                              <div className="truncate">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                  {language === 'en' ? 'Live Courier Status' : 'Status Pengiriman Ekspedisi'}
                                </span>
                                <span className="text-xs font-extrabold text-blue-600 truncate block">
                                  {language === 'en' ? item.courierStatusEn : item.courierStatusId}
                                </span>
                              </div>
                              <Link
                                to={item.link}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsAllNotifModalOpen(false);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <span>{language === 'en' ? 'Track' : 'Lacak'}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          )}

                          {item.voucherCode && (
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-mono font-black text-purple-700 tracking-wider">
                                {item.voucherCode}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => handleCopyCode(item.voucherCode!, e)}
                                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                {copiedCode === item.voucherCode ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700 font-extrabold">
                                      {language === 'en' ? 'Copied!' : 'Tersalin!'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{language === 'en' ? 'Copy Code' : 'Salin Kode'}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
