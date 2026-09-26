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
  Bookmark,
  Sparkles,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../data/blogData';
import AnimatedPage from '../components/AnimatedPage';
import { useLocale } from '../contexts/LocaleContext';

// Helper to format inline markdown formatting (**bold**, *italic*, `code`)
const formatInlineText = (text: string): React.ReactNode => {
  // Regex to split by bold (**text**), italic (*text*), and backtick code (`code`)
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-slate-900 tracking-tight">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono text-xs border border-blue-200/60 font-semibold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLocale();
  const navigate = useNavigate();

  const post = BLOG_POSTS.find((p) => p.slug === slug);
  const [likes, setLikes] = useState(post?.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <AnimatedPage>
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 max-w-lg mx-auto shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">
            {language === 'en' ? 'Article Not Found' : 'Artikel Tidak Ditemukan'}
          </h2>
          <p className="text-xs text-slate-500">
            {language === 'en'
              ? 'The article you are looking for does not exist or has been moved.'
              : 'Artikel yang Anda cari tidak ditemukan atau telah dipindahkan.'}
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 transition-all"
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

  const relatedPosts: BlogPost[] = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  const rawContent = language === 'en' ? post.contentEn : post.contentId;
  const sections = rawContent
    .trim()
    .split('###')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <AnimatedPage>
      <div className="space-y-8 pb-16 max-w-3xl mx-auto">
        {/* Top Navigation & Breadcrumbs Bar */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/blogs')}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Back to Editorial' : 'Kembali ke Editorial'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-[11px] font-black uppercase tracking-wider shadow-2xs">
              {post.category}
            </span>
          </div>
        </div>

        {/* Article Headline & Metadata */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            {language === 'en' ? post.titleEn : post.titleId}
          </h1>

          {/* Author Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-y border-slate-100 py-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">{post.author.name}</h3>
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-[11px] text-slate-400 font-semibold">{post.author.role}</p>
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

        {/* Hero Cover Image */}
        <motion.div
          className="rounded-3xl overflow-hidden aspect-video sm:aspect-[16/9] bg-slate-100 shadow-lg border border-slate-200/90 relative"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <img
            src={post.coverImage}
            alt={language === 'en' ? post.titleEn : post.titleId}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Renstore Tech Spotlight</span>
          </div>
        </motion.div>

        {/* Article Body Content Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-8">
          {/* Excerpt Lead Box */}
          <div className="p-5 rounded-2xl bg-blue-50/70 border-l-4 border-blue-600 text-slate-800 font-semibold text-sm sm:text-base leading-relaxed">
            <span className="text-xs font-black text-blue-600 uppercase tracking-wider block mb-1">
              {language === 'en' ? 'Summary & Takeaways' : 'Ringkasan & Poin Utama'}
            </span>
            {language === 'en' ? post.excerptEn : post.excerptId}
          </div>

          {/* Formatted Content Sections */}
          <div className="space-y-8">
            {sections.map((section, idx) => {
              const lines = section.split('\n');
              const heading = lines[0].trim();
              const bodyLines = lines.slice(1).join('\n').trim();

              // Split body into multiple paragraphs by empty lines
              const paragraphs = bodyLines
                .split(/\n\s*\n/)
                .map((p) => p.trim())
                .filter(Boolean);

              return (
                <section key={idx} className="space-y-3.5">
                  {heading && (
                    <div className="flex items-center gap-2.5 pt-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 shadow-xs" />
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                        {heading}
                      </h2>
                    </div>
                  )}

                  {paragraphs.map((para, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-slate-700 leading-relaxed sm:leading-loose text-sm sm:text-base font-normal"
                    >
                      {formatInlineText(para)}
                    </p>
                  ))}
                </section>
              );
            })}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" /> {language === 'en' ? 'Tags:' : 'Topik:'}
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Author Card Box at End of Article */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-black text-slate-900">{post.author.name}</h4>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    Author
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{post.author.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/blogs')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-colors shadow-2xs flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
            >
              <span>{language === 'en' ? 'More Articles' : 'Lihat Artikel Lain'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>

          {/* Interactive Engagement Bar (Like, Save, Share) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  hasLiked
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-white' : 'text-rose-400'}`} />
                <span>
                  {hasLiked
                    ? language === 'en'
                      ? 'Liked'
                      : 'Disukai'
                    : language === 'en'
                    ? 'Like'
                    : 'Suka'}{' '}
                  ({likes})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/30'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={language === 'en' ? 'Bookmark Article' : 'Simpan Artikel'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-900' : 'text-amber-300'}`} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span className="text-emerald-200">
                    {language === 'en' ? 'Link Copied!' : 'Tersalin!'}
                  </span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>{language === 'en' ? 'Share Article' : 'Bagikan'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                {language === 'en' ? 'Related Articles' : 'Artikel Terkait Lainnya'}
              </h3>
              <Link
                to="/blogs"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>{language === 'en' ? 'View All' : 'Lihat Semua'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/blogs/${related.slug}`}
                  className="p-4 rounded-3xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/8 transition-all flex gap-4 group"
                >
                  <img
                    src={related.coverImage}
                    alt={language === 'en' ? related.titleEn : related.titleId}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0 aspect-square border border-slate-100"
                  />
                  <div className="space-y-1.5 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">
                        {related.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {language === 'en' ? related.titleEn : related.titleId}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
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
