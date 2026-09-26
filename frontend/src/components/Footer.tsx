import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  CheckCircle2, 
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

  return (
    <motion.footer
      className="relative z-10 border-t border-slate-200 bg-white text-slate-600"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
    >
      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Col 1: Brand & Tagline & Newsletter */}
        <div className="md:col-span-4 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group inline-flex">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
              RENSTORE
            </span>
          </Link>
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
            <li><Link to="/products?category_slug=laptops-computers" className="hover:text-blue-600 transition-colors">Laptop &amp; PC</Link></li>
            <li><Link to="/products?category_slug=electronics-gadgets" className="hover:text-blue-600 transition-colors">Gadgets &amp; Phones</Link></li>
            <li><Link to="/products?category_slug=gaming-consoles" className="hover:text-blue-600 transition-colors">Gaming &amp; Console</Link></li>
            <li><Link to="/products?category_slug=smartwatches-wearables" className="hover:text-blue-600 transition-colors">Smartwatches</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Service */}
        <div className="md:col-span-2 space-y-3">
          <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">{t('footer_customer_service')}</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/cart" className="hover:text-blue-600 transition-colors">{t('shopping_cart')}</Link></li>
            <li><Link to="/orders" className="hover:text-blue-600 transition-colors">{t('track_orders')}</Link></li>
            <li><Link to="/blogs" className="hover:text-blue-600 transition-colors">{t('blogs')}</Link></li>
            <li><Link to="/login" className="hover:text-blue-600 transition-colors">{t('login')}</Link></li>
            <li><Link to="/register" className="hover:text-blue-600 transition-colors">{t('register')}</Link></li>
          </ul>
        </div>

        {/* Col 4: Experience on Mobile (Get the App) & Payment */}
        <div className="md:col-span-4 space-y-4">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-1.5">
              {language === 'en' ? 'Get the App' : 'Unduh Aplikasi Renstore'}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              {language === 'en' 
                ? 'Experience ultra-fast checkout and real-time shipment tracking on iOS & Android.'
                : 'Nikmati kemudahan belanja instan dan pelacakan pesanan live di iOS & Android.'}
            </p>

            {/* App Store & Google Play Professional Badges */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5">
              {/* Apple App Store */}
              <a
                href="#app-store"
                onClick={(e) => e.preventDefault()}
                className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer border border-slate-800 flex-1"
              >
                <svg className="w-5 h-5 fill-current shrink-0 text-white group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.77 1.06-1.84.94-2.91-.91.04-2.02.61-2.67 1.38-.58.67-1.09 1.76-.95 2.8.01 0 .02 0 .03 0 1.02 0 2.02-.5 2.65-1.27z"/>
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 block font-medium uppercase tracking-wider mb-0.5">Download on the</span>
                  <span className="text-xs font-bold text-white tracking-tight">App Store</span>
                </div>
              </a>

              {/* Google Play Store */}
              <a
                href="#google-play"
                onClick={(e) => e.preventDefault()}
                className="group flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer border border-slate-800 flex-1"
              >
                <svg className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M3.609 1.814L13.792 12 3.61 22.186c-.368-.344-.61-.83-.61-1.386V3.2c0-.556.242-1.042.609-1.386z"/>
                  <path fill="#34A853" d="M14.847 13.055l-2.056-2.056 2.056-2.055 2.42 2.42-2.42 1.691z"/>
                  <path fill="#FBBC05" d="M3.609 22.186l10.183-10.186 2.42 2.42-11.8 6.743c-.265-.152-.524-.49-.803-.977z"/>
                  <path fill="#EA4335" d="M3.609 1.814c.279-.487.538-.825.803-.977l11.8 6.743-2.42 2.42L3.609 1.814z"/>
                </svg>
                <div className="text-left leading-none">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 block font-medium uppercase tracking-wider mb-0.5">GET IT ON</span>
                  <span className="text-xs font-bold text-white tracking-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Secure Payment Badges */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              {language === 'en' ? 'Supported Payment & Gateways' : 'Metode Pembayaran Resmi'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                QRIS
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                Xendit
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                BCA / Mandiri
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                GoPay / OVO
              </span>
            </div>
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
