import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  LogOut, 
  Shield, 
  Menu, 
  X, 
  Package, 
  ChevronDown,
  Globe,
  Coins,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocale } from '../contexts/LocaleContext';
import api from '../api/axios';
import { Category, ApiResponse } from '../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { language, currency, setLanguage, setCurrency, t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isGuestLocaleOpen, setIsGuestLocaleOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const guestLocaleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get<ApiResponse<Category[]>>('/categories');
        if (response.data && response.data.data) {
          setCategories(response.data.data);
        }
      } catch {
        // Ignored
      }
    };
    fetchCategories();
  }, []);

  // Close menus on route change or outside click
  useEffect(() => {
    setIsCategoryOpen(false);
    setIsUserMenuOpen(false);
    setIsGuestLocaleOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (guestLocaleRef.current && !guestLocaleRef.current.contains(event.target as Node)) {
        setIsGuestLocaleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.header
      className={`relative z-30 sticky top-0 transition-all duration-300 ${
        scrolled ? 'shadow-md shadow-slate-900/5' : 'shadow-xs'
      }`}
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-8 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 group-hover:bg-blue-700 group-hover:scale-105 transition-all">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 block leading-none">
                  RENSTORE
                </span>
                <span className="text-[10px] font-extrabold text-blue-600 tracking-wider uppercase">
                  Tech &amp; Lifestyle
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                to="/"
                className={`text-xs font-bold transition-all relative py-1 ${
                  location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {t('home')}
                {location.pathname === '/' && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </Link>
              <Link
                to="/products"
                className={`text-xs font-bold transition-all relative py-1 ${
                  location.pathname === '/products' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                {t('catalog')}
                {location.pathname === '/products' && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </Link>

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-1 py-1"
                >
                  {t('categories')}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl p-2 shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    <div className="max-h-60 overflow-y-auto">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category_slug=${cat.slug}`}
                          onClick={() => setIsCategoryOpen(false)}
                          className="block px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Center Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-12 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all shadow-2xs"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold text-slate-400 bg-slate-200/70 px-1.5 py-0.5 rounded pointer-events-none">
              Enter
            </span>
          </form>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 transition-all duration-200"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-5 h-5" />
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
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 transition-all"
                >
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
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
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-top-2 duration-150 z-50 divide-y divide-slate-100">
                    {/* User Profile Header */}
                    <div className="flex items-center gap-3 px-2 py-2 pb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs overflow-hidden shrink-0">
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
                        <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100 mt-1">
                          {user?.role === 'admin' ? t('role_admin') : t('role_customer')}
                        </span>
                      </div>
                    </div>

                    {/* Integrated Language & Currency Preferences Section */}
                    <div className="py-2.5 px-3 space-y-2.5">
                      {/* Language (Translate) Switcher */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[11px] font-bold">{language === 'en' ? 'Language' : 'Bahasa'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setLanguage('id')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                              language === 'id' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            ID
                          </button>
                          <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                              language === 'en' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                      {/* Currency Converter Switcher */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Coins className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] font-bold">{language === 'en' ? 'Currency' : 'Mata Uang'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setCurrency('IDR')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                              currency === 'IDR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            IDR
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                              currency === 'USD' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            USD
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="pt-2 space-y-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-blue-600" />
                        {t('view_profile')}
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          {t('admin_dashboard')}
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        {t('orders_history')}
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
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
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all shadow-2xs"
                    title="Preferences / Pengaturan Bahasa & Mata Uang"
                  >
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language.toUpperCase()}</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-emerald-600">{currency}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isGuestLocaleOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xl shadow-slate-900/10 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Globe className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[11px] font-bold">{language === 'en' ? 'Language' : 'Bahasa'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setLanguage('id')}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                              language === 'id' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            ID
                          </button>
                          <button
                            type="button"
                            onClick={() => setLanguage('en')}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                              language === 'en' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            EN
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Coins className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[11px] font-bold">{language === 'en' ? 'Currency' : 'Mata Uang'}</span>
                        </div>
                        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
                          <button
                            type="button"
                            onClick={() => setCurrency('IDR')}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                              currency === 'IDR' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            IDR
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrency('USD')}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                              currency === 'USD' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
                  className="text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-600/20"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              aria-label="Toggle Navigation"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white p-4 space-y-4 animate-in slide-in-from-top duration-150 shadow-xl">
          {/* Mobile Language & Currency Switchers */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setLanguage('id')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
                    language === 'id' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
                    language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-slate-500" />
              <div className="flex bg-white rounded-xl p-0.5 border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setCurrency('IDR')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
                    currency === 'IDR' ? 'bg-emerald-600 text-white' : 'text-slate-600'
                  }`}
                >
                  IDR
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold ${
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400"
            />
          </form>

          <nav className="space-y-1">
            <Link
              to="/"
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {t('home')}
            </Link>
            <Link
              to="/products"
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {t('catalog')}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category_slug=${cat.slug}`}
                className="block px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-50"
              >
                • {cat.name}
              </Link>
            ))}
          </nav>

          {!isAuthenticated && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <Link
                to="/login"
                className="text-center py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="text-center py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.header>
  );
};

export default Navbar;
