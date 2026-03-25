'use client';

import { useState } from 'react';
import { FiX, FiHeart, FiStar, FiGift } from 'react-icons/fi';

export default function VoteModal({ blogger, isOpen, onClose }) {
  const [selectedType, setSelectedType] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [voteSuccess, setVoteSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVote = async (type) => {
    setLoading(true);
    setSelectedType(type);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setVoteSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setVoteSuccess(false);
      setSelectedType(null);
      onClose();
    }, 2000);
  };

  const handlePromoVote = async () => {
    if (!promoCode.trim()) return;
    setLoading(true);
    setSelectedType('promo');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setVoteSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      setVoteSuccess(false);
      setSelectedType(null);
      setPromoCode('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="glass-dark rounded-2xl w-full max-w-md overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
            id="close-vote-modal"
          >
            <FiX size={24} />
          </button>

          {/* Blogger info */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg">
              {blogger?.name?.[0]}
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">{blogger?.name}</h3>
              <p className="text-text-muted text-sm">{blogger?.nickname}</p>
            </div>
          </div>

          <p className="text-text-secondary text-sm mb-2">{blogger?.categoryName}</p>
          <h2 className="text-xl font-heading font-bold text-white">Начинайте голосок</h2>
        </div>

        {/* Vote options */}
        <div className="px-6 pb-6 space-y-3">
          {/* Free vote */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">❤️</span>
                <span className="text-white font-semibold">Бесплатный голос</span>
              </div>
              <span className="text-success font-bold text-sm bg-success/10 px-3 py-1 rounded-full">FREE</span>
            </div>
            <button
              onClick={() => handleVote('free')}
              disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 vote-btn"
              id="vote-free-btn"
            >
              {loading && selectedType === 'free' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Голосование...
                </span>
              ) : voteSuccess && selectedType === 'free' ? (
                '✅ Голос принят!'
              ) : (
                'Голосовать бесплатно'
              )}
            </button>
          </div>

          {/* VIP vote */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <span className="text-white font-semibold">VIP голос</span>
              </div>
              <span className="text-warning font-bold text-sm bg-warning/10 px-3 py-1 rounded-full">10,000 сум</span>
            </div>
            <button
              onClick={() => handleVote('vip')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-warning to-orange-500 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 vote-btn"
              id="vote-vip-btn"
            >
              {loading && selectedType === 'vip' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Оплата...
                </span>
              ) : voteSuccess && selectedType === 'vip' ? (
                '✅ VIP голос принят!'
              ) : (
                'Купить'
              )}
            </button>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-xs text-text-muted">Оплата через:</span>
              <span className="text-xs text-text-secondary font-medium">Payme</span>
              <span className="text-xs text-text-secondary font-medium">Click</span>
              <span className="text-xs text-text-secondary font-medium">Uzum</span>
            </div>
          </div>

          {/* Promo code */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🎁</span>
              <span className="text-white font-semibold text-sm">Промокод от спонсора</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Введите промокод"
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                id="promo-code-input"
              />
              <button
                onClick={handlePromoVote}
                disabled={loading || !promoCode.trim()}
                className="gradient-bg text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                id="promo-vote-btn"
              >
                Применить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
