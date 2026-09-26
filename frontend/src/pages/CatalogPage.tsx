import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SlidersHorizontal,
  Package,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../api/axios';
import { Product, Category, PaginatedResponse, ApiResponse, PaginationMeta } from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import SkeletonLoader from '../components/SkeletonLoader';
import AnimatedPage from '../components/AnimatedPage';
import { useLocale } from '../contexts/LocaleContext';

export const CatalogPage: React.FC = () => {
  const { language, t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_slug') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Sync params with URL
  useEffect(() => {
    const urlCategory = searchParams.get('category_slug') || '';
    const urlSearch = searchParams.get('search') || '';
    const urlSort = searchParams.get('sort') || 'latest';

    setSelectedCategory(urlCategory);
    setSearchQuery(urlSearch);
    setSortBy(urlSort);
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get<ApiResponse<Category[]>>('/categories');
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        } else {
          setCategories(MOCK_CATEGORIES);
        }
      } catch {
        setCategories(MOCK_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        sort: sortBy,
        page: currentPage,
        per_page: 12,
      };

      if (selectedCategory) {
        params.category_slug = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const res = await api.get<PaginatedResponse<Product>>('/products', { params });
      if (res.data?.data && res.data.data.length > 0) {
        setProducts(res.data.data);
        setPaginationMeta(res.data.meta || null);
      } else if (!res.data?.data) {
        throw new Error('Fallback to mock');
      } else {
        setProducts([]);
        setPaginationMeta(res.data.meta || null);
      }
    } catch {
      let filtered = [...MOCK_PRODUCTS];
      if (selectedCategory) {
        filtered = filtered.filter(p => p.category?.slug === selectedCategory);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      if (sortBy === 'price_asc') {
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
      } else if (sortBy === 'price_desc') {
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
      }
      setProducts(filtered);
      setPaginationMeta(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, currentPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category_slug', slug);
    } else {
      newParams.delete('category_slug');
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setSortBy('latest');
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <AnimatedPage>
      <div className="space-y-8">
        {/* Page Header */}
        <motion.div
          className="border-b border-slate-200/80 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-blue-600" />
                {t('catalog')}
              </h1>
              {searchQuery && (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <span>{language === 'en' ? 'Showing search results for' : 'Menampilkan hasil pencarian untuk'}:</span>
                  <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    "{searchQuery}"
                  </span>
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Grid: Sidebar Filters + Products List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <motion.aside
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  {t('filter_by_category')}
                </span>
                {(selectedCategory || searchQuery || sortBy !== 'latest') && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold"
                  >
                    <RotateCcw className="w-3 h-3" /> {t('reset_filters')}
                  </button>
                )}
              </div>

              {/* Category Filter List */}
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${selectedCategory === ''
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <span>{t('all_categories')}</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${selectedCategory === cat.slug
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${selectedCategory === cat.slug ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {cat.products_count ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          {/* Products Showcase */}
          <section className="lg:col-span-3 space-y-6">
            {/* Top Sort Controls */}
            <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">
                {language === 'en'
                  ? `Showing ${products.length} of ${paginationMeta?.total ?? products.length} items`
                  : `Menampilkan ${products.length} dari ${paginationMeta?.total ?? products.length} item`}
              </span>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-blue-600 transition-all"
                >
                  <option value="latest">{t('sort_latest')}</option>
                  <option value="price_asc">{t('sort_price_low')}</option>
                  <option value="price_desc">{t('sort_price_high')}</option>
                  <option value="name_asc">{t('sort_name')}</option>
                </select>
              </div>
            </div>

            {/* Product Cards Grid */}
            {isLoading ? (
              <SkeletonLoader count={6} />
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3 shadow-xs">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-900">{t('no_products_found')}</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t('no_products_desc')}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold mt-2 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {t('reset_filters')}
                </button>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-6"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
              >
                {products.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </motion.div>
            )}

            {/* Pagination Controls */}
            {paginationMeta && paginationMeta.last_page > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-200/80">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: paginationMeta.last_page }).map((_, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(paginationMeta.last_page, p + 1));
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage >= paginationMeta.last_page}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default CatalogPage;
