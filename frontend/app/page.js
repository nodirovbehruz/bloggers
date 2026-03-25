'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CountdownTimer from './components/CountdownTimer';
import BloggerCard from './components/BloggerCard';
import api from './lib/api';
import { contestInfo } from './lib/mockData';
import { FiArrowRight, FiUsers, FiHeart, FiAward, FiTrendingUp, FiClock, FiUser } from 'react-icons/fi';
import { CategoryIcon } from './lib/categoryIcons';
import AnimatedCounter from './components/AnimatedCounter';
import { useLanguage } from './contexts/LanguageContext';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', '');

export default function HomePage() {
  const [bloggers, setBloggers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, localizedName, localizedDesc } = useLanguage();

  // Scroll animation refs
  const sectionsRef = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    sectionsRef.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const addSectionRef = (el) => {
    if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bloggersRes, categoriesRes, sponsorsRes] = await Promise.all([
          api.getBloggers({ page: 1, per_page: 20 }).catch(() => ({ bloggers: [] })),
          api.getCategories().catch(() => []),
          api.getSponsors().catch(() => []),
        ]);

        setBloggers(bloggersRes.bloggers || []);
        const cats = Array.isArray(categoriesRes) ? categoriesRes : [];
        setCategories(cats);
        setSponsors(Array.isArray(sponsorsRes) ? sponsorsRes : []);

        const totalBloggers = bloggersRes.total || bloggersRes.bloggers?.length || 0;
        const totalVotes = (bloggersRes.bloggers || []).reduce((s, b) => s + (b.total_votes || 0), 0);
        setStatsData({ totalBloggers, totalVotes, totalCategories: cats.length });
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const topBloggers = [...bloggers].sort((a, b) => (b.total_votes || 0) - (a.total_votes || 0)).slice(0, 6);

  // Build photo arrays for mosaic rows from real blogger avatars + fallbacks
  const allAvatars = bloggers.filter(b => b.avatar_url).map(b => {
    const url = b.avatar_url;
    if (url?.startsWith('/uploads')) return `${API_BASE}${url}`;
    return url;
  });
  const fallbackPhotos = [
    '/bloggers/real1.png', '/bloggers/real2.png', '/bloggers/real3.png',
    '/bloggers/real4.png', '/bloggers/real5.png', '/bloggers/real6.png',
    '/bloggers/b1.png', '/bloggers/b2.png', '/bloggers/b3.png',
    '/bloggers/b4.png', '/bloggers/b5.png', '/bloggers/b6.png',
    '/bloggers/b7.png', '/bloggers/b8.png', '/bloggers/b9.png', '/bloggers/b10.png',
  ];
  const combined = [...allAvatars, ...fallbackPhotos];
  const row1Photos = combined.slice(0, 5);
  const row2Photos = [...combined.slice(5, 11), ...combined.slice(0, 1)];
  const row3Photos = [...combined.slice(3, 10)];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const stats = [
    { icon: <FiUsers />, value: formatNumber(statsData?.totalBloggers || 0), label: t('stats_bloggers'), color: 'text-primary' },
    { icon: <FiHeart />, value: formatNumber(statsData?.totalVotes || 0), label: t('stats_votes'), color: 'text-vote-free' },
    { icon: <FiAward />, value: String(statsData?.totalCategories || 0), label: t('stats_categories'), color: 'text-warning' },
    { icon: <FiTrendingUp />, value: '24/7', label: t('stats_voting'), color: 'text-success' },
  ];

  // Default category images
  const defaultCatImages = {
    'lifestyle': '/categories/lifestyle.png',
    'lajfstajl': '/categories/lifestyle.png',
    'beauty': '/categories/beauty.png',
    'krasota': '/categories/beauty.png',
    'travel': '/categories/travel.png',
    'puteshestviya': '/categories/travel.png',
    'food': '/categories/food.png',
    'eda': '/categories/food.png',
    'fitness': '/categories/fitness.png',
    'fitnes': '/categories/fitness.png',
    'fitness': '/categories/fitness.png',
    'tech': '/categories/tech.png',
    'technology': '/categories/tech.png',
    'tekhnologii': '/categories/tech.png',
    'music': '/categories/lifestyle.png',
    'muzyka': '/categories/lifestyle.png',
    'humor': '/categories/food.png',
    'yumor': '/categories/food.png',
  };

  // Get category image URL
  const getCatImage = (cat) => {
    if (cat.image_url) {
      if (cat.image_url.startsWith('/uploads')) return `${API_BASE}${cat.image_url}`;
      return cat.image_url;
    }
    // Fallback to default images by slug
    const slug = cat.slug?.toLowerCase();
    if (slug && defaultCatImages[slug]) return defaultCatImages[slug];
    // Fallback by partial match
    for (const [key, val] of Object.entries(defaultCatImages)) {
      if (slug?.includes(key) || cat.name?.toLowerCase().includes(key)) return val;
    }
    return '/categories/lifestyle.png';
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(336.88deg, #101217 53.39%, #000719 90.76%)' }}>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>

        {/* Row 1 — exact Figma: top:129, opacity:0.4, 5 photos */}
        <div
          className="absolute flex items-center"
          style={{
            gap: '12px',
            left: '-43px',
            top: '129px',
            opacity: 0.4,
            transform: 'rotate(-7.46deg)',
            width: '2003px',
            height: '182px',
          }}
        >
          {row1Photos.map((src, i) => (
            <div
              key={`r1-${i}`}
              className="shrink-0 overflow-hidden rounded-md"
              style={{ width: '391px', height: '182px', background: '#141C31' }}
            >
              <img
                src={src} alt=""
                className="w-full h-full object-cover"
                style={{ transform: 'scale(1.3)' }}
                loading="lazy"
                onError={(e) => { e.target.src = '/bloggers/b1.png'; }}
              />
            </div>
          ))}
        </div>

        {/* Row 2 — exact Figma: top:282, opacity:0.2, 6 photos */}
        <div
          className="absolute flex items-center"
          style={{
            gap: '12px',
            left: '-115px',
            top: '330px',
            opacity: 0.2,
            transform: 'rotate(-7.46deg)',
            width: '2406px',
            height: '182px',
          }}
        >
          {row2Photos.map((src, i) => (
            <div
              key={`r2-${i}`}
              className="shrink-0 overflow-hidden rounded-md"
              style={{ width: '391px', height: '182px', background: '#141C31' }}
            >
              <img
                src={src} alt=""
                className="w-full h-full object-cover"
                style={{ transform: 'scale(1.3)' }}
                loading="lazy"
                onError={(e) => { e.target.src = '/bloggers/b2.png'; }}
              />
            </div>
          ))}
        </div>

        {/* Row 3 — exact Figma: top:443, opacity:0.2, 7 photos */}
        <div
          className="absolute flex items-center"
          style={{
            gap: '12px',
            left: '-253px',
            top: '530px',
            opacity: 0.2,
            transform: 'rotate(-7.46deg)',
            width: '2809px',
            height: '182px',
          }}
        >
          {row3Photos.map((src, i) => (
            <div
              key={`r3-${i}`}
              className="shrink-0 overflow-hidden rounded-md"
              style={{ width: '391px', height: '182px', background: '#141C31' }}
            >
              <img
                src={src} alt=""
                className="w-full h-full object-cover"
                style={{ transform: 'scale(1.3)' }}
                loading="lazy"
                onError={(e) => { e.target.src = '/bloggers/b3.png'; }}
              />
            </div>
          ))}
        </div>

        {/* Gradient overlay — smooth fade to dark */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(16,18,23,0.15) 0%, rgba(16,18,23,0.25) 30%, rgba(16,18,23,0.4) 55%, rgba(16,18,23,0.7) 80%, #101217 100%)',
          }}
        ></div>

        {/* Hero Content Overlay */}
        <div className="relative z-20 flex flex-col items-center justify-center px-4" style={{ minHeight: '100vh', paddingTop: '80px' }}>

          {/* Title Block */}
          <div className="flex flex-col items-center" style={{ gap: '30px', marginBottom: '52px' }}>
            {/* Main Title — Inter weight 300, 48px */}
            <h1
              className="text-center text-white"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 300,
                fontSize: 'clamp(28px, 5vw, 48px)',
                lineHeight: '58px',
                letterSpacing: '0.26px',
              }}
            >
              BLOGGER ASSOCIATION VOTING PLATFORM
            </h1>

            {/* Subtitle — Inter 400 20px */}
            <p
              className="text-center max-w-2xl"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 'clamp(14px, 2.5vw, 20px)',
                lineHeight: '32px',
                letterSpacing: '0.07px',
                color: 'rgba(255, 255, 255, 0.9)',
              }}
            >
              {t('home_hero_subtitle')}
            </p>
          </div>

          {/* CTA Buttons — solid primary + outline secondary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 mb-16">
            <Link
              href="/register"
              className="flex items-center justify-center text-white transition-all"
              style={{
                width: '275px',
                height: '52px',
                background: 'rgba(152, 16, 250, 0.7)',
                borderRadius: '9999px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '28px',
                letterSpacing: '-0.44px',
              }}
              id="cta-register"
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(152,16,250,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {t('nav_register')}
            </Link>
            <Link
              href="/categories"
              className="flex items-center justify-center text-white transition-all"
              style={{
                width: '275px',
                height: '52px',
                background: 'transparent',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '9999px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '18px',
                lineHeight: '28px',
                letterSpacing: '-0.44px',
              }}
              id="cta-vote"
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(152,16,250,0.6)'; e.currentTarget.style.background = 'rgba(152,16,250,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
            >
              {t('home_vote_now')}
            </Link>
          </div>

          {/* Countdown Section */}
          <div className="flex flex-col items-center" style={{ gap: '40px' }}>
            {/* Clock + label */}
            <div className="flex items-center" style={{ gap: '20px' }}>
              <FiClock size={24} className="text-white" />
              <span
                className="text-white text-center"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  fontSize: '18px',
                  lineHeight: '28px',
                  letterSpacing: '-0.44px',
                }}
              >
                {t('home_contest_ends')}:
              </span>
            </div>
            <CountdownTimer targetDate={contestInfo.endDate} />
          </div>

          {/* Stats — inline in hero */}
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full max-w-3xl mt-16 px-4"
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center p-4 sm:p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className={`text-2xl mb-2 ${stat.color} flex justify-center`}>{stat.icon}</div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <AnimatedCounter value={stat.value} duration={2000} />
                </div>
                <div className="text-gray-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION — 2 columns, large tiles ===== */}
      <section className="py-20 animate-section" ref={addSectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title — Montserrat 300 */}
          <h2
            className="text-center text-white mb-12"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(28px, 4vw, 48px)',
              lineHeight: '48px',
              letterSpacing: '0.4px',
            }}
          >
            {t('home_categories').toUpperCase()}
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px]">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-80 bg-[#141C31] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[3px] rounded-xl overflow-hidden">
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories?filter=${cat.slug}`}
                  className="group relative overflow-hidden"
                  style={{ height: '400px', transition: 'all 0.4s ease' }}
                  id={`category-${cat.slug}`}
                >
                  {/* Category image background */}
                  {getCatImage(cat) ? (
                    <img
                      src={getCatImage(cat)}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f35] to-[#0d1020]"></div>
                  )}

                  {/* Dark gradient overlay from bottom */}
                  <div
                    className="absolute inset-0 z-10"
                    style={{ background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)' }}
                  ></div>

                  {/* Content at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-10 z-20">
                    <h3
                      className="text-white mb-6"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        fontSize: 'clamp(24px, 3vw, 42px)',
                        lineHeight: '28px',
                        letterSpacing: '-0.45px',
                      }}
                    >
                      {localizedName(cat)}
                    </h3>
                    <div className="flex items-center" style={{ gap: '20px' }}>
                      <FiUsers size={28} className="text-white" strokeWidth={1.5} />
                      <span
                        className="text-white"
                        style={{
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 'clamp(16px, 2vw, 24px)',
                          lineHeight: '24px',
                          letterSpacing: '-0.31px',
                        }}
                      >
                        {cat.blogger_count || 0} {t('categories_bloggers')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-[#9810FA] hover:opacity-80 font-semibold transition-colors"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: '18px' }}
            >
              {t('home_view_all')} <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TOP BLOGGERS SECTION ===== */}
      <section className="py-20 animate-section" ref={addSectionRef} style={{ background: 'rgba(18, 22, 32, 0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2
              className="text-white"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(24px, 3.5vw, 48px)',
                lineHeight: '36px',
                letterSpacing: '0.4px',
              }}
            >
              {t('home_top_bloggers').toUpperCase()}
            </h2>
            <Link
              href="/leaderboard"
              className="hidden sm:inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              style={{ background: '#9810FA', fontFamily: 'Inter, sans-serif' }}
            >
              {t('nav_leaderboard')} <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-[#141C31] animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {topBloggers.map((blogger, i) => (
                <div key={blogger.id} className="animate-section" ref={addSectionRef} style={{ transitionDelay: `${i * 0.08}s` }}>
                  <BloggerCard blogger={{
                    id: blogger.id,
                    name: blogger.full_name,
                    nickname: blogger.nickname,
                    avatar: blogger.avatar_url,
                    votes: blogger.total_votes || 0,
                    category: categories.find(c => c.id === blogger.category_id)?.slug || '',
                    categoryName: localizedName(categories.find(c => c.id === blogger.category_id)) || '',
                  }} />
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-full"
              style={{ background: '#9810FA' }}
            >
              {t('nav_leaderboard')} <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SPONSORS SECTION ===== */}
      {sponsors.length > 0 && (
        <section className="py-24 animate-section" ref={addSectionRef}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section title */}
            <h2
              className="text-center text-white mb-4"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 300,
                fontSize: 'clamp(24px, 4vw, 42px)',
                lineHeight: '48px',
                letterSpacing: '0.4px',
              }}
            >
              {t('home_sponsors').toUpperCase()}
            </h2>
            <p
              className="text-center mb-14"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: '16px',
                color: 'rgba(255,255,255,0.4)',
              }}
            >
              {t('footer_about')}
            </p>

            {/* Sponsor cards grid */}
            <div className={`grid gap-5 mb-16 ${sponsors.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
              {sponsors.map((sponsor) => {
                const logoSrc = sponsor.logo_url?.startsWith('/uploads')
                  ? `${API_BASE}${sponsor.logo_url}`
                  : sponsor.logo_url;
                return (
                  <a
                    key={sponsor.id}
                    href={sponsor.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(152,16,250,0.3)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={sponsor.name}
                        className="w-auto object-contain mb-5 transition-transform duration-300 group-hover:scale-105"
                        style={{ height: '80px', maxWidth: '180px' }}
                        onError={(e) => { e.target.style.display = 'none'; if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'block'; }}
                      />
                    ) : null}
                    <span
                      className="text-white font-semibold text-lg"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        display: logoSrc ? 'none' : 'block',
                      }}
                    >
                      {localizedName(sponsor)}
                    </span>
                    <span
                      className="text-sm mt-3"
                      style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter, sans-serif' }}
                    >
                      {localizedName(sponsor)}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Scrolling marquee below */}
            <div className="relative overflow-hidden" style={{ height: '50px' }}>
              <div
                className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
                style={{ width: '100px', background: 'linear-gradient(to right, #0f0f1a 0%, transparent 100%)' }}
              ></div>
              <div
                className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
                style={{ width: '100px', background: 'linear-gradient(to left, #0f0f1a 0%, transparent 100%)' }}
              ></div>
              <div
                className="flex items-center h-full gap-0 sponsor-marquee"
                style={{ animation: 'marquee-right 25s linear infinite', width: 'max-content' }}
              >
                {[...sponsors, ...sponsors, ...sponsors, ...sponsors, ...sponsors, ...sponsors, ...sponsors, ...sponsors].map((s, i) => (
                  <span key={`m-${i}`} className="shrink-0 px-6 text-sm whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.15)', fontFamily: 'Inter', fontWeight: 500 }}>
                    {localizedName(s)}  ·
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA SECTION ===== */}
      <section className="py-28 relative animate-section" ref={addSectionRef}>
        {/* Decorative glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, #9810FA 0%, transparent 70%)' }}></div>
        </div>

        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 300,
              fontSize: 'clamp(22px, 3vw, 32px)',
              lineHeight: '42px',
              letterSpacing: '0.4px',
            }}
          >
            {t('home_ready_title').toUpperCase()}
          </h2>

          <p
            className="mb-10"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: '20px',
              lineHeight: '28px',
              letterSpacing: '-0.45px',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            {t('home_ready_subtitle')}
          </p>

          <Link
            href="/categories"
            className="inline-flex items-center justify-center text-white"
            style={{
              width: '275px',
              height: '52px',
              background: '#9810FA',
              borderRadius: '9999px',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '18px',
              lineHeight: '28px',
              letterSpacing: '-0.44px',
              transition: 'all 0.3s ease',
            }}
            id="cta-bottom-vote"
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 50px rgba(152,16,250,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {t('home_start_voting')}
          </Link>
        </div>
      </section>
    </div>
  );
}
