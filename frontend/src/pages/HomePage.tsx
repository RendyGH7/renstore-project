import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Sparkles,
  Flame,
  Clock,
  Zap,
  Newspaper,
  Calendar,
  Camera,
  Shirt,
  Footprints,
  Glasses,
  Home as HomeIcon,
  Dumbbell
} from 'lucide-react';
import api from '../api/axios';
import { Product, Category, PaginatedResponse, ApiResponse } from '../types';
import { BLOG_POSTS } from '../data/blogData';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedPage from '../components/AnimatedPage';
import { useLocale } from '../contexts/LocaleContext';
import { useAuth } from '../contexts/AuthContext';

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
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const HomePage: React.FC = () => {
  const { language, formatPrice, t } = useLocale();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<number | null>(null);

  // Real Indonesian Time (WIB) Flash Sale Countdown State
  const [flashCountdown, setFlashCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateWibCountdown = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const wib = new Date(utc + 7 * 3600000);
      const hours = wib.getHours();
      const minutes = wib.getMinutes();
      const seconds = wib.getSeconds();

      let targetEndHour = 12;
      if (hours >= 12 && hours < 18) {
        targetEndHour = 18;
      } else if (hours >= 18) {
        targetEndHour = 24;
      }

      const totalCurrentSec = hours * 3600 + minutes * 60 + seconds;
      const totalTargetSec = targetEndHour * 3600;
      const diffSec = Math.max(0, totalTargetSec - totalCurrentSec);

      setFlashCountdown({
        hours: Math.floor(diffSec / 3600),
        minutes: Math.floor((diffSec % 3600) / 60),
        seconds: diffSec % 60,
      });
    };

    updateWibCountdown();
    const timer = setInterval(updateWibCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-play timer (every 5 seconds)
  useEffect(() => {
    if (isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);

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
        const [prodRes, catRes] = await Promise.allSettled([
          api.get<PaginatedResponse<Product>>('/products', { params: { per_page: 8, sort: 'latest' } }),
          api.get<ApiResponse<Category[]>>('/categories')
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.data?.data && prodRes.value.data.data.length > 0) {
          setFeaturedProducts(prodRes.value.data.data);
        } else {
          setFeaturedProducts(MOCK_PRODUCTS);
        }

        if (catRes.status === 'fulfilled' && catRes.value.data?.data && catRes.value.data.data.length > 0) {
          setCategories(catRes.value.data.data);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      } catch {
        setFeaturedProducts(MOCK_PRODUCTS);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDirectBuy = (prod: Product, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/checkout?direct=1&product_id=${prod.id}&quantity=1`)}`);
      return;
    }
    navigate(`/checkout?direct=1&product_id=${prod.id}&quantity=1`);
  };

  const prioritySlugs = [
    'electronics-gadgets',
    'laptops-computers',
    'audio-headphones',
    'gaming-consoles',
    'fashion-apparel',
    'footwear-sneakers',
  ];

  const displayCategories = React.useMemo(() => {
    if (categories.length === 0) {
      return [
        { id: 1, name: 'Electronics & Gadgets', slug: 'electronics-gadgets', image: null, products_count: 0 },
        { id: 2, name: 'Laptops & Computers', slug: 'laptops-computers', image: null, products_count: 0 },
        { id: 3, name: 'Audio & Sound', slug: 'audio-headphones', image: null, products_count: 0 },
        { id: 4, name: 'Gaming & Consoles', slug: 'gaming-consoles', image: null, products_count: 0 },
        { id: 5, name: 'Fashion & Apparel', slug: 'fashion-apparel', image: null, products_count: 0 },
        { id: 6, name: 'Footwear & Sneakers', slug: 'footwear-sneakers', image: null, products_count: 0 },
      ] as Category[];
    }

    const prioritized = [...categories].sort((a, b) => {
      const idxA = prioritySlugs.indexOf(a.slug);
      const idxB = prioritySlugs.indexOf(b.slug);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });

    return prioritized.slice(0, 6);
  }, [categories]);

  const getCategoryDetails = (slug: string) => {
    switch (slug) {
      case 'electronics-gadgets':
      case 'mobile-tablets':
        return {
          icon: <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-blue-500/10 to-cyan-500/10 group-hover:from-blue-600 group-hover:to-cyan-600',
          text: 'text-blue-600 group-hover:text-white',
          border: 'border-blue-200/60 group-hover:border-blue-600',
          glow: 'group-hover:shadow-blue-500/20',
        };
      case 'laptops-computers':
      case 'laptop-pc':
        return {
          icon: <Laptop className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-indigo-500/10 to-violet-500/10 group-hover:from-indigo-600 group-hover:to-violet-600',
          text: 'text-indigo-600 group-hover:text-white',
          border: 'border-indigo-200/60 group-hover:border-indigo-600',
          glow: 'group-hover:shadow-indigo-500/20',
        };
      case 'audio-headphones':
        return {
          icon: <Headphones className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-purple-500/10 to-fuchsia-500/10 group-hover:from-purple-600 group-hover:to-fuchsia-600',
          text: 'text-purple-600 group-hover:text-white',
          border: 'border-purple-200/60 group-hover:border-purple-600',
          glow: 'group-hover:shadow-purple-500/20',
        };
      case 'gaming-consoles':
      case 'games-videos':
        return {
          icon: <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-rose-500/10 to-pink-500/10 group-hover:from-rose-600 group-hover:to-pink-600',
          text: 'text-rose-600 group-hover:text-white',
          border: 'border-rose-200/60 group-hover:border-rose-600',
          glow: 'group-hover:shadow-rose-500/20',
        };
      case 'smartwatches-wearables':
      case 'watches':
        return {
          icon: <Watch className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-cyan-500/10 to-teal-500/10 group-hover:from-cyan-600 group-hover:to-teal-600',
          text: 'text-cyan-600 group-hover:text-white',
          border: 'border-cyan-200/60 group-hover:border-cyan-600',
          glow: 'group-hover:shadow-cyan-500/20',
        };
      case 'cameras-photography':
        return {
          icon: <Camera className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-amber-500/10 to-orange-500/10 group-hover:from-amber-600 group-hover:to-orange-600',
          text: 'text-amber-600 group-hover:text-white',
          border: 'border-amber-200/60 group-hover:border-amber-600',
          glow: 'group-hover:shadow-amber-500/20',
        };
      case 'fashion-apparel':
        return {
          icon: <Shirt className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-emerald-500/10 to-teal-500/10 group-hover:from-emerald-600 group-hover:to-teal-600',
          text: 'text-emerald-600 group-hover:text-white',
          border: 'border-emerald-200/60 group-hover:border-emerald-600',
          glow: 'group-hover:shadow-emerald-500/20',
        };
      case 'footwear-sneakers':
        return {
          icon: <Footprints className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-sky-500/10 to-blue-500/10 group-hover:from-sky-600 group-hover:to-blue-600',
          text: 'text-sky-600 group-hover:text-white',
          border: 'border-sky-200/60 group-hover:border-sky-600',
          glow: 'group-hover:shadow-sky-500/20',
        };
      case 'accessories-watches':
        return {
          icon: <Glasses className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-amber-500/10 to-yellow-500/10 group-hover:from-amber-600 group-hover:to-yellow-600',
          text: 'text-amber-600 group-hover:text-white',
          border: 'border-amber-200/60 group-hover:border-amber-600',
          glow: 'group-hover:shadow-amber-500/20',
        };
      case 'home-living':
      case 'home-appliances':
        return {
          icon: <HomeIcon className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-orange-500/10 to-red-500/10 group-hover:from-orange-600 group-hover:to-red-600',
          text: 'text-orange-600 group-hover:text-white',
          border: 'border-orange-200/60 group-hover:border-orange-600',
          glow: 'group-hover:shadow-orange-500/20',
        };
      case 'health-sports':
        return {
          icon: <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-red-500/10 to-rose-500/10 group-hover:from-red-600 group-hover:to-rose-600',
          text: 'text-red-600 group-hover:text-white',
          border: 'border-red-200/60 group-hover:border-red-600',
          glow: 'group-hover:shadow-red-500/20',
        };
      case 'beauty-care':
        return {
          icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-pink-500/10 to-purple-500/10 group-hover:from-pink-600 group-hover:to-purple-600',
          text: 'text-pink-600 group-hover:text-white',
          border: 'border-pink-200/60 group-hover:border-pink-600',
          glow: 'group-hover:shadow-pink-500/20',
        };
      case 'televisions':
        return {
          icon: <Tv className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-blue-500/10 to-indigo-500/10 group-hover:from-blue-600 group-hover:to-indigo-600',
          text: 'text-blue-600 group-hover:text-white',
          border: 'border-blue-200/60 group-hover:border-blue-600',
          glow: 'group-hover:shadow-blue-500/20',
        };
      default:
        return {
          icon: <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />,
          bg: 'from-slate-500/10 to-slate-600/10 group-hover:from-blue-600 group-hover:to-blue-700',
          text: 'text-slate-600 group-hover:text-white',
          border: 'border-slate-200/60 group-hover:border-blue-600',
          glow: 'group-hover:shadow-blue-500/20',
        };
    }
  };

  // Ultra-Smooth Fluid Slide Animation Variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 180, damping: 24, mass: 0.8 },
        opacity: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.97,
      transition: {
        x: { type: 'spring', stiffness: 200, damping: 26, mass: 0.8 },
        opacity: { duration: 0.3, ease: 'easeInOut' },
        scale: { duration: 0.3, ease: 'easeInOut' },
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
          {/* Left Column: Interactive Smooth Auto-Slide Hero Banner (Glassmorphic) */}
          <motion.div
            variants={fadeUp}
            custom={0}
            className="lg:col-span-8 bg-white/30 hover:bg-white/40 backdrop-blur-2xl backdrop-saturate-180 border border-white/70 rounded-3xl p-6 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[390px] sm:min-h-[430px] shadow-[0_12px_40px_rgba(30,58,138,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Top Specular Sheen Line */}
            <div className="absolute top-0 inset-x-12 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br from-blue-400/25 via-cyan-300/20 to-transparent rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

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
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white/50 backdrop-blur-md border border-white/80 px-3.5 py-1.5 rounded-full shadow-2xs">
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
                                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-2"
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
                            className="relative w-full max-w-[260px] aspect-square rounded-3xl overflow-hidden bg-white/40 border border-white/70 shadow-lg shadow-blue-900/5 p-4 flex items-center justify-center animate-float backdrop-blur-xl"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
                          >
                            <img
                              src={slide.image}
                              alt={slide.alt}
                              className="w-full h-full object-cover rounded-2xl shadow-xs"
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
                      : 'w-2 bg-slate-300/80 hover:bg-slate-400'
                      }`}
                    whileHover={{ scale: 1.2 }}
                  />
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={prevSlide}
                  className="p-2 rounded-xl bg-white/50 hover:bg-white/80 border border-white/80 backdrop-blur-md text-slate-700 transition-all shadow-2xs"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={nextSlide}
                  className="p-2 rounded-xl bg-white/50 hover:bg-white/80 border border-white/80 backdrop-blur-md text-slate-700 transition-all shadow-2xs"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Column: 2 Stacked Modern Glassmorphic Promo Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            {/* Card 1: iPhone 16 Pro */}
            <motion.div variants={fadeUp} custom={1}>
              <Link
                to="/products"
                className="group bg-white/30 hover:bg-white/45 backdrop-blur-2xl backdrop-saturate-180 border border-white/70 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between shadow-[0_8px_30px_rgba(30,58,138,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/15 transition-all duration-300 block"
              >
                {/* Top Specular Sheen Line */}
                <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

                {/* Ambient Corner Glow */}
                <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-2 max-w-[170px] z-10">
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50/90 border border-blue-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block">
                    {t('promo_title')}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    iPhone 16 Pro &amp; Pro Max
                  </h3>
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-sm font-black text-blue-600">{formatPrice(21999000)}</span>
                    <span className="text-[11px] text-slate-400 line-through font-medium">{formatPrice(24999000)}</span>
                  </div>
                </div>

                <motion.div
                  className="w-28 h-28 shrink-0 relative flex items-center justify-center z-10"
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
                className="group bg-white/30 hover:bg-white/45 backdrop-blur-2xl backdrop-saturate-180 border border-white/70 rounded-3xl p-6 relative overflow-hidden flex items-center justify-between shadow-[0_8px_30px_rgba(30,58,138,0.06),inset_0_1px_2px_rgba(255,255,255,0.9)] hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-500/15 transition-all duration-300 block"
              >
                {/* Top Specular Sheen Line */}
                <div className="absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

                {/* Ambient Corner Glow */}
                <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-2 max-w-[170px] z-10">
                  <span className="text-[10px] font-black text-purple-600 bg-purple-50/90 border border-purple-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider inline-block">
                    {t('save_up_to')} {formatPrice(1500000)}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    MacBook Pro M4 Chip
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight font-medium">
                    14-core CPU • 10-core GPU
                  </p>
                  <div className="pt-0.5">
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/60 border border-slate-200/80 px-2 py-0.5 rounded shadow-2xs">
                      {t('promo_code')}: RENM4
                    </span>
                  </div>
                </div>

                <motion.div
                  className="w-28 h-28 shrink-0 relative flex items-center justify-center z-10"
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

        {/* Real-time Flash Sale High Energy Section */}
        <motion.section
          className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white relative overflow-hidden shadow-2xl shadow-rose-600/15 space-y-6"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45 }}
        >
          {/* Ambient Lighting Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-amber-300">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {language === 'en' ? 'Flash Sale Today' : 'Flash Sale Hari Ini'}
                </h2>
              </div>

              {/* Countdown Pills */}
              <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-2xl text-xs font-mono font-black">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-amber-300">{String(flashCountdown.hours).padStart(2, '0')}</span>
                <span>:</span>
                <span className="text-amber-300">{String(flashCountdown.minutes).padStart(2, '0')}</span>
                <span>:</span>
                <span className="text-amber-300 animate-pulse">{String(flashCountdown.seconds).padStart(2, '0')}</span>
              </div>
            </div>

            <Link
              to="/flash-sale"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white text-white hover:text-rose-600 border border-white/30 text-xs font-bold transition-all shadow-xs shrink-0 self-start md:self-auto"
            >
              <span>{language === 'en' ? 'View All Flash Deals' : 'Lihat Semua Flash Sale'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Flash Sale Product Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredProducts.slice(0, 4).map((prod, idx) => {
              const discount = [40, 35, 50, 25][idx % 4];
              const originalPrice = Math.round((prod.price / (1 - discount / 100)) / 10000) * 10000;
              const soldPercent = [82, 68, 91, 74][idx % 4];

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl p-4 text-slate-900 border border-white/40 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Image Box (Strict 1:1) */}
                    <Link to={`/products/${prod.slug}`} className="block relative aspect-square w-full bg-slate-100 rounded-xl overflow-hidden">
                      <img
                        src={prod.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600'}
                        alt={prod.name}
                        className="w-full h-full aspect-square object-cover object-center group-hover:scale-106 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600';
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-red-600 text-white font-black text-[10px] shadow-sm z-10">
                        -{discount}%
                      </span>
                    </Link>

                    {/* Title & Price */}
                    <div>
                      <Link
                        to={`/products/${prod.slug}`}
                        className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1 block"
                      >
                        {prod.name}
                      </Link>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-sm font-black text-rose-600">
                          {formatPrice(prod.price)}
                        </span>
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sold Stock Progress Bar & Direct Buy Action */}
                  <div className="mt-3 pt-2 border-t border-slate-100 space-y-2.5">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500">
                        <span className="flex items-center gap-1 text-rose-600">
                          <Zap className="w-3 h-3 text-rose-500" />
                          {language === 'en' ? `Sold ${soldPercent}%` : `Terjual ${soldPercent}%`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full"
                          style={{ width: `${soldPercent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDirectBuy(prod, e)}
                      className="w-full py-2.5 px-4 rounded-full font-black text-xs flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-700 hover:via-rose-700 hover:to-orange-600 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 active:scale-[0.98]"
                    >
                      <Zap className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
                      <span className="truncate font-extrabold">{language === 'en' ? 'Buy Now' : 'Beli Langsung'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Browse by Category */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
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
          </div>

          {/* Icon Categories Grid (Top 6 Featured Categories) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
            {displayCategories.map((cat, idx) => {
              const config = getCategoryDetails(cat.slug);
              return (
                <motion.div
                  key={cat.id || cat.slug || idx}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={`/products?category_slug=${cat.slug}`}
                    className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-3xl bg-white hover:bg-white border border-slate-200/80 hover:border-blue-400/80 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-200 ease-out h-full justify-between cursor-pointer"
                  >
                    <div className="flex flex-col items-center space-y-3 w-full">
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${config.bg} border ${config.border} flex items-center justify-center ${config.text} shadow-xs transition-all duration-200 ease-out group-hover:scale-110`}
                      >
                        {config.icon}
                      </div>

                      <div className="w-full">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-150 line-clamp-1">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          {cat.products_count ?? 0} {language === 'en' ? 'Products' : 'Produk'}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Featured / Latest Products Section */}
        <motion.section
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
              {featuredProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Latest Blogs & Tech Insights Section */}
        <motion.section
          className="space-y-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                <Newspaper className="w-3.5 h-3.5" />
                {language === 'en' ? 'Editorial Articles' : 'Artikel & Editorial'}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {language === 'en' ? 'Latest Tech Reviews & Buying Guides' : 'Ulasan Gadget & Panduan Teknologi Terbaru'}
              </h2>
            </div>
            <Link
              to="/blogs"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
            >
              <span>{language === 'en' ? 'View All Articles' : 'Lihat Semua Blog'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOG_POSTS.slice(0, 3).map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.35, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <Link to={`/blogs/${post.slug}`} className="block relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={language === 'en' ? post.titleEn : post.titleId}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-blue-600" />
                        {post.publishDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {post.readTime}
                      </span>
                    </div>

                    <Link
                      to={`/blogs/${post.slug}`}
                      className="block text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                    >
                      {language === 'en' ? post.titleEn : post.titleId}
                    </Link>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
                      {language === 'en' ? post.excerptEn : post.excerptId}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs font-bold text-slate-700">{post.author.name}</span>
                  </div>

                  <Link
                    to={`/blogs/${post.slug}`}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>{language === 'en' ? 'Read' : 'Baca'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* High-Converting VIP Showcase / Promo Banner (Crystal Glassmorphism Effect) */}
        <motion.section
          className="p-8 sm:p-12 rounded-3xl bg-white/30 hover:bg-white/40 backdrop-blur-2xl backdrop-saturate-180 border border-white/70 text-slate-900 relative overflow-hidden shadow-[0_12px_40px_rgba(30,58,138,0.08),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-300"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          {/* Specular Edge Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-20" />

          {/* Ambient Lighting Glows for rich glass reflection */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 backdrop-blur-md text-xs font-black uppercase tracking-wider text-blue-700 border border-blue-200/80 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                {language === 'en' ? 'Exclusive Member Perks' : 'Keuntungan Eksklusif Pelanggan'}
              </div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight text-slate-900">
                {language === 'en'
                  ? 'Upgrade Your Lifestyle with Authentic Next-Gen Tech'
                  : 'Tingkatkan Gaya Hidup dengan Gadget Mutakhir & Bergaransi'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-medium">
                {language === 'en'
                  ? 'Experience instant delivery, official manufacturer warranty, and bank-grade QRIS payment protection.'
                  : 'Nikmati pengiriman instan, garansi resmi pabrikan, dan proteksi pembayaran QRIS terenkripsi.'}
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/products"
                className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-black tracking-wider uppercase shrink-0 transition-all shadow-xl shadow-blue-600/25 hover:shadow-blue-600/35 inline-flex items-center gap-2 cursor-pointer"
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
