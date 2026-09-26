import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Heart,
  Share2,
  Check,
  Tag,
  BookOpen,
  Eye,
} from 'lucide-react';
import { BLOG_POSTS } from '../data/blogData';
import AnimatedPage from '../components/AnimatedPage';
import { useLocale } from '../contexts/LocaleContext';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLocale();
  const navigate = useNavigate();

  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const [likes, setLikes] = useState(post?.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <AnimatedPage>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">
            {language === 'en' ? 'Article Not Found' : 'Artikel Tidak Ditemukan'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'en' ? 'The article you are looking for does not exist or has been moved.' : 'Artikel yang Anda cari tidak ditemukan atau telah dipindahkan.'}
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-600/25"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'Back to Blogs' : 'Kembali ke Blog'}
          </Link>
        </div>
      </AnimatedPage>
    );
  }

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <AnimatedPage>
      <div className="space-y-8 pb-16 max-w-4xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {language === 'en' ? 'Back to All Articles' : 'Kembali ke Semua Artikel'}
          </button>

          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[11px] font-black uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        {/* Article Header */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'en' ? post.titleEn : post.titleId}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              />
              <div>
                <h3 className="text-xs font-black text-slate-900">{post.author.name}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{post.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                {post.publishDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {post.viewsCount}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main Cover Image */}
        <motion.div
          className="rounded-3xl overflow-hidden aspect-video bg-slate-100 shadow-xl border border-slate-200"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <img
            src={post.coverImage}
            alt={language === 'en' ? post.titleEn : post.titleId}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Article Body Content */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Excerpt Lead */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 border border-blue-100/80 text-slate-800 font-semibold text-sm leading-relaxed">
            {language === 'en' ? post.excerptEn : post.excerptId}
          </div>

          <div className="prose prose-slate max-w-none space-y-6">
            {(language === 'en' ? post.contentEn : post.contentId)
              .trim()
              .split('###')
              .filter(Boolean)
              .map((section, idx) => {
                const lines = section.trim().split('\n');
                const heading = lines[0];
                const paragraphs = lines.slice(1).join('\n').trim();

                return (
                  <div key={idx} className="space-y-3">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                      {heading}
                    </h2>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                      {paragraphs}
                    </p>
                  </div>
                );
              })}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-2">
              <Tag className="w-3 h-3" /> Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Interactive Likes & Share Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLike}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                hasLiked
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : 'text-rose-500'}`} />
              <span>{hasLiked ? (language === 'en' ? 'Liked' : 'Disukai') : (language === 'en' ? 'Like Article' : 'Suka Artikel')} ({likes})</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">{language === 'en' ? 'Link Copied!' : 'Tautan Tersalin!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>{language === 'en' ? 'Share' : 'Bagikan'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {language === 'en' ? 'Related Articles' : 'Artikel Terkait Lainnya'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blogs/${related.slug}`}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex gap-4 group"
                >
                  <img
                    src={related.coverImage}
                    alt={language === 'en' ? related.titleEn : related.titleId}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-600">
                      {related.category}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {language === 'en' ? related.titleEn : related.titleId}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium block">
                      {related.readTime} • {related.publishDate}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default BlogDetailPage;
