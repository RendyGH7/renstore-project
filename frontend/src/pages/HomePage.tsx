import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Headphones,
  Laptop,
  Smartphone,
  Tv,
  Gamepad2,
  Watch,
  Speaker,
  Sparkles
} from 'lucide-react';
import api from '../api/axios';
import { Product, Category, PaginatedResponse, ApiResponse } from '../types';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedPage from '../components/AnimatedPage';
import { useLocale } from '../contexts/LocaleContext';

interface HeroSlide {
  id: number;
  badgePercent: string;
  badgeText: string;
  badgeSub: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  buttonText: string;
  buttonTextEn: string;
  link: string;
  image: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badgePercent: '30%',
    badgeText: 'SALE',
    badgeSub: 'OFF',
    title: 'True Wireless Noise Cancelling Headphone',
    titleEn: 'True Wireless Noise Cancelling Headphones',
    description: 'Pengalaman audio spasial definisi tinggi dengan peredam kebisingan aktif adaptif dan daya tahan baterai hingga 40 jam.',
    descriptionEn: 'High-definition spatial audio with adaptive active noise cancellation and up to 40 hours of extended battery life.',
    buttonText: 'Belanja Sekarang',
    buttonTextEn: 'Shop Now',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop',
    alt: 'Sony WH-1000XM5 Headphone',
  },
  {
    id: 2,
    badgePercent: 'NEW',
    badgeText: 'WATCH',
    badgeSub: 'GEN-9',
    title: 'Next-Gen Retina Smartwatch Midnight',
    titleEn: 'Next-Gen Retina Smartwatch Midnight',
    description: 'Sensor kesehatan mutakhir, pelacakan olahraga presisi, dan layar Always-On Retina ultra terang berbalut aluminium elegan.',
    descriptionEn: 'Cutting-edge health sensors, precision sports tracking, and ultra-bright Always-On Retina display wrapped in sleek aluminium.',
    buttonText: 'Jelajahi Smartwatch',
    buttonTextEn: 'Explore Smartwatch',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop',
    alt: 'Apple Watch Series 9',
  },
  {
    id: 3,
    badgePercent: 'HOT',
    badgeText: 'RETRO',
    badgeSub: 'OG',
    title: 'Air Jordan 1 High Heritage Edition',
    titleEn: 'Air Jordan 1 High Heritage Edition',
    description: 'Siluet legendaris berbalut material kulit autentik premium dan bantalan Air-Sole untuk kenyamanan sepanjang hari.',
    descriptionEn: 'Iconic legendary silhouette crafted with authentic premium leather and signature Air-Sole cushioning for all-day comfort.',
    buttonText: 'Beli Sneakers',
    buttonTextEn: 'Shop Sneakers',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    alt: 'Nike Air Jordan 1 Retro',
  },
  {
    id: 4,
    badgePercent: '20%',
    badgeText: 'PRO',
    badgeSub: 'KEYS',
    title: 'Wireless Custom Mechanical Keyboard',
    titleEn: 'Wireless Custom Mechanical Keyboard',
    description: 'Switch kustom responsif dengan programmable RGB dan konektivitas multi-device untuk pengalaman mengetik superior.',
    descriptionEn: 'Ultra-responsive switches with customizable RGB backlighting and seamless multi-device connectivity for superior typing.',
    buttonText: 'Lihat Keyboard',
    buttonTextEn: 'View Keyboard',
    link: '/products',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=800&auto=format&fit=crop',
    alt: 'Keychron K2 Pro Mechanical Keyboard',
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.1, ease: 'easeOut' as const },
  }),
};

