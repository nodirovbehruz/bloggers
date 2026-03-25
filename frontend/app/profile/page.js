'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../lib/api';
import {
  FiUser, FiPhone, FiClock, FiHeart, FiStar, FiEdit3,
  FiLogOut, FiCheckCircle, FiXCircle, FiAlertCircle,
  FiInstagram, FiYoutube, FiSend, FiDollarSign
} from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', '');

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('votes');
  const { t } = useLanguage();

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      router.push('/login?redirect=/profile');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [userData, votesData] = await Promise.all([
        api.getMe(),
        api.getMyVotes().catch(() => []),
      ]);
      setUser(userData);
      setVotes(Array.isArray(votesData) ? votesData : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        router.push('/login?redirect=/profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('user_phone');
    }
    router.push('/');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getVoteTypeLabel = (type) => {
    const types = {
      free: { label: 'Бесплатный', color: 'text-green-400', bg: 'bg-green-400/10' },
      vip: { label: 'VIP', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      coin: { label: 'Монеты', color: 'text-blue-400', bg: 'bg-blue-400/10' },
      promo: { label: 'Промо', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    };
    return types[type] || { label: type, color: 'text-gray-400', bg: 'bg-gray-400/10' };
  };

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: 'На рассмотрении', icon: FiClock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      approved: { label: 'Одобрена', icon: FiCheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
      rejected: { label: 'Отклонена', icon: FiXCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
      blocked: { label: 'Заблокирована', icon: FiAlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    };
    return statuses[status] || statuses.pending;
  };

  const freeVotes = votes.filter(v => v.vote_type === 'free' && !v.is_cancelled);
  const paidVotes = votes.filter(v => v.vote_type !== 'free' && !v.is_cancelled);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-white/20 border-t-[#9810FA] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const bloggerApp = user.blogger_application;

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(336.88deg, #101217 53.39%, #000719 90.76%)' }}>
      <div className="max-w-4xl mx-auto">

        {/* Profile Header Card */}
        <div className="rounded-2xl p-6 sm:p-8 mb-6" style={{ background: 'rgba(20, 28, 49, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(152, 16, 250, 0.2)', border: '2px solid rgba(152, 16, 250, 0.4)' }}
            >
              {bloggerApp?.avatar_url ? (
                <img
                  src={bloggerApp.avatar_url.startsWith('/uploads') ? `${API_BASE}${bloggerApp.avatar_url}` : bloggerApp.avatar_url}
                  alt="" className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FiUser size={32} className="text-[#9810FA]" />
              )}
            </div>

            <div className="flex-1">
              <h1
                className="text-white text-xl sm:text-2xl font-semibold mb-1"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {bloggerApp?.full_name || user.phone}
              </h1>
              <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
                <span className="flex items-center gap-1"><FiPhone size={14} /> {user.phone}</span>
                <span className="flex items-center gap-1"><FiClock size={14} /> С {formatDate(user.created_at)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#9810FA]/10 text-[#9810FA]">
                  {user.role === 'admin' ? t('admin_dashboard') : t('nav_profile')}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400">
                  {user.coins} монет
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <FiLogOut size={16} /> {t('profile_logout')}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(20, 28, 49, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-2xl font-bold text-white mb-1">{votes.length}</div>
            <div className="text-gray-500 text-xs">{t('profile_votes')}</div>
          </div>
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(20, 28, 49, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-2xl font-bold text-green-400 mb-1">{freeVotes.length}</div>
            <div className="text-gray-500 text-xs">{t('profile_free_votes')}</div>
          </div>
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(20, 28, 49, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="text-2xl font-bold text-yellow-400 mb-1">{paidVotes.length}</div>
            <div className="text-gray-500 text-xs">{t('profile_paid_votes')}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'votes', label: t('profile_history'), icon: FiHeart },
            { key: 'paid', label: t('profile_paid_tab'), icon: FiDollarSign },
            { key: 'application', label: t('profile_application'), icon: FiStar },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-[#9810FA] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Votes Tab */}
        {activeTab === 'votes' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(20, 28, 49, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              {t('profile_history')}
            </h2>
            {votes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiHeart size={40} className="mx-auto mb-3 opacity-30" />
                <p>{t('profile_no_votes')}</p>
                <Link href="/categories" className="text-[#9810FA] text-sm mt-2 inline-block hover:underline">
                  {t('profile_start_vote')}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {votes.map((vote) => {
                  const typeInfo = getVoteTypeLabel(vote.vote_type);
                  return (
                    <div
                      key={vote.id}
                      className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white/5"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#141C31] overflow-hidden shrink-0">
                        {vote.blogger_avatar ? (
                          <img
                            src={vote.blogger_avatar.startsWith('/uploads') ? `${API_BASE}${vote.blogger_avatar}` : vote.blogger_avatar}
                            alt="" className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiUser size={16} className="text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{vote.blogger_name}</div>
                        <div className="text-gray-500 text-xs">@{vote.blogger_nickname}</div>
                      </div>

                      {/* Type badge */}
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color} ${typeInfo.bg}`}>
                        {typeInfo.label}
                      </span>

                      {/* Date */}
                      <div className="text-gray-500 text-xs whitespace-nowrap hidden sm:block">
                        {formatDate(vote.created_at)}
                      </div>

                      {vote.is_cancelled && (
                        <span className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-400">Отменён</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Paid Votes Tab */}
        {activeTab === 'paid' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(20, 28, 49, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Платные голоса (VIP / Монеты / Промо)
            </h2>
            {paidVotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiDollarSign size={40} className="mx-auto mb-3 opacity-30" />
                <p>Нет платных голосов</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paidVotes.map((vote) => {
                  const typeInfo = getVoteTypeLabel(vote.vote_type);
                  return (
                    <div
                      key={vote.id}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#141C31] overflow-hidden shrink-0">
                        {vote.blogger_avatar ? (
                          <img
                            src={vote.blogger_avatar.startsWith('/uploads') ? `${API_BASE}${vote.blogger_avatar}` : vote.blogger_avatar}
                            alt="" className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiUser size={16} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{vote.blogger_name}</div>
                        <div className="text-gray-500 text-xs">@{vote.blogger_nickname}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeInfo.color} ${typeInfo.bg}`}>
                        {typeInfo.label}
                      </span>
                      <div className="text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(vote.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Blogger Application Tab */}
        {activeTab === 'application' && (
          <div className="rounded-2xl p-6" style={{ background: 'rgba(20, 28, 49, 0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h2 className="text-white text-lg font-semibold mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Заявка на участие
            </h2>

            {!bloggerApp ? (
              <div className="text-center py-12">
                <FiEdit3 size={40} className="mx-auto mb-3 text-gray-500 opacity-30" />
                <p className="text-gray-400 mb-4">Вы ещё не подали заявку на участие</p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90"
                  style={{ background: '#9810FA' }}
                >
                  <FiEdit3 size={16} /> Подать заявку
                </Link>
              </div>
            ) : (
              <div>
                {/* Status Badge */}
                {(() => {
                  const statusInfo = getStatusInfo(bloggerApp.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 ${statusInfo.bg}`}>
                      <StatusIcon size={18} className={statusInfo.color} />
                      <span className={`font-medium ${statusInfo.color}`}>Статус: {statusInfo.label}</span>
                    </div>
                  );
                })()}

                {/* Application Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Полное имя</label>
                    <div className="text-white font-medium">{bloggerApp.full_name}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Никнейм</label>
                    <div className="text-white font-medium">@{bloggerApp.nickname}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Категория</label>
                    <div className="text-white font-medium">{bloggerApp.category_name}</div>
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs mb-1 block">Телефон</label>
                    <div className="text-white font-medium">{bloggerApp.phone}</div>
                  </div>
                  {bloggerApp.description && (
                    <div className="sm:col-span-2">
                      <label className="text-gray-500 text-xs mb-1 block">Описание</label>
                      <div className="text-white text-sm">{bloggerApp.description}</div>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {bloggerApp.instagram_url && (
                    <a href={bloggerApp.instagram_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pink-500/10 text-pink-400 text-sm hover:bg-pink-500/20 transition-colors">
                      <FiInstagram size={16} /> Instagram
                    </a>
                  )}
                  {bloggerApp.youtube_url && (
                    <a href={bloggerApp.youtube_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
                      <FiYoutube size={16} /> YouTube
                    </a>
                  )}
                  {bloggerApp.telegram_url && (
                    <a href={bloggerApp.telegram_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors">
                      <FiSend size={16} /> Telegram
                    </a>
                  )}
                </div>

                {/* Dates */}
                <div className="flex gap-4 text-gray-500 text-xs mb-6">
                  <span>Подана: {formatDate(bloggerApp.created_at)}</span>
                  {bloggerApp.updated_at && <span>Обновлена: {formatDate(bloggerApp.updated_at)}</span>}
                </div>

                {/* Actions for rejected/pending */}
                {(bloggerApp.status === 'rejected' || bloggerApp.status === 'pending') && (
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold transition-all hover:opacity-90"
                    style={{ background: '#9810FA' }}
                  >
                    <FiEdit3 size={16} />
                    {bloggerApp.status === 'rejected' ? 'Отправить повторно' : 'Редактировать заявку'}
                  </Link>
                )}

                {/* If approved, show votes info */}
                {bloggerApp.status === 'approved' && (
                  <div className="p-4 rounded-xl bg-green-400/10 border border-green-400/20">
                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                      <FiCheckCircle size={18} /> Ваш профиль одобрен!
                    </div>
                    <p className="text-gray-400 text-sm">
                      Всего голосов: <span className="text-white font-bold">{bloggerApp.total_votes}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
