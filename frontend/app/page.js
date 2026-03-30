'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import CountdownTimer from './components/CountdownTimer';
import BloggerCard from './components/BloggerCard';
import api from './lib/api';
import { contestInfo } from './lib/mockData';
import { FiArrowRight, FiUsers, FiHeart, FiAward, FiTrendingUp, FiClock, FiUser, FiStar } from 'react-icons/fi';
import { CategoryIcon } from './lib/categoryIcons';
import AnimatedCounter from './components/AnimatedCounter';
import { useLanguage } from './contexts/LanguageContext';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', '');

export default function HomePage() {
  const [bloggers, setBloggers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [pastWinners, setPastWinners] = useState([]);
  const [loadingWinners, setLoadingWinners] = useState(false);
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
        const [bloggersRes, categoriesRes, sponsorsRes, sessionsRes] = await Promise.all([
          api.getBloggers({ page: 1, per_page: 20 }).catch(() => ({ bloggers: [] })),
          api.getCategories().catch(() => []),
          api.getSponsors().catch(() => []),
          api.getContestSessions().catch(() => []),
        ]);

        setBloggers(bloggersRes.bloggers || []);
        const cats = Array.isArray(categoriesRes) ? categoriesRes : [];
        setCategories(cats);
        setSponsors(Array.isArray(sponsorsRes) ? sponsorsRes : []);
        const sess = Array.isArray(sessionsRes) ? sessionsRes : [];
        setSessions(sess);

        if (sess.length > 0) {
          setSelectedSessionId(sess[0].id);
        }

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

  useEffect(() => {
    if (selectedSessionId) {
      setLoadingWinners(true);
      api.getWinners(selectedSessionId)
        .then(res => setPastWinners(Array.isArray(res) ? res : []))
        .catch(() => setPastWinners([]))
        .finally(() => setLoadingWinners(false));
    }
  }, [selectedSessionId]);

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

          {/* Partners/Sponsors Section instead of Stats */}
          <div className="w-full max-w-6xl mt-24 px-4 animate-fade-up">
            <div className="flex flex-col items-center mb-12">
              <div className="w-16 h-[1.5px] bg-primary/60 mb-6"></div>
              <h2
                className="text-white text-center opacity-70 uppercase tracking-[6px]"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: '13px',
                }}
              >
                {t('home_sponsors')}
              </h2>
            </div>
            
            {/* Featured Partners Grid */}
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 w-full mb-16"
            >
              {sponsors.length > 0 ? (
                sponsors.slice(0, 4).map((sponsor, i) => {
                  const logoSrc = sponsor.logo_url ? (
                    sponsor.logo_url.startsWith('/uploads') ? `${API_BASE}${sponsor.logo_url}` : sponsor.logo_url
                  ) : null;
                  
                  return (
                    <a
                      key={i}
                      href={sponsor.website_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center justify-center p-10 rounded-[32px] transition-all duration-500 hover:bg-white/5 border border-white/5 hover:border-primary/40 shadow-2xl"
                      style={{ 
                        background: 'rgba(255,255,255,0.024)', 
                        height: '200px'
                      }}
                    >
                      {logoSrc ? (
                        <img
                          src={logoSrc}
                          alt={sponsor.name}
                          className="max-h-24 w-auto object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-95 group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-white opacity-40 font-bold text-lg text-center uppercase tracking-[2px]">
                          {localizedName(sponsor)}
                        </span>
                      )}
                    </a>
                  );
                })
              ) : (
                [1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex items-center justify-center p-10 rounded-[32px] opacity-10"
                    style={{ background: 'rgba(255,255,255,0.024)', border: '1px solid rgba(255,255,255,0.05)', height: '200px' }}
                  >
                    <div className="w-40 h-8 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
                ))
              )}
            </div>

            {/* Seamless Infinite Ribbon (Marquee) — Back per request! */}
            {sponsors.length > 0 && (
              <div className="relative w-full overflow-hidden py-14 mt-8">
                <div className="absolute left-0 top-0 bottom-0 w-48 z-10 bg-gradient-to-r from-[#101217] to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-48 z-10 bg-gradient-to-l from-[#101217] to-transparent pointer-events-none"></div>

                <div className="flex w-max animate-scroll-left hover:[animation-play-state:paused] cursor-pointer">
                  {[...sponsors, ...sponsors, ...sponsors, ...sponsors].map((s, i) => {
                    const logo = s.logo_url ? (
                      s.logo_url.startsWith('/uploads') ? `${API_BASE}${s.logo_url}` : s.logo_url
                    ) : null;
                    return (
                      <div key={i} className="flex items-center justify-center px-16 group transition-all duration-300">
                        {logo ? (
                          <img 
                            src={logo} 
                            alt={s.name} 
                            className="h-12 w-auto object-contain opacity-20 group-hover:opacity-70 transition-opacity" 
                          />
                        ) : (
                          <span className="text-white/10 group-hover:text-white/50 font-black uppercase tracking-tighter text-2xl italic">
                            {localizedName(s)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Stats Row */}
            {statsData && (
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 w-full max-w-4xl mx-auto">
                <div className="flex flex-col items-center p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-primary/20 transition-colors group">
                  <span className="text-3xl md:text-4xl font-black text-white mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AnimatedCounter value={statsData.totalBloggers || 0} />
                  </span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">{t('stats_bloggers')}</span>
                </div>
                
                <div className="flex flex-col items-center p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-vote-free/20 transition-colors group">
                  <span className="text-3xl md:text-4xl font-black text-vote-free mb-1 group-hover:drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AnimatedCounter value={statsData.totalVotes || 0} />
                  </span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">{t('stats_votes')}</span>
                </div>
                
                <div className="flex flex-col items-center p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-warning/20 transition-colors group">
                  <span className="text-3xl md:text-4xl font-black text-warning mb-1 group-hover:drop-shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <AnimatedCounter value={statsData.totalCategories || 0} />
                  </span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">{t('stats_categories')}</span>
                </div>
                
                <div className="flex flex-col items-center p-6 rounded-3xl bg-white/[0.03] border border-white/[0.05] hover:border-success/20 transition-colors group">
                  <span className="text-3xl md:text-4xl font-black text-success mb-1 group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all" style={{ fontFamily: 'Inter, sans-serif' }}>
                    24/7
                  </span>
                  <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">{t('stats_voting')}</span>
                </div>
              </div>
            )}
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
      <section className="py-24 bg-[#0a0c10]/40 animate-section" ref={addSectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <h2
                className="text-white mb-4"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: 'clamp(32px, 5vw, 56px)',
                  lineHeight: '1.1',
                  letterSpacing: '-1px',
                }}
              >
                {t('home_top_bloggers')}
              </h2>
              <div className="w-20 h-1 bg-primary"></div>
            </div>
            <Link
              href="/leaderboard"
              className="group flex items-center gap-3 text-white/60 hover:text-white transition-colors"
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '18px' }}
            >
              {t('home_view_all')}
              <FiArrowRight className="transition-transform group-hover:translate-x-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-[#141C31] animate-pulse"></div>
              ))
            ) : (
              bloggers.slice(0, 4).map((blogger, index) => {
                const category = categories.find(c => c.id === blogger.category_id);
                return (
                  <BloggerCard 
                    key={blogger.id} 
                    blogger={{
                      ...blogger,
                      name: blogger.full_name,
                      votes: blogger.total_votes,
                      avatar: blogger.avatar_url,
                      categoryName: localizedName(category),
                      rank: index + 1
                    }} 
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ===== PAST WINNERS SECTION ===== */}
      <section className="py-24 bg-black/20 animate-section" ref={addSectionRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary font-black uppercase tracking-[4px] text-[10px] mb-3">Хронология побед</p>
            <h2 className="text-white text-3xl font-heading font-black mb-4 uppercase tracking-[2px]">Архив конкурсов</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-10"></div>
          </div>
          
          {sessions.length > 0 ? (
            <div className="space-y-12">
               {/* Session Selector Chips */}
               <div className="flex flex-wrap justify-center gap-3">
                  {sessions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                        selectedSessionId === s.id 
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105' 
                        : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10'
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
               </div>

               {/* Winners Grid for Selected Session */}
               {loadingWinners ? (
                 <div className="flex justify-center py-20">
                    <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                 </div>
               ) : pastWinners.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
                    {pastWinners.map((winner, idx) => (
                      <div key={idx} className="glass-dark rounded-3xl p-8 relative overflow-hidden group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-5 relative z-10">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-primary/40 group-hover:border-primary transition-colors">
                             <img 
                               src={winner.blogger_avatar?.startsWith('/uploads') ? `${API_BASE}${winner.blogger_avatar}` : (winner.blogger_avatar || '/bloggers/b1.png')} 
                               alt="" 
                               className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                             />
                          </div>
                          <div>
                             <div className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{winner.blogger_name}</div>
                             <div className="text-primary text-[10px] font-black uppercase tracking-widest">{winner.category_name}</div>
                          </div>
                        </div>
                        <div className="mt-8 flex items-center justify-between relative z-10">
                          <div className="text-text-muted text-xs">
                             <span className="opacity-50">Всего голосов:</span> <br/>
                             <span className="text-white font-black text-sm">{winner.total_votes.toLocaleString()}</span>
                          </div>
                          <div className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[2px] uppercase group-hover:bg-primary group-hover:text-white transition-all">
                             Winner
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <div className="text-center py-16 opacity-30 italic">В этом этапе пока нет зафиксированных результатов</div>
               )}
            </div>
          ) : (
             <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/5 max-w-2xl mx-auto">
                <FiAward size={64} className="mx-auto mb-6 text-white/5" />
                <h4 className="text-white/40 font-bold mb-2">История побед</h4>
                <p className="text-white/20 text-sm">Здесь появятся лучшие блогеры после завершения первого этапа конкурса</p>
             </div>
          )}
        </div>
      </section>

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
