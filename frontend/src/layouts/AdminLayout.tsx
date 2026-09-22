import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  ArrowLeft, 
  LogOut, 
  ShieldCheck,
  User as UserIcon,
  Store,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Desktop sidebar collapse state with persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('renstore_admin_sidebar_collapsed') === 'true';
  });

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('renstore_admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: FolderTree },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans">
      {/* Desktop Admin Sidebar (Sticky / Fixed to Viewport, Non-scrolling with collapse toggle) */}
      <aside 
        className={`hidden md:flex flex-col justify-between shrink-0 bg-[#111827] text-slate-300 border-r border-slate-800/80 sticky top-0 h-screen z-30 transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar">
          {/* Logo & Brand Header with Collapse Toggle */}
          <div className={`h-20 flex items-center border-b border-slate-800/60 transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'px-3 justify-center' : 'px-5 justify-between'
          }`}>
            <div className={`flex items-center gap-3 overflow-hidden whitespace-nowrap ${isCollapsed ? 'justify-center' : ''}`}>
              <div 
                onClick={() => isCollapsed && setIsCollapsed(false)}
                className={`h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 shrink-0 ${isCollapsed ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''}`}
                title={isCollapsed ? "Klik untuk memperluas sidebar" : undefined}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>

              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                  <span className="text-base font-extrabold tracking-tight text-white block leading-tight">
                    RENSTORE
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Admin Portal
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Collapse toggle button on sidebar header */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                title="Ciutkan Sidebar (Collapse)"
                aria-label="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* If Collapsed, Quick Expand Toggle at top */}
          {isCollapsed && (
            <div className="pt-3 px-3 flex justify-center animate-in fade-in duration-200">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-blue-600 text-slate-300 hover:text-white transition-all shadow-xs hover:scale-105 active:scale-95"
                title="Buka Sidebar (Expand)"
                aria-label="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Sections */}
          <div className="p-3 space-y-6 flex-1 overflow-hidden">
            <div>
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 whitespace-nowrap animate-in fade-in duration-200">
                  MENU UTAMA
                </span>
              )}
              <nav className="space-y-1.5">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={isCollapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center rounded-2xl text-xs font-bold transition-all duration-200 relative group overflow-hidden whitespace-nowrap ${
                          isCollapsed 
                            ? 'justify-center p-3' 
                            : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                      </div>

                      {/* Orders Badge */}
                      {item.to === '/admin/orders' && (
                        !isCollapsed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                            Live
                          </span>
                        ) : (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                        )
                      )}

                      {/* Hover Tooltip when collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 border border-slate-700">
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div>
              {!isCollapsed && (
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2 whitespace-nowrap animate-in fade-in duration-200">
                  PINTASAN
                </span>
              )}
              <div className="space-y-1.5">
                <Link
                  to="/"
                  title={isCollapsed ? "Kunjungi Toko" : undefined}
                  className={`flex items-center rounded-2xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-200 relative group overflow-hidden whitespace-nowrap ${
                    isCollapsed ? 'justify-center p-3' : 'gap-3 px-3.5 py-2.5'
                  }`}
                >
                  <Store className="w-4 h-4 shrink-0 text-blue-400" />
                  {!isCollapsed && <span className="truncate whitespace-nowrap">Kunjungi Toko</span>}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 border border-slate-700">
                      Kunjungi Toko
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-800/60 overflow-hidden">
          <div className={`flex items-center rounded-2xl bg-slate-800/60 border border-slate-800 transition-all duration-300 overflow-hidden ${
            isCollapsed ? 'flex-col gap-2 p-2 justify-center' : 'justify-between p-2.5'
          }`}>
            <div className={`flex items-center gap-2.5 overflow-hidden min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'A'
                )}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden whitespace-nowrap animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@renstore.com'}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className={`p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 ${
                isCollapsed ? 'w-full flex items-center justify-center' : ''
              }`}
              title="Keluar (Logout)"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* Top Navbar Header */}
        <header className="h-16 border-b border-slate-200/80 bg-white px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop collapse/expand toggle button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex p-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all shadow-2xs"
              title={isCollapsed ? "Buka Sidebar (Expand)" : "Ciutkan Sidebar (Collapse)"}
              aria-label="Toggle Sidebar"
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 hidden sm:inline">
                RENSTORE Console
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                Sistem Manajemen Terintegrasi
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Ke Toko
            </Link>

            <Link
              to="/profile"
              className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden"
              title="Pengaturan Profil"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'A'
              )}
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm flex">
            <div className="w-64 bg-[#111827] text-white p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm block leading-none">RENSTORE</span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">Admin Portal</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.to === '/admin/orders' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            Live
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="pt-2 border-t border-slate-800">
                  <Link
                    to="/"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                  >
                    <Store className="w-4 h-4 text-blue-400" />
                    Kunjungi Toko
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/80 text-xs font-bold text-slate-200"
                >
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span>Pengaturan Profil</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/10 text-red-400 border border-red-500/20 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileSidebarOpen(false)} />
          </div>
        )}

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