export const HomePage: React.FC = () => {
  const { language, formatPrice, t } = useLocale();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<number | null>(null);

  // Auto-play timer (every 4.5 seconds)
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const goToSlide = (idx: number) => {
    setDirection(idx > currentSlide ? 1 : -1);
    setCurrentSlide(idx);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get<PaginatedResponse<Product>>('/products', { params: { per_page: 8, sort: 'latest' } }),
          api.get<ApiResponse<Category[]>>('/categories')
        ]);

        if (prodRes.data?.data) {
          setFeaturedProducts(prodRes.data.data);
        }
        if (catRes.data?.data) {
          setCategories(catRes.data.data);
        }
      } catch {
        // Ignored
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'televisions':
        return <Tv className="w-6 h-6 text-blue-600" />;
      case 'laptop-pc':
        return <Laptop className="w-6 h-6 text-indigo-600" />;
      case 'mobile-tablets':
        return <Smartphone className="w-6 h-6 text-purple-600" />;
      case 'games-videos':
        return <Gamepad2 className="w-6 h-6 text-rose-600" />;
      case 'home-appliances':
        return <Speaker className="w-6 h-6 text-amber-600" />;
      case 'health-sports':
        return <ShoppingBag className="w-6 h-6 text-emerald-600" />;
      case 'watches':
        return <Watch className="w-6 h-6 text-cyan-600" />;
      default:
        return <Headphones className="w-6 h-6 text-blue-600" />;
    }
  };

  // Slide Animation Variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 280, damping: 28 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 280, damping: 28 },
        opacity: { duration: 0.25 },
      },
    }),
  };

  return (
    <AnimatedPage>
      <div className="space-y-14 pb-16">
        {/* Top Feature Grid */}
        <motion.section
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Left Column: Interactive Smooth Auto-Slide Hero Banner */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="lg:col-span-8 bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]/70 border border-slate-200/80 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[390px] sm:min-h-[430px] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Animated Slide Content */}
            <div className="relative flex-1 flex flex-col justify-center z-10">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full relative"
                >
                  {(() => {
                    const slide = HERO_SLIDES[currentSlide];
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center min-h-[300px]">
                        {/* Left Column: Badges, Title, Description, Button */}
                        <div className="md:col-span-7 flex flex-col justify-center space-y-4 pr-0 md:pr-4 z-10">
                          {/* Discount Badge */}
                          <div className="inline-flex items-center gap-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center font-black text-[11px] leading-tight shadow-md shadow-blue-600/30">
                              <span>{slide.badgePercent}</span>
                              <span className="text-[8px] tracking-tighter opacity-90">{slide.badgeSub}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white/90 backdrop-blur-md border border-slate-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
                              {t('hero_tag')}
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div className="space-y-2.5">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                              {language === 'en' ? slide.titleEn : slide.title}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                              {language === 'en' ? slide.descriptionEn : slide.description}
                            </p>
                          </div>

                          {/* Action Link */}
                          <div className="pt-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                              <Link
                                to={slide.link}
                                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-2"
                              >
                                {language === 'en' ? slide.buttonTextEn : slide.buttonText}
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </motion.div>
                          </div>
                        </div>

                        {/* Right Column: Floating Product Showcase Box */}
                        <div className="md:col-span-5 flex items-center justify-center">
                          <motion.div
                            className="relative w-full max-w-[260px] aspect-square rounded-3xl overflow-hidden bg-white/80 border border-white/90 shadow-lg shadow-slate-900/5 p-4 flex items-center justify-center animate-float backdrop-blur-xs"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                          >
                            <img
                              src={slide.image}
                              alt={slide.alt}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          </motion.div>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slider Controls Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200/60 z-10">
              {/* Indicator Pills */}
              <div className="flex items-center gap-1.5">
                {HERO_SLIDES.map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                      ? 'w-8 bg-blue-600 shadow-xs'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={prevSlide}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-all shadow-2xs border border-slate-200/80"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={nextSlide}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition-all shadow-2xs border border-slate-200/80"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 2 Stacked Modern Promo Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Card 1: iPhone 16 Pro */}
            <motion.div variants={fadeUp} custom={1}>
              <Link
                to="/products"
                className="group bg-white border border-slate-200/80 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between shadow-xs hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 block"
              >
                <div className="space-y-2 max-w-[170px] z-10">
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">
                    {t('promo_title')}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    iPhone 16 Pro &amp; Pro Max
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-black text-blue-600">{formatPrice(21999000)}</span>
                    <span className="text-[11px] text-slate-400 line-through">{formatPrice(24999000)}</span>
                  </div>
                </div>

                <motion.div
                  className="w-28 h-28 shrink-0 relative flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=600&auto=format&fit=crop"
                    alt="iPhone 16 Pro"
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                  />
                </motion.div>
              </Link>
            </motion.div>

            {/* Card 2: MacBook Pro M4 */}
            <motion.div variants={fadeUp} custom={2}>
              <Link
                to="/products"
                className="group bg-white border border-slate-200/80 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between shadow-xs hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 block"
              >
                <div className="space-y-2 max-w-[170px] z-10">
                  <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block">
                    {t('save_up_to')} {formatPrice(1500000)}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    MacBook Pro M4 Chip
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    14-core CPU • 10-core GPU
                  </p>
                  <div className="pt-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {t('promo_code')}: RENM4
                    </span>
                  </div>
                </div>

                <motion.div
                  className="w-28 h-28 shrink-0 relative flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop"
                    alt="MacBook Pro M4"
                    className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm"
                  />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Browse by Category */}
        <motion.section
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('categories')}
              </h2>

            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              {t('browse_all_products')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {/* Circular Categories Row */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
            {(categories.length > 0
              ? categories
              : [
                { id: 1, name: 'Televisions', slug: 'televisions', image: null, products_count: 0 },
                { id: 2, name: 'Laptop & PC', slug: 'laptop-pc', image: null, products_count: 0 },
                { id: 3, name: 'Mobile & Tablets', slug: 'mobile-tablets', image: null, products_count: 0 },
                { id: 4, name: 'Games & Videos', slug: 'games-videos', image: null, products_count: 0 },
                { id: 5, name: 'Home Appliances', slug: 'home-appliances', image: null, products_count: 0 },
                { id: 6, name: 'Health & Sports', slug: 'health-sports', image: null, products_count: 0 },
                { id: 7, name: 'Watches', slug: 'watches', image: null, products_count: 0 },
              ] as Category[]
            ).map((cat, idx) => (
              <motion.div
                key={cat.id}
                variants={fadeUp}
                custom={idx}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <Link
                  to={`/products?category_slug=${cat.slug}`}
                  className="group flex flex-col items-center text-center space-y-2.5"
                >
                  <motion.div
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-50 group-hover:bg-blue-50/80 border border-slate-200/80 group-hover:border-blue-500/50 flex items-center justify-center p-3 shadow-2xs transition-all duration-300 group-hover:shadow-md group-hover:shadow-blue-500/10"
                    whileHover={{ scale: 1.05 }}
                  >
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    ) : (
                      getCategoryIcon(cat.slug)
                    )}
                  </motion.div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {cat.products_count ?? 0} {language === 'en' ? 'Products' : 'Produk'}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Featured / Latest Products Section */}
        <motion.section
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('featured_products')}
              </h2>

            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              {t('browse_all_products')}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          {isLoading ? (
            <SkeletonLoader count={8} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </motion.section>

        {/* High-Converting VIP Showcase / Promo Banner */}
        <motion.section
          className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white relative overflow-hidden shadow-xl shadow-blue-600/20"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-wider text-cyan-200 border border-white/20">
                <Sparkles className="w-3.5 h-3.5" />
                {language === 'en' ? 'Exclusive Member Perks' : 'Keuntungan Eksklusif Pelanggan'}
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {language === 'en'
                  ? 'Upgrade Your Lifestyle with Authentic Next-Gen Tech'
                  : 'Tingkatkan Gaya Hidup dengan Gadget Mutakhir & Bergaransi'}
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed max-w-xl">
                {language === 'en'
                  ? 'Experience instant delivery, official manufacturer warranty, and bank-grade QRIS payment protection.'
                  : 'Nikmati pengiriman instan, garansi resmi pabrikan, dan proteksi pembayaran QRIS terenkripsi.'}
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/products"
                className="px-8 py-4 rounded-2xl bg-white text-blue-600 hover:bg-blue-50 text-xs font-black tracking-wider uppercase shrink-0 transition-all shadow-xl shadow-slate-900/15 inline-flex items-center gap-2"
              >
                {t('explore_catalog')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </AnimatedPage>
  );
};

export default HomePage;
