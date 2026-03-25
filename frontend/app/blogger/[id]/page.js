'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../../lib/api';
import { FiHeart, FiBarChart2, FiArrowLeft, FiAlertCircle, FiCheck, FiLogIn, FiX, FiGift, FiStar } from 'react-icons/fi';
import { FaInstagram, FaYoutube, FaTiktok, FaTelegram } from 'react-icons/fa';
import { CategoryIcon } from '../../lib/categoryIcons';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BloggerPage() {
  const params = useParams();
  const router = useRouter();
  const [blogger, setBlogger] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { t, localizedName, localizedDesc } = useLanguage();

  useEffect(() => {
    const fetchBlogger = async () => {
      setLoading(true);
      try {
        const [bloggerData, categoriesData] = await Promise.all([
          api.getBlogger(params.id),
          api.getCategories().catch(() => []),
        ]);
        setBlogger(bloggerData);
        const cats = Array.isArray(categoriesData) ? categoriesData : [];
        setCategory(cats.find(c => c.id === bloggerData.category_id));
      } catch (err) {
        console.error('Failed to fetch blogger:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogger();
  }, [params.id]);

  const isLoggedIn = () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  };

  const handleVoteClick = () => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    setShowVoteModal(true);
  };

  const onVoteSuccess = (newTotal) => {
    setBlogger(prev => ({ ...prev, total_votes: newTotal }));
  };

  const formatVotes = (n) => (n || 0).toLocaleString('ru-RU');

  const socialLinks = blogger ? [
    { key: 'instagram', url: blogger.instagram_url, icon: <FaInstagram />, color: 'bg-gradient-to-br from-purple-500 to-pink-500', label: 'Instagram' },
    { key: 'youtube', url: blogger.youtube_url, icon: <FaYoutube />, color: 'bg-red-600', label: 'YouTube' },
    { key: 'tiktok', url: blogger.tiktok_url, icon: <FaTiktok />, color: 'bg-black border border-border', label: 'TikTok' },
    { key: 'telegram', url: blogger.telegram_url, icon: <FaTelegram />, color: 'bg-blue-500', label: 'Telegram' },
  ].filter(s => s.url) : [];

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="h-6 w-40 bg-surface-card rounded animate-pulse mb-8"></div>
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
            <div className="w-full sm:w-64 aspect-square bg-surface-card rounded-2xl animate-pulse"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 w-48 bg-surface-card rounded animate-pulse"></div>
              <div className="h-5 w-32 bg-surface-card rounded animate-pulse"></div>
              <div className="h-20 bg-surface-card rounded animate-pulse"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-24 bg-surface-card rounded-xl animate-pulse"></div>
                <div className="h-24 bg-surface-card rounded-xl animate-pulse"></div>
              </div>
              <div className="h-14 bg-surface-card rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blogger) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-heading font-bold text-white mb-2">Блогер не найден</h2>
          <Link href="/categories" className="text-primary hover:underline">Назад к категориям</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8"
        >
          <FiArrowLeft size={18} />
          <span>Назад к категориям</span>
        </Link>

        {/* Profile section */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
          {/* Photo */}
          <div className="shrink-0">
            <div className="relative w-full sm:w-64 aspect-square rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30"></div>
              {blogger.avatar_url && (
                <img
                  src={blogger.avatar_url}
                  alt={blogger.full_name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-1">
              {blogger.full_name}
            </h1>
            <p className="text-primary font-medium mb-3">{blogger.nickname}</p>

            {category && (
              <span className="inline-flex items-center gap-1.5 gradient-bg text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <CategoryIcon slug={category.slug} size={14} /> {localizedName(category)}
              </span>
            )}

            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              {localizedDesc(blogger) || blogger.description}
            </p>

            {/* Vote stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-vote-free mb-1">
                  <FiHeart className="fill-current" size={18} />
                  <span className="text-xs font-semibold uppercase">Голосов</span>
                </div>
                <p className="text-2xl font-heading font-bold text-white">{formatVotes(blogger.total_votes)}</p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  <FiBarChart2 size={18} />
                  <span className="text-xs font-semibold uppercase">Категория</span>
                </div>
                <p className="text-sm font-heading font-bold text-white">{localizedName(category) || '—'}</p>
              </div>
            </div>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="mb-6">
                <p className="text-text-muted text-sm mb-3">{t('blogger_social')}:</p>
                <div className="flex gap-3">
                  {socialLinks.map(s => (
                    <a key={s.key} href={s.url} target="_blank" rel="noopener noreferrer"
                      className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center text-white text-lg hover:scale-110 transition-transform`}
                      title={s.label}>
                      {s.icon}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Vote button */}
            <button
              onClick={handleVoteClick}
              className="w-full gradient-bg text-white font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/30 glow-purple vote-btn flex items-center justify-center gap-2"
              id="vote-for-blogger"
            >
              <FiHeart size={20} />
              Голосовать
            </button>
          </div>
        </div>
      </div>

      {/* === VOTE MODAL === */}
      {showVoteModal && (
        <VoteModal
          blogger={blogger}
          category={category}
          onClose={() => setShowVoteModal(false)}
          onVoteSuccess={onVoteSuccess}
        />
      )}

      {/* === LOGIN REQUIRED MODAL === */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowLoginModal(false)}>
          <div className="glass rounded-2xl p-8 max-w-sm w-full animate-slide-up text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
              <FiLogIn className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">Требуется авторизация</h3>
            <p className="text-text-secondary text-sm mb-6">
              Чтобы проголосовать, необходимо войти по номеру телефона
            </p>
            <div className="space-y-3">
              <Link
                href={`/login?redirect=/blogger/${blogger.id}`}
                className="block w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
              >
                Войти / Регистрация
              </Link>
              <button onClick={() => setShowLoginModal(false)}
                className="block w-full glass text-text-secondary font-medium py-3.5 rounded-xl hover:text-white hover:bg-surface-hover transition-all">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// VOTE MODAL COMPONENT (inline)
// ==========================================
function VoteModal({ blogger, category, onClose, onVoteSuccess }) {
  const [selectedType, setSelectedType] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [voteResult, setVoteResult] = useState(null); // null | 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voteCount, setVoteCount] = useState(1);
  const { t, localizedName } = useLanguage();

  // VIP pricing
  const VIP_PRICE = 10000; // сум
  const vipPackages = [
    { count: 1, price: 10000, label: '1 голос', popular: false },
    { count: 5, price: 45000, label: '5 голосов', popular: false, save: '10%' },
    { count: 10, price: 80000, label: '10 голосов', popular: true, save: '20%' },
    { count: 50, price: 350000, label: '50 голосов', popular: false, save: '30%' },
  ];

  const handleFreeVote = async () => {
    setLoading(true);
    setSelectedType('free');
    setError('');
    try {
      const res = await api.castVote({
        blogger_id: blogger.id,
        vote_type: 'free',
      });
      setVoteResult('success');
      onVoteSuccess(res.total_votes);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.detail || 'Ошибка голосования');
      setVoteResult('error');
    } finally {
      setLoading(false);
    }
  };

  const handleVipVote = async (pkg) => {
    setLoading(true);
    setSelectedType('vip');
    setVoteCount(pkg.count);
    setError('');
    try {
      // For each vote in the package
      let lastRes;
      for (let i = 0; i < pkg.count; i++) {
        lastRes = await api.castVote({
          blogger_id: blogger.id,
          vote_type: 'vip',
        });
      }
      setVoteResult('success');
      onVoteSuccess(lastRes.total_votes);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.detail || 'Ошибка оплаты');
      setVoteResult('error');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoVote = async () => {
    if (!promoCode.trim()) return;
    setLoading(true);
    setSelectedType('promo');
    setError('');
    try {
      const res = await api.castVote({
        blogger_id: blogger.id,
        vote_type: 'promo',
        promo_code: promoCode.trim(),
      });
      setVoteResult('success');
      onVoteSuccess(res.total_votes);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.detail || 'Неверный промокод');
      setVoteResult('error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (n) => n.toLocaleString('ru-RU');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in" onClick={onClose}>
      <div
        className="glass-dark rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors" id="close-vote-modal">
            <FiX size={24} />
          </button>

          {/* Blogger info */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent shrink-0">
              {blogger?.avatar_url && (
                <img src={blogger.avatar_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{blogger?.full_name}</h3>
              <p className="text-text-muted text-sm">{blogger?.nickname}</p>
            </div>
          </div>

          {category && (
            <span className="inline-flex items-center gap-1.5 text-xs gradient-bg text-white px-3 py-1 rounded-full font-semibold mb-2">
              <CategoryIcon slug={category.slug} size={12} /> {localizedName(category)}
            </span>
          )}
          <h2 className="text-xl font-heading font-bold text-white">{t('vote_choose_type')}</h2>
        </div>

        {/* Success state */}
        {voteResult === 'success' && (
          <div className="px-6 pb-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <FiCheck className="text-success" size={40} />
              </div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                {selectedType === 'vip' ? `${voteCount} VIP ${voteCount > 1 ? 'голосов' : 'голос'} принят!` : 'Голос принят!'}
              </h3>
              <p className="text-text-secondary text-sm">Спасибо за поддержку!</p>
            </div>
          </div>
        )}


        {/* Vote options */}
        {voteResult !== 'success' && (
          <div className="px-6 pb-6 space-y-4">
            {/* ===== FREE VOTE ===== */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❤️</span>
                  <div>
                    <span className="text-white font-semibold">{t('vote_free')}</span>
                    <p className="text-text-muted text-xs">{t('vote_free_desc')}</p>
                  </div>
                </div>
                <span className="text-success font-bold text-sm bg-success/10 px-3 py-1 rounded-full">FREE</span>
              </div>

              {/* Free vote error - shown here only */}
              {voteResult === 'error' && selectedType === 'free' && (
                <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 mb-3">
                  <FiAlertCircle className="text-danger shrink-0" size={14} />
                  <p className="text-danger text-xs">{error}</p>
                </div>
              )}

              <button
                onClick={handleFreeVote}
                disabled={loading}
                className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 vote-btn flex items-center justify-center gap-2"
                id="vote-free-btn"
              >
                {loading && selectedType === 'free' ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Голосование...</>
                ) : (
                  <><FiHeart size={16} />{t('vote_free_btn')}</>
                )}
              </button>
            </div>

            {/* ===== VIP VOTES ===== */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⭐</span>
                <div>
                  <span className="text-white font-semibold">VIP голоса</span>
                  <p className="text-text-muted text-xs">Неограниченно, с оплатой</p>
                </div>
              </div>

              {/* VIP error - shown here only */}
              {voteResult === 'error' && selectedType === 'vip' && (
                <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 mb-3">
                  <FiAlertCircle className="text-danger shrink-0" size={14} />
                  <p className="text-danger text-xs">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-4">
                {vipPackages.map((pkg) => (
                  <button
                    key={pkg.count}
                    onClick={() => handleVipVote(pkg)}
                    disabled={loading}
                    className={`relative p-3 rounded-xl border text-center transition-all disabled:opacity-50 ${
                      pkg.popular
                        ? 'border-primary bg-primary/10 hover:bg-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-surface-hover'
                    }`}
                    id={`vote-vip-${pkg.count}`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] gradient-bg text-white px-2 py-0.5 rounded-full font-bold">
                        ХИТ
                      </span>
                    )}
                    {pkg.save && (
                      <span className="absolute -top-2 right-1 text-[10px] bg-success text-white px-1.5 py-0.5 rounded-full font-bold">
                        -{pkg.save}
                      </span>
                    )}
                    <div className="text-white font-bold text-lg">{pkg.count}</div>
                    <div className="text-text-muted text-xs mb-1">{pkg.count > 1 ? 'голосов' : 'голос'}</div>
                    <div className="text-warning font-bold text-sm">{formatPrice(pkg.price)} сум</div>
                  </button>
                ))}
              </div>

              {loading && selectedType === 'vip' && (
                <div className="flex items-center justify-center gap-2 py-2 text-warning">
                  <div className="w-4 h-4 border-2 border-warning/30 border-t-warning rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Обработка оплаты...</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/50">
                <span className="text-xs text-text-muted">Оплата через:</span>
                <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded font-semibold">Payme</span>
                <span className="text-xs bg-cyan-600/20 text-cyan-400 px-2 py-0.5 rounded font-semibold">Click</span>
                <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded font-semibold">Uzum</span>
              </div>
            </div>

            {/* ===== PROMO CODE ===== */}
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎁</span>
                <div>
                  <span className="text-white font-semibold text-sm">Промокод от спонсора</span>
                  <p className="text-text-muted text-xs">Бесплатный голос по промокоду</p>
                </div>
              </div>

              {/* Promo error - shown here only */}
              {voteResult === 'error' && selectedType === 'promo' && (
                <div className="p-2.5 rounded-lg bg-danger/10 border border-danger/20 flex items-center gap-2 mb-3">
                  <FiAlertCircle className="text-danger shrink-0" size={14} />
                  <p className="text-danger text-xs">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Введите промокод"
                  className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors font-mono tracking-wider"
                  id="promo-code-input"
                />
                <button
                  onClick={handlePromoVote}
                  disabled={loading || !promoCode.trim()}
                  className="gradient-bg text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1"
                  id="promo-vote-btn"
                >
                  {loading && selectedType === 'promo' ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><FiGift size={14} />Применить</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
