'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiHeart, FiAward, FiDollarSign, FiTrendingUp, FiActivity, FiArrowUp, FiArrowDown, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import api from '../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setStats(data);
    } catch (err) {
      setError(err.detail || 'Failed to load dashboard');
      // Fallback to mock data when backend is not running
      setStats({
        total_users: 0,
        total_bloggers: 0,
        total_votes: 0,
        total_revenue: 0,
        pending_bloggers: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num?.toLocaleString() || '0';
  };

  const statCards = stats ? [
    { label: 'Пользователей', value: formatNumber(stats.total_users), icon: <FiUsers />, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Блогеров', value: formatNumber(stats.total_bloggers), icon: <FiAward />, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Голосов', value: formatNumber(stats.total_votes), icon: <FiHeart />, color: 'text-vote-free', bg: 'bg-vote-free/10' },
    { label: 'Доход', value: formatNumber(stats.total_revenue) + ' сум', icon: <FiDollarSign />, color: 'text-success', bg: 'bg-success/10' },
  ] : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">Dashboard</h1>
          <p className="text-text-secondary">Обзор платформы голосования</p>
        </div>
        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="flex items-center gap-2 glass px-4 py-2 rounded-lg text-text-secondary hover:text-white transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          Обновить
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="glass rounded-xl p-4 mb-6 border-l-4 border-warning">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-warning shrink-0" size={20} />
            <div>
              <p className="text-white font-semibold text-sm">Бекенд недоступен</p>
              <p className="text-text-muted text-xs">{error}. Показаны локальные данные.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="h-10 w-10 bg-surface rounded-xl mb-3"></div>
              <div className="h-8 w-20 bg-surface rounded mb-2"></div>
              <div className="h-4 w-16 bg-surface rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <div key={i} className="glass rounded-xl p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-heading font-bold text-white">{stat.value}</p>
              <p className="text-text-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Pending bloggers alert */}
      {stats && stats.pending_bloggers > 0 && (
        <div className="glass rounded-xl p-4 mb-6 border-l-4 border-primary">
          <div className="flex items-center gap-3">
            <FiActivity className="text-primary shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                {stats.pending_bloggers} заявок ожидают модерации
              </p>
              <p className="text-text-muted text-xs">Перейдите в раздел «Блогеры» для модерации</p>
            </div>
            <a href="/admin/bloggers" className="gradient-bg text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
              Модерировать
            </a>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Блогеры', desc: 'Управление участниками', href: '/admin/bloggers', icon: <FiAward />, color: 'text-warning' },
          { label: 'Голоса', desc: 'Мониторинг голосования', href: '/admin/votes', icon: <FiHeart />, color: 'text-vote-free' },
          { label: 'Платежи', desc: 'VIP голоса и доход', href: '/admin/payments', icon: <FiDollarSign />, color: 'text-success' },
          { label: 'Настройки', desc: 'Конфигурация конкурса', href: '/admin/settings', icon: <FiTrendingUp />, color: 'text-primary' },
        ].map((link, i) => (
          <a key={i} href={link.href} className="glass rounded-xl p-5 card-hover group cursor-pointer block">
            <div className={`w-10 h-10 rounded-xl bg-surface flex items-center justify-center ${link.color} mb-3 group-hover:scale-110 transition-transform`}>
              {link.icon}
            </div>
            <p className="text-white font-semibold">{link.label}</p>
            <p className="text-text-muted text-sm">{link.desc}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
