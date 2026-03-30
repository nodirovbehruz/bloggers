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
  const [customVoteCount, setCustomVoteCount] = useState(100);
  const [voteResult, setVoteResult] = useState(null); // null | 'success' | 'error'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voteCount, setVoteCount] = useState(1);
  const { t, localizedName } = useLanguage();

  // VIP pricing
  const vipPackages = [
    { count: 1, price: 10000, label: '1 голос', popular: false },
    { count: 5, price: 45000, label: '5 голосов', popular: false, save: '10%' },
    { count: 10, price: 80000, label: '10 голосов', popular: true, save: '20%' },
    { count: 50, price: 350000, label: '50 голосов', popular: false, save: '30%' },
  ];

  const calculatePrice = (count) => {
    if (count >= 50) return count * 7000;
    if (count >= 10) return count * 8000;
    if (count >= 5) return count * 9000;
    return count * 10000;
  };

  const handleFreeVote = async () => {
    setLoading(true);
    setSelectedType('free');
    setError('');
    try {
      const res = await api.castVote({
        blogger_id: blogger.id,
        vote_type: 'free',
        count: 1
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

  const handleVipVote = async (pkgOrCount) => {
    const count = typeof pkgOrCount === 'number' ? pkgOrCount : pkgOrCount.count;
    if (count < 1) return;
    
    setLoading(true);
    setSelectedType('vip');
    setVoteCount(count);
    setError('');
    try {
      // Send single request with count instead of looping
      const res = await api.castVote({
        blogger_id: blogger.id,
        vote_type: 'vip',
        count: count
      });
      setVoteResult('success');
      onVoteSuccess(res.total_votes);
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
        count: 1
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
          <h2 className="text-xl font-heading font-bold text-white">Выбор типа голоса</h2>
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
          <div className="px-6 pb-6">
            {!selectedType ? (
              /* Step 1: Choose Vote Type */
              <div className="space-y-4">
                <button
                  onClick={handleFreeVote}
                  disabled={loading}
                  className="w-full glass p-5 rounded-2xl flex items-center justify-between group transition-all duration-300 hover:border-primary/50 hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-vote-free/10 flex items-center justify-center text-vote-free">
                      <FiHeart size={24} className="fill-current" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-white font-bold">{t('vote_free')}</h4>
                      <p className="text-text-muted text-xs leading-tight">{t('vote_free_desc') || 'Бесплатный голос раз в сутки'}</p>
                    </div>
                  </div>
                  <div className="text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all">
                    <FiArrowLeft className="rotate-180" size={20} />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedType('vip_choice')}
                  className="w-full glass p-5 rounded-2xl flex items-center justify-between group transition-all duration-300 border-primary/20 bg-primary/[0.02] hover:bg-primary/[0.06] hover:border-primary/50"
                  id="choice-vip-btn"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <FiStar size={24} className="fill-current" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-white font-bold">VIP голоса</h4>
                      <p className="text-text-muted text-xs leading-tight">Без лимитов, мгновенная поддержка</p>
                    </div>
                  </div>
                  <div className="text-primary group-hover:translate-x-1 transition-all">
                    <FiArrowLeft className="rotate-180" size={20} />
                  </div>
                </button>

                <button
                  onClick={() => setSelectedType('promo_choice')}
                  className="w-full py-4 text-text-muted hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <FiGift size={16} /> У меня есть промокод
                </button>
              </div>
            ) : selectedType === 'vip_choice' || selectedType === 'vip' ? (
              /* Step 2: VIP Packages */
              <div className="animate-fade-in">
                <button 
                  onClick={() => setSelectedType(null)}
                  className="flex items-center gap-2 text-text-muted hover:text-white text-sm mb-4 transition-colors"
                >
                  <FiArrowLeft size={16} /> Назад к выбору
                </button>

                <div className="glass rounded-2xl p-5 border-primary/30 bg-primary/[0.03]">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <FiStar size={18} className="fill-current" />
                    </div>
                    <h4 className="text-white font-bold">Выберите пакет VIP голосов</h4>
                  </div>

                  {voteResult === 'error' && selectedType === 'vip' && (
                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2 mb-4">
                      <FiAlertCircle className="text-danger shrink-0" size={16} />
                      <p className="text-danger text-xs">{error}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {vipPackages.map((pkg) => (
                      <button
                        key={pkg.count}
                        onClick={() => handleVipVote(pkg)}
                        disabled={loading}
                        className={`relative p-4 rounded-2xl border text-center transition-all duration-300 disabled:opacity-50 ${
                          pkg.popular
                            ? 'border-primary bg-primary/20 shadow-lg shadow-primary/10 scale-[1.02]'
                            : 'border-white/10 bg-white/[0.02] hover:border-primary/50 hover:bg-white/[0.05]'
                        }`}
                        id={`vote-vip-${pkg.count}`}
                      >
                        {pkg.popular && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] gradient-bg text-white px-3 py-1 rounded-full font-black tracking-tighter uppercase">
                            HOT
                          </span>
                        )}
                        {pkg.save && (
                          <span className="absolute -top-2.5 right-1 text-[9px] bg-success text-white px-2 py-1 rounded-full font-black">
                            -{pkg.save}
                          </span>
                        )}
                        <div className="text-white font-black text-2xl mb-0.5">{pkg.count}</div>
                        <div className="text-text-muted text-[10px] uppercase tracking-widest font-bold mb-3">Голосов</div>
                        <div className="text-warning font-black text-sm">{formatPrice(pkg.price)} сум</div>
                      </button>
                    ))}
                  </div>

                  {/* Manual Input Section */}
                  <div className="pt-4 border-t border-white/10 mb-6">
                    <p className="text-text-muted text-[10px] font-black uppercase tracking-widest mb-3 text-center opacity-70">Или своё количество (от 1 до 10,000)</p>
                    <div className="flex flex-col gap-2">
                       <div className="relative group">
                         <input 
                           type="number" 
                           value={customVoteCount}
                           onChange={(e) => setCustomVoteCount(Math.max(1, Math.min(10000, parseInt(e.target.value) || 0)))}
                           className="w-full bg-surface-card border-2 border-white/10 rounded-2xl px-4 py-4 text-white font-black text-center text-2xl focus:border-primary transition-all outline-none"
                           min="1"
                           max="10000"
                           placeholder="Например: 1000"
                         />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted text-xs font-bold uppercase tracking-widest pointer-events-none">
                           Голосов
                         </span>
                       </div>
                       <button
                         onClick={() => handleVipVote(customVoteCount)}
                         disabled={loading || customVoteCount < 1}
                         className="w-full gradient-bg text-white py-4 rounded-2xl font-black text-lg hover:opacity-90 transition-all flex flex-col items-center justify-center shadow-xl shadow-primary/20"
                       >
                         <span className="text-xs uppercase tracking-[3px] opacity-80 mb-0.5">Оплатить и подтвердить</span>
                         <span>{formatPrice(calculatePrice(customVoteCount))} сум</span>
                         {customVoteCount >= 50 && (
                           <span className="absolute -bottom-2 bg-success text-white text-[9px] px-3 py-1 rounded-full font-black uppercase shadow-lg">
                             Лучшая цена: 7000 сум за голос
                           </span>
                         )}
                       </button>
                    </div>
                  </div>

                  {loading && selectedType === 'vip' && (
                    <div className="flex items-center justify-center gap-3 py-4 text-warning">
                      <div className="w-5 h-5 border-2 border-warning/30 border-t-warning rounded-full animate-spin"></div>
                      <span className="text-sm font-bold uppercase tracking-wider">Ожидание оплаты...</span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="text-[10px] text-text-muted font-bold uppercase">Через:</span>
                    <span className="text-xs font-bold text-white">Payme</span>
                    <span className="text-xs font-bold text-white">Click</span>
                    <span className="text-xs font-bold text-white">Uzum</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Step 2: Promo Code */
              <div className="animate-fade-in">
                <button 
                  onClick={() => setSelectedType(null)}
                  className="flex items-center gap-2 text-text-muted hover:text-white text-sm mb-4 transition-colors"
                >
                  <FiArrowLeft size={16} /> Назад
                </button>

                <div className="glass rounded-2xl p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                      <FiGift className="text-primary" size={32} />
                    </div>
                    <h4 className="text-white font-bold">Промокод от спонсора</h4>
                    <p className="text-text-muted text-xs">Введите секретный код для получения голоса</p>
                  </div>

                  {voteResult === 'error' && selectedType === 'promo' && (
                    <div className="p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-center gap-2 mb-4">
                      <FiAlertCircle className="text-danger shrink-0" size={16} />
                      <p className="text-danger text-xs">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX"
                      className="w-full bg-surface border border-white/10 rounded-xl px-4 py-4 text-white text-center text-xl font-mono focus:outline-none focus:border-primary transition-all tracking-[4px]"
                      id="promo-code-input"
                    />
                    <button
                      onClick={handlePromoVote}
                      disabled={loading || !promoCode.trim()}
                      className="w-full gradient-bg text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      id="promo-vote-btn"
                    >
                      {loading && selectedType === 'promo' ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>Применить код</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
