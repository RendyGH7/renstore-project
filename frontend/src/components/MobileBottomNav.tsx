import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Grid, Flame, ShoppingCart, User as UserIcon, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';

export const MobileBottomNav: React.FC = () => {
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin } = useAuth();
  const { language } = useLocale();
  const location = useLocation();

  // Hide bottom nav on admin panel or product detail page where dedicated sticky action bar exists
  if (location.pathname.startsWith('/admin') || (location.pathname.startsWith('/products/') && location.pathname !== '/products')) {
    return null;
  }

  const navItems = [
    {
      to: '/',
      label: language === 'en' ? 'Home' : 'Beranda',
      icon: Home,
      exact: true,
    },
    {
      to: '/products',
      label: language === 'en' ? 'Catalog' : 'Katalog',
      icon: Grid,
      exact: false,
    },
    {
      to: '/flash-sale',
      label: 'Flash Sale',
      icon: Flame,
      highlight: true,
      exact: false,
    },
    {
      to: '/cart',
      label: language === 'en' ? 'Cart' : 'Keranjang',
      icon: ShoppingCart,
      badge: totalItems,
      exact: false,
    },
    {
      to: isAuthenticated ? (isAdmin ? '/admin' : '/profile') : '/login',
      label: isAuthenticated ? (isAdmin ? 'Admin' : (language === 'en' ? 'Account' : 'Akun')) : (language === 'en' ? 'Login' : 'Masuk'),
      icon: isAdmin ? Shield : UserIcon,
      exact: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-2 py-1.5 safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location.pathname === item.to 
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 select-none ${
                isActive
                  ? item.highlight
                    ? 'text-rose-600 font-bold'
                    : 'text-blue-600 font-bold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`}
            >
              {/* Active Indicator Top Dot / Glow */}
              {isActive && (
                <span 
                  className={`absolute -top-1 w-5 h-1 rounded-full ${
                    item.highlight ? 'bg-rose-500 shadow-sm shadow-rose-500/50' : 'bg-blue-600 shadow-sm shadow-blue-600/50'
                  }`} 
                />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'scale-100 stroke-[1.8]'
                  } ${item.highlight && isActive ? 'text-rose-500 fill-rose-500/20 animate-pulse' : ''}`}
                />

                {/* Badge for Cart Count */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-white">
                    {item.badge && item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-0.5 leading-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
