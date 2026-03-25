'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiAlertTriangle, FiXCircle, FiDownload, FiRefreshCw, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../lib/api';

export default function AdminVotesPage() {
  const [filter, setFilter] = useState('all');
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 30;

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: perPage };
      if (filter === 'vip') params.vote_type = 'vip';
      if (filter === 'free') params.vote_type = 'free';

      const data = await api.request(`/admin/votes?${new URLSearchParams(params)}`);
      setVotes(data.votes || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.detail || 'Failed to load votes');
      setVotes([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  const handleCancelVote = async (id) => {
    setActionLoading(id);
    try {
      await api.cancelVote(id);
      showToast('Голос отменён');
      fetchVotes();
    } catch (err) {
      showToast(err.detail || 'Ошибка отмены голоса', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    // CSV export
    const headers = ['ID', 'User ID', 'Blogger ID', 'Type', 'IP', 'Country', 'Date'];
    const rows = votes.map(v => [v.id, v.user_id, v.blogger_id, v.vote_type, v.ip_address, v.country, v.created_at]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `votes_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Экспорт завершён');
  };

  const totalPages = Math.ceil(total / perPage);
  const cancelledCount = votes.filter(v => v.is_cancelled).length;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-slide-up ${
          toast.type === 'error' ? 'bg-danger' : 'bg-success'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Управление голосами</h1>
          <p className="text-text-secondary text-sm mt-1">
            {loading ? 'Загрузка...' : `Всего: ${total} голосов`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchVotes}
            disabled={loading}
            className="flex items-center gap-2 glass text-text-secondary hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleExport}
            disabled={votes.length === 0}
            className="flex items-center gap-2 glass text-text-secondary hover:text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-30"
          >
            <FiDownload size={16} />
            Экспорт
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-4 mb-6 border-l-4 border-warning">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-warning" size={20} />
            <p className="text-white text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Cancelled alert */}
      {cancelledCount > 0 && (
        <div className="glass rounded-xl p-4 mb-6 border-l-4 border-warning">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="text-warning shrink-0" size={20} />
            <div>
              <p className="text-white font-semibold text-sm">Отменённые голоса</p>
              <p className="text-text-muted text-xs">{cancelledCount} голосов на этой странице были отменены</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'Все голоса' },
          { key: 'vip', label: '⭐ VIP' },
          { key: 'free', label: '❤️ Бесплатные' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key ? 'gradient-bg text-white' : 'glass text-text-secondary hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">ID</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">User ID</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Blogger ID</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Тип</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">IP</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Страна</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Время</th>
                <th className="text-right py-3 px-4 text-text-muted font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[...Array(8)].map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-surface rounded animate-pulse w-16"></div></td>
                    ))}
                  </tr>
                ))
              ) : votes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    Голоса не найдены
                  </td>
                </tr>
              ) : (
                votes.map((v) => (
                  <tr key={v.id} className={`border-b border-border/50 hover:bg-surface-hover transition-colors ${v.is_cancelled ? 'opacity-50 line-through' : ''}`}>
                    <td className="py-3 px-4 text-text-muted">#{v.id}</td>
                    <td className="py-3 px-4 text-white">{v.user_id}</td>
                    <td className="py-3 px-4 text-white">{v.blogger_id}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        v.vote_type === 'vip' ? 'bg-warning/10 text-warning' :
                        v.vote_type === 'promo' ? 'bg-primary/10 text-primary' :
                        'bg-success/10 text-success'
                      }`}>
                        {v.vote_type?.toUpperCase() || 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-mono text-xs">{v.ip_address || '-'}</td>
                    <td className="py-3 px-4 text-text-secondary">{v.country || '-'}</td>
                    <td className="py-3 px-4 text-text-muted text-xs">
                      {v.created_at ? new Date(v.created_at).toLocaleString('ru-RU') : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {v.is_cancelled ? (
                          <span className="text-xs text-danger">Отменён</span>
                        ) : (
                          <button
                            onClick={() => handleCancelVote(v.id)}
                            disabled={actionLoading === v.id}
                            className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors disabled:opacity-50"
                            title="Отменить голос"
                          >
                            <FiXCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-text-muted text-sm">
              Страница {page} из {totalPages} ({total} записей)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 glass rounded-lg text-text-secondary hover:text-white disabled:opacity-30">
                <FiChevronLeft size={16} />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 glass rounded-lg text-text-secondary hover:text-white disabled:opacity-30">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
