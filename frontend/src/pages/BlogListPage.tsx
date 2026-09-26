import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Newspaper,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Heart,
  Eye,
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import AnimatedPage from '../components/AnimatedPage';
import { useLocale } from '../contexts/LocaleContext';

export const BlogListPage: React.FC = () => {
  const { language } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', nameId: 'Semua Artikel', nameEn: 'All Articles' },
    { id: 'Review', nameId: 'Review Gadget', nameEn: 'Gadget Reviews' },
    { id: 'Guide', nameId: 'Panduan Beli', nameEn: 'Buying Guides' },
    { id: 'Tips', nameId: 'Tips & Trik', nameEn: 'Tips & Tricks' },
  ];

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const title = language === 'en' ? post.titleEn.toLowerCase() : post.titleId.toLowerCase();
    const excerpt = language === 'en' ? post.excerptEn.toLowerCase() : post.excerptId.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || title.includes(query) || excerpt.includes(query);
    return matchesCategory && matchesSearch;
  });

  const featuredPost = BLOG_POSTS[0];

  return (
    <AnimatedPage>
      <div className="space-y-10 pb-16">
        {/* Header Title */}
        <motion.div
          className="border-b border-slate-200/80 pb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-black uppercase tracking-wider mb-2">
                <Newspaper className="w-3.5 h-3.5" />
                {language === 'en' ? 'Renstore Editorial' : 'Editorial & Berita Gadget'}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {language === 'en' ? 'Tech Insights & Lifestyle Blog' : 'Blog Teknologi & Gaya Hidup Modern'}
              </h1>

            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search articles...' : 'Cari artikel & topik...'}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all shadow-xs"
              />
            </div>
          </div>
        </motion.div>

        {/* Featured Hero Article Banner */}
        {featuredPost && selectedCategory === 'all' && !searchQuery && (
          <motion.div
            className="rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5 hover:border-blue-300 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Image Column */}
            <div className="lg:col-span-7 relative aspect-video lg:aspect-auto overflow-hidden bg-slate-100 min-h-[300px]">
              <img
                src={featuredPost.coverImage}
                alt={language === 'en' ? featuredPost.titleEn : featuredPost.titleId}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-600 text-white text-[11px] font-black tracking-wider uppercase shadow-md shadow-blue-600/30">
                  FEATURED
                </span>
                <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-extrabold shadow-xs">
                  {featuredPost.category}
                </span>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {featuredPost.publishDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {featuredPost.readTime}
                  </span>
                </div>

                <Link
                  to={`/blogs/${featuredPost.slug}`}
                  className="block text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug"
                >
                  {language === 'en' ? featuredPost.titleEn : featuredPost.titleId}
                </Link>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">
                  {language === 'en' ? featuredPost.excerptEn : featuredPost.excerptId}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Author & Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={featuredPost.author.avatar}
                    alt={featuredPost.author.name}
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">
                      {featuredPost.author.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {featuredPost.author.role}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/blogs/${featuredPost.slug}`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-600/25 shrink-0"
                >
                  <span>{language === 'en' ? 'Read Full' : 'Baca Artikel'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
            >
              {language === 'en' ? cat.nameEn : cat.nameId}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              {language === 'en' ? 'No Articles Found' : 'Tidak Ada Artikel yang Ditemukan'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'en' ? 'Try adjusting your search query or select another category.' : 'Coba ubah kata kunci pencarian atau pilih kategori lain.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: idx * 0.05 } },
                }}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Article Thumbnail */}
                  <Link
                    to={`/blogs/${post.slug}`}
                    className="block relative aspect-video overflow-hidden bg-slate-100"
                  >
                    <img
                      src={post.coverImage}
                      alt={language === 'en' ? post.titleEn : post.titleId}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                        {post.category}
                      </span>
                    </div>
                  </Link>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
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
                      className="block text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug"
                    >
                      {language === 'en' ? post.titleEn : post.titleId}
                    </Link>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-medium">
                      {language === 'en' ? post.excerptEn : post.excerptId}
                    </p>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-6 h-6 rounded-full object-cover border border-slate-200"
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {post.author.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {post.viewsCount}
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default BlogListPage;
