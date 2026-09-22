import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '../contexts/LocaleContext';

export const Footer: React.FC = () => {
  const { language, t } = useLocale();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setIsSubscribed(false);
      }, 3000);
    }
  };

  const featureCards = [
    {
      id: 'shipping',
      icon: Truck,
      gradientBg: 'from-blue-600 to-cyan-500',
      iconColor: 'text-blue-600',
      lightBg: 'bg-blue-50/70',
      borderColor: 'border-blue-200/80 hover:border-blue-500/50',
      glowColor: 'group-hover:shadow-[0_12px_30px_-8px_rgba(37,99,235,0.22)]',
      badge: language === 'en' ? 'Express Delivery' : 'Pengiriman Cepat',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200/80',
      title: t('feature_shipping_title'),
      desc: language === 'en' 
        ? 'Fully insured priority transit with live tracking across Indonesia.'
        : 'Asuransi pengiriman penuh & pelacakan live ke seluruh wilayah Indonesia.',
    },
    {
      id: 'warranty',
      icon: ShieldCheck,
      gradientBg: 'from-emerald-600 to-teal-500',
      iconColor: 'text-emerald-600',
      lightBg: 'bg-emerald-50/70',
      borderColor: 'border-emerald-200/80 hover:border-emerald-500/50',
      glowColor: 'group-hover:shadow-[0_12px_30px_-8px_rgba(16,185,129,0.22)]',
      badge: language === 'en' ? '2-Year Warranty' : 'Garansi Resmi 2 Thn',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      title: t('feature_warranty_title'),
      desc: language === 'en'
        ? '100% genuine factory sealed products with official brand warranty.'
        : '100% produk segel original resmi dengan jaminan klaim garansi mudah.',
    },
    {
      id: 'payment',
      icon: Lock,
      gradientBg: 'from-violet-600 to-indigo-500',
      iconColor: 'text-violet-600',
      lightBg: 'bg-violet-50/70',
      borderColor: 'border-violet-200/80 hover:border-violet-500/50',
      glowColor: 'group-hover:shadow-[0_12px_30px_-8px_rgba(139,92,246,0.22)]',
      badge: language === 'en' ? '256-Bit SSL Encrypted' : 'Enkripsi Bank-Grade',
      badgeColor: 'bg-violet-50 text-violet-700 border-violet-200/80',
      title: t('footer_secure_payment'),
      desc: language === 'en'
        ? 'Encrypted checkout powered by Xendit Dynamic QRIS & Bank Gateway.'
        : 'Sistem checkout terproteksi didukung gateway resmi Xendit & QRIS.',
    },
  ];

  return (
    <motion.footer
      className="relative z-10 border-t border-slate-200 bg-white text-slate-600"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      {/* Elevated Interactive Value Proposition Highlights Section */}
      <div className="border-b border-slate-100 py-10 sm:py-12 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/40 relative overflow-hidden">
        {/* Subtle Decorative Ambient Background Shapes */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card, idx) => {
              const IconComp = card.icon;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.1 }}
                  whileHover={{ y: -6, scale: 1.015 }}
                  className={`group relative p-6 rounded-3xl bg-white border ${card.borderColor} shadow-xs ${card.glowColor} transition-all duration-300 flex flex-col justify-between`}
                >
                  {/* Top Header with Glowing Icon & Pill Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                      {/* Pulse Glow behind Icon */}
                      <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${card.gradientBg} opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300`} />
                      <div className={`relative w-12 h-12 rounded-2xl ${card.lightBg} border border-slate-200/60 flex items-center justify-center ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor} shadow-2xs`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Bottom Hover Accent Line */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {language === 'en' ? 'Verified Guarantee' : 'Jaminan Resmi Terverifikasi'}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Col 1: Brand & Tagline */}
        <div className="md:col-span-4 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight block leading-none">RENSTORE</span>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">Tech &amp; Lifestyle Hub</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            {t('footer_tagline')}
          </p>

          {/* Newsletter Input Bar */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              {language === 'en' ? 'Get Exclusive Discounts' : 'Dapatkan Promo & Diskon Eksklusif'}
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'en' ? 'Enter your email address...' : 'Masukkan email Anda...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/15 transition-all shadow-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1"
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {language === 'en' ? 'Joined!' : 'Terdaftar!'}
                  </>
                ) : (
                  <>
                    {language === 'en' ? 'Subscribe' : 'Kirim'}
                    <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Col 2: Product Catalog */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{t('catalog')}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/products" className="hover:text-blue-600 transition-colors">{t('all_products')}</Link></li>
            <li><Link to="/products?category_slug=laptop-pc" className="hover:text-blue-600 transition-colors">Laptop &amp; PC</Link></li>
            <li><Link to="/products?category_slug=mobile-tablets" className="hover:text-blue-600 transition-colors">Mobile &amp; Tablets</Link></li>
            <li><Link to="/products?category_slug=games-videos" className="hover:text-blue-600 transition-colors">Gaming &amp; Console</Link></li>
            <li><Link to="/products?category_slug=watches" className="hover:text-blue-600 transition-colors">Smartwatches</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Service */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{t('footer_customer_service')}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/cart" className="hover:text-blue-600 transition-colors">{t('shopping_cart')}</Link></li>
            <li><Link to="/orders" className="hover:text-blue-600 transition-colors">{t('track_orders')}</Link></li>
            <li><Link to="/login" className="hover:text-blue-600 transition-colors">{t('login')}</Link></li>
            <li><Link to="/register" className="hover:text-blue-600 transition-colors">{t('register')}</Link></li>
          </ul>
        </div>

        {/* Col 4: Official Payment & Security */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            {language === 'en' ? 'Payment & Security' : 'Keamanan & Pembayaran'}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {language === 'en' 
              ? 'Multi-channel dynamic payment gateway with instant QRIS verification.'
              : 'Pembayaran instan terverifikasi melalui gateway resmi nasional.'}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
              QRIS
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
              Xendit
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
              GoPay / OVO
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
              Bank Transfer
            </span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-slate-100 py-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© 2026 RENSTORE E-Commerce Platform. {t('footer_rights')}</p>
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 inline" />
            <span>Modern Aesthetic • Fast • Secure</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
