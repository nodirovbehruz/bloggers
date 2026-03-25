'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../lib/api';
import { FiHeart, FiArrowUp, FiAward } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function LeaderboardPage() {
  const [bloggers, setBloggers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [animatedVotes, setAnimatedVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const { t, localizedName } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bloggersData, catsData] = await Promise.all([
          api.getBloggers({ page: 1, per_page: 100 }),
          api.getCategories().catch(() => []),
        ]);
        const cats = Array.isArray(catsData) ? catsData : [];
        setCategories(cats);
        setBloggers(
          (bloggersData.bloggers || []).map(b => ({
            id: b.id,
            name: b.full_name,
            nickname: b.nickname,
            avatar: b.avatar_url,
            votes: b.total_votes || 0,
            category_id: b.category_id,
            categorySlug: cats.find(c => c.id === b.category_id)?.slug || '',
            categoryName: localizedName(cats.find(c => c.id === b.category_id)) || '',
          }))
        );
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBloggers = bloggers
    .filter(b => activeCategory === 'all' || b.categorySlug === activeCategory)
    .sort((a, b) => b.votes - a.votes);

  // Simulate real-time vote updates
  useEffect(() => {
    if (filteredBloggers.length === 0) return;
    const interval = setInterval(() => {
      const randomBlogger = filteredBloggers[Math.floor(Math.random() * filteredBloggers.length)];
      if (randomBlogger) {
        setAnimatedVotes(prev => ({
          ...prev,
          [randomBlogger.id]: (prev[randomBlogger.id] || 0) + Math.floor(Math.random() * 5) + 1,
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [filteredBloggers.length, activeCategory]);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-yellow-500/30">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-gray-400/30">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-amber-600/30">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full glass flex items-center justify-center text-lg font-bold text-text-secondary">
            #{rank}
          </div>
        );
    }
  };

  const formatVotes = (n) => n.toLocaleString('ru-RU');

  // Avatar component
  const Avatar = ({ src, name, size = 'md' }) => {
    const sizeClasses = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20',
    };
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-primary/40 to-accent/40 shrink-0 ${size === 'lg' ? 'ring-4 ring-primary/30' : ''}`}>
        {src && (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="h-10 w-60 bg-surface-card rounded mx-auto animate-pulse mb-3"></div>
            <div className="h-5 w-80 bg-surface-card rounded mx-auto animate-pulse"></div>
          </div>
          <div className="flex gap-2 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="h-9 w-24 bg-surface-card rounded-full animate-pulse"></div>)}
          </div>
          <div className="space-y-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-surface-card rounded-xl animate-pulse"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-success rounded-full pulse-dot"></span>
            <span className="text-sm text-success font-medium">LIVE</span>
            <span className="text-sm text-text-secondary">{t('leaderboard_subtitle')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white mb-3 tracking-tight flex items-center justify-center gap-3">
            <FiAward className="text-primary" /> {t('leaderboard_title').toUpperCase()}
          </h1>
          <p className="text-text-secondary max-w-md mx-auto">
            {t('leaderboard_subtitle')}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none">
          <button
            onClick={() => { setActiveCategory('all'); setAnimatedVotes({}); }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'gradient-bg text-white'
                : 'glass text-text-secondary hover:text-white'
            }`}
          >
            {t('leaderboard_all')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              onClick={() => { setActiveCategory(cat.slug); setAnimatedVotes({}); }}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.slug
                  ? 'gradient-bg text-white'
                  : 'glass text-text-secondary hover:text-white'
              }`}
            >
              {localizedName(cat)}
            </button>
          ))}
        </div>

        {filteredBloggers.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">😕</div>
            <h3 className="text-lg font-heading font-semibold text-white mb-2">{t('no_results')}</h3>
            <p className="text-text-secondary text-sm">{t('no_results')}</p>
          </div>
        ) : (
          <>
            {/* Top 3 podium */}
            {filteredBloggers.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-10">
                {/* 2nd place */}
                <div className="order-1 sm:mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="glass rounded-2xl p-4 text-center card-hover">
                    <div className="flex justify-center">{getRankBadge(2)}</div>
                    <div className="mt-3">
                      <div className="flex justify-center">
                        <Avatar src={filteredBloggers[1].avatar} name={filteredBloggers[1].name} size="md" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate mt-2">{filteredBloggers[1].name}</h3>
                      <p className="text-xs text-text-muted truncate">{filteredBloggers[1].nickname}</p>
                      <p className="text-sm font-bold text-white mt-2 flex items-center justify-center gap-1">
                        <FiHeart size={14} className="text-vote-free fill-vote-free" />
                        {formatVotes(filteredBloggers[1].votes + (animatedVotes[filteredBloggers[1].id] || 0))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 1st place */}
                <div className="order-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="glass rounded-2xl p-4 text-center card-hover gradient-border glow-purple">
                    <div className="flex justify-center">{getRankBadge(1)}</div>
                    <div className="mt-3">
                      <div className="flex justify-center">
                        <Avatar src={filteredBloggers[0].avatar} name={filteredBloggers[0].name} size="lg" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white truncate mt-2">{filteredBloggers[0].name}</h3>
                      <p className="text-xs text-text-muted truncate">{filteredBloggers[0].nickname}</p>
                      <p className="text-base font-bold gradient-text mt-2 flex items-center justify-center gap-1">
                        <FiHeart size={16} className="text-vote-free fill-vote-free" />
                        {formatVotes(filteredBloggers[0].votes + (animatedVotes[filteredBloggers[0].id] || 0))}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3rd place */}
                <div className="order-3 sm:mt-12 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="glass rounded-2xl p-4 text-center card-hover">
                    <div className="flex justify-center">{getRankBadge(3)}</div>
                    <div className="mt-3">
                      <div className="flex justify-center">
                        <Avatar src={filteredBloggers[2].avatar} name={filteredBloggers[2].name} size="sm" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate mt-2">{filteredBloggers[2].name}</h3>
                      <p className="text-xs text-text-muted truncate">{filteredBloggers[2].nickname}</p>
                      <p className="text-sm font-bold text-white mt-2 flex items-center justify-center gap-1">
                        <FiHeart size={14} className="text-vote-free fill-vote-free" />
                        {formatVotes(filteredBloggers[2].votes + (animatedVotes[filteredBloggers[2].id] || 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Full list */}
            <div className="space-y-3">
              {filteredBloggers.map((blogger, i) => {
                const rank = i + 1;
                const extraVotes = animatedVotes[blogger.id] || 0;
                const totalVotes = blogger.votes + extraVotes;
                const maxVotes = filteredBloggers[0].votes + (animatedVotes[filteredBloggers[0].id] || 0);
                const percentage = maxVotes > 0 ? Math.round((totalVotes / maxVotes) * 100) : 0;

                return (
                  <Link
                    key={blogger.id}
                    href={`/blogger/${blogger.id}`}
                    className={`block glass rounded-xl p-4 card-hover animate-slide-up ${
                      rank <= 3 ? 'gradient-border' : ''
                    }`}
                    style={{ animationDelay: `${0.05 * i}s` }}
                    id={`leaderboard-${blogger.id}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="shrink-0">
                        {getRankBadge(rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar src={blogger.avatar} name={blogger.name} size="sm" />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white truncate">{blogger.name}</h3>
                          {extraVotes > 0 && (
                            <span className="flex items-center gap-0.5 text-xs text-success animate-fade-in">
                              <FiArrowUp size={10} />
                              +{extraVotes}
                            </span>
                          )}
                        </div>
                        <p className="text-text-muted text-sm truncate">{blogger.nickname}</p>

                        {/* Progress bar */}
                        <div className="mt-2 h-1.5 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-bg rounded-full progress-bar"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Votes */}
                      <div className="shrink-0 text-right">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <FiHeart size={16} className="text-vote-free fill-vote-free" />
                          {formatVotes(totalVotes)}
                        </div>
                        <span className="text-xs text-text-muted">{blogger.categoryName}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
