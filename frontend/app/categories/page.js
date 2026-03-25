'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BloggerCard from '../components/BloggerCard';
import api from '../lib/api';
import { FiSearch, FiChevronDown, FiRefreshCw } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

function CategoriesPageInner() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';
  
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes');
  const [categories, setCategories] = useState([]);
  const [bloggers, setBloggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, localizedName } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catsData, bloggersData] = await Promise.all([
          api.getCategories().catch(() => []),
          api.getBloggers({ page: 1, per_page: 100 }).catch(() => ({ bloggers: [] })),
        ]);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setBloggers((bloggersData.bloggers || []).map(b => ({
          id: b.id,
          name: b.full_name,
          nickname: b.nickname,
          avatar: b.avatar_url,
          votes: b.total_votes || 0,
          category: (Array.isArray(catsData) ? catsData : []).find(c => c.id === b.category_id)?.slug || '',
          categoryName: localizedName((Array.isArray(catsData) ? catsData : []).find(c => c.id === b.category_id)) || '',
          category_id: b.category_id,
        })));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const allFilters = [
    { key: 'all', label: t('leaderboard_all') },
    ...categories.map(cat => ({ key: cat.slug, label: localizedName(cat) })),
  ];

  const filteredBloggers = useMemo(() => {
    let result = [...bloggers];

    // Filter by category
    if (activeFilter !== 'all') {
      result = result.filter(b => b.category === activeFilter);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.name.toLowerCase().includes(query) ||
        b.nickname.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'votes':
        result.sort((a, b) => b.votes - a.votes);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
    }

    return result;
  }, [activeFilter, searchQuery, sortBy, bloggers]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search bar */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-surface-card border border-border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
            id="search-bloggers"
          />
        </div>

        {/* Category filter chips */}
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {allFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.key
                  ? 'gradient-bg text-white shadow-lg shadow-primary/20'
                  : 'glass text-text-secondary hover:text-white hover:bg-surface-hover'
              }`}
              id={`filter-${filter.key}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Sort options */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-text-secondary text-sm">
            {loading ? (
              <span className="flex items-center gap-2">
                <FiRefreshCw className="animate-spin" size={14} /> Загрузка...
              </span>
            ) : (
              <>{t('stats_bloggers')}: <span className="text-white font-semibold">{filteredBloggers.length}</span></>
            )}
          </p>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-surface-card border border-border rounded-lg px-4 py-2 pr-10 text-sm text-white focus:outline-none focus:border-primary cursor-pointer"
              id="sort-select"
            >
              <option value="votes">{t('stats_votes')}</option>
              <option value="name">{t('register_fullname')}</option>
              <option value="newest">{t('next')}</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
          </div>
        </div>

        {/* Blogger grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="h-64 bg-surface-card rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredBloggers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredBloggers.map((blogger, i) => (
              <div key={blogger.id} className="animate-slide-up" style={{ animationDelay: `${0.05 * i}s` }}>
                <BloggerCard blogger={blogger} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-heading font-semibold text-white mb-2">{t('no_results')}</h3>
            <p className="text-text-secondary">{t('no_results')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <CategoriesPageInner />
    </Suspense>
  );
}
