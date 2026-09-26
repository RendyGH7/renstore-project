import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Check,
  Copy,
  X,
  UserCheck,
  UserPlus,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../contexts/LocaleContext';
import api from '../api/axios';

interface VoucherClaimResult {
  is_registered: boolean;
  message: string;
  user?: {
    name: string;
    email: string;
  };
  voucher?: {
    code: string;
    title: string;
    discount_text: string;
    discount_percent: number;
    max_discount: number;
    min_spend: number;
    description: string;
    badge: string;
  };
}

export const Footer: React.FC = () => {
  const { language, t } = useLocale();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'already_claimed' | 'not_registered' | null>(null);
  const [claimResult, setClaimResult] = useState<VoucherClaimResult | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setIsSubmitting(true);
    setSubmittedEmail(cleanEmail);

    try {
      const res = await api.post('/newsletter/claim-voucher', {
        email: cleanEmail,
      });

      if (res.data?.status && res.data?.voucher) {
        setClaimResult(res.data);
        setModalType('success');
        setIsModalOpen(true);
      }
    } catch (err: any) {
      const resp = err.response?.data;
      const code = resp?.code;

      if (code === 'ALREADY_CLAIMED') {
        setModalType('already_claimed');
        setIsModalOpen(true);
      } else if (code === 'EMAIL_NOT_REGISTERED' || err.response?.status === 404) {
        setModalType('not_registered');
        setIsModalOpen(true);
      } else {
        setModalType('already_claimed');
        setIsModalOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyVoucher = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const featureCards = [
    {
      id: 'shipping',
      icon: Truck,
      iconColor: 'text-blue-600',
      lightBg: 'bg-blue-50',
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
      iconColor: 'text-emerald-600',
      lightBg: 'bg-emerald-50',
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
      iconColor: 'text-violet-600',
      lightBg: 'bg-violet-50',
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
      <div className="border-b border-slate-100 py-8 sm:py-10 bg-slate-50/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featureCards.map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.id}
                  className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300/90 shadow-2xs hover:shadow-md transition-all duration-200 ease-out transform-gpu hover:-translate-y-1 flex flex-col justify-between cursor-default"
                >
                  {/* Top Header with Icon & Pill Badge */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className={`w-10 h-10 rounded-xl ${card.lightBg} flex items-center justify-center ${card.iconColor} group-hover:scale-105 transition-transform duration-200 ease-out`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-150">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  {/* Bottom Guarantee Line */}
                  <div className="mt-4 pt-3 border-t border-slate-100/90 flex items-center justify-between text-[11px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors duration-150">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {language === 'en' ? 'Verified Guarantee' : 'Jaminan Resmi Terverifikasi'}
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Col 1: Brand & Tagline & Newsletter */}
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
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="animate-spin text-xs">⏳</span>
                ) : (
                  <>
                    <span>{language === 'en' ? 'Claim' : 'Kirim'}</span>
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

      {/* Animated Voucher Popup Modal rendered via Portal to sit above Navbar & entire viewport */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isModalOpen && claimResult && (
            <div 
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsModalOpen(false);
              }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 25 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 25 }}
                transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden text-center space-y-5"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* MODAL CASE 1: SUCCESS VIP VOUCHER */}
                {modalType === 'success' && claimResult?.voucher && (
                  <>
                    {/* Animated Top Icon */}
                    <div className="relative inline-block mx-auto pt-2">
                      <motion.div
                        initial={{ rotate: -15, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.1 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md bg-blue-600 text-white shadow-blue-600/30"
                      >
                        <UserCheck className="w-8 h-8" />
                      </motion.div>

                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 p-1 rounded-full shadow-xs"
                      >
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                    </div>

                    {/* Title & Personalized Greeting */}
                    <div className="space-y-1.5">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        {claimResult.voucher.badge}
                      </span>

                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Halo, {claimResult.user?.name || 'Member'}!
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                        Email Anda terverifikasi sebagai member resmi RENSTORE. Ini voucher eksklusif VIP untuk Anda (1x klaim per akun):
                      </p>
                    </div>

                    {/* Realistic Animated Voucher Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="relative bg-slate-50 border-2 border-dashed border-blue-300 rounded-2xl p-4.5 space-y-3 overflow-hidden text-left"
                    >
                      {/* Left & Right Notch Cutouts for Ticket Effect */}
                      <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-r border-blue-200" />
                      <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-l border-blue-200" />

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                            Potongan Harga
                          </span>
                          <span className="text-base font-black text-blue-600 block">
                            {claimResult.voucher.discount_text}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs font-mono">
                          {claimResult.voucher.code}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {claimResult.voucher.description}
                      </p>

                      {/* Copy Voucher Action Bar */}
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400">Kode Promo:</span>
                        <button
                          type="button"
                          onClick={() => handleCopyVoucher(claimResult.voucher!.code)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                        >
                          {copiedCode ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-blue-600" />
                              <span>Salin Kode</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>

                    {/* Action Button */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate('/products');
                        }}
                        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Belanja &amp; Gunakan Voucher Sekarang</span>
                      </button>
                    </div>
                  </>
                )}

                {/* MODAL CASE 2: ALREADY CLAIMED (1 EMAIL = 1 VOUCHER) */}
                {modalType === 'already_claimed' && (
                  <div className="space-y-4 py-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs">
                      <ShieldAlert className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                        VOUCHER SUDAH PERNAH DIKLAIM
                      </span>

                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Klaim Voucher Dibatasi
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                        Email <strong className="text-slate-800 font-bold">{submittedEmail}</strong> sudah pernah mendapatkan voucher promo sebelumnya. Setiap 1 akun email yang terdaftar hanya berhak mengklaim 1 voucher.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-500 space-y-1">
                      <div className="font-bold text-slate-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        Ingin Mendapatkan Voucher Baru?
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Silakan gunakan akun member dengan email lain yang belum pernah mengklaim voucher untuk mendapatkan promo eksklusif kembali.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Mengerti, Tutup
                    </button>
                  </div>
                )}

                {/* MODAL CASE 3: EMAIL NOT REGISTERED */}
                {modalType === 'not_registered' && (
                  <div className="space-y-4 py-2">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-blue-50 text-blue-600 border border-blue-200 shadow-2xs">
                      <UserPlus className="w-8 h-8" />
                    </div>

                    <div className="space-y-2">
                      <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        EMAIL BELUM TERDAFTAR
                      </span>

                      <h3 className="text-xl font-black text-slate-900 tracking-tight">
                        Daftar Akun Member Dahulu
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                        Email <strong className="text-slate-800 font-bold">{submittedEmail}</strong> belum terdaftar sebagai akun di RENSTORE. Daftarkan akun baru Anda untuk langsung mengklaim Voucher Diskon 50% VIP!
                      </p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate('/register', { state: { email: submittedEmail } });
                        }}
                        className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Daftar Akun Baru Sekarang</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.footer>
  );
};

export default Footer;
