'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiDownload, FiRefreshCw, FiAlertCircle, FiChevronLeft, FiChevronRight, FiDollarSign } from 'react-icons/fi';
import api from '../../lib/api';

export default function AdminPaymentsPage() {
  const [filter, setFilter] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 30;

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: perPage };
      if (filter !== 'all') params.status = filter;

      const data = await api.getAdminPayments(params);
      setPayments(data.payments || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.detail || 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleExport = () => {
    const headers = ['ID', 'User ID', 'Amount', 'Method', 'Status', 'Date'];
    const rows = payments.map(p => [p.id, p.user_id, p.amount, p.method, p.status, p.created_at]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Экспорт завершён');
  };

  const totalPages = Math.ceil(total / perPage);
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0);

  const statusLabel = (s) => {
    switch (s) {
      case 'completed': return 'Успешно';
      case 'pending': return 'В ожидании';
      case 'failed': return 'Ошибка';
      default: return s;
    }
  };
  const statusClass = (s) => {
    switch (s) {
      case 'completed': return 'bg-success/10 text-success';
      case 'pending': return 'bg-warning/10 text-warning';
      case 'failed': return 'bg-danger/10 text-danger';
      default: return 'bg-surface text-text-muted';
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-slide-up ${
          toast.type === 'error' ? 'bg-danger' : 'bg-success'
        }`}>{toast.message}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Платежи</h1>
          <p className="text-text-secondary text-sm mt-1">
            {loading ? 'Загрузка...' : (
              <>Общий доход: <span className="text-success font-semibold">{totalRevenue.toLocaleString()} сум</span> ({total} транзакций)</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPayments} disabled={loading}
            className="flex items-center gap-2 glass text-text-secondary hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button onClick={handleExport} disabled={payments.length === 0}
            className="flex items-center gap-2 glass text-text-secondary hover:text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-30">
            <FiDownload size={16} /> Экспорт
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

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all', label: 'Все' },
          { key: 'completed', label: '✅ Успешные' },
          { key: 'pending', label: '⏳ В ожидании' },
          { key: 'failed', label: '❌ Неуспешные' },
        ].map(f => (
          <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key ? 'gradient-bg text-white' : 'glass text-text-secondary hover:text-white'
            }`}>
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
                <th className="text-left py-3 px-4 text-text-muted font-medium">Метод</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Сумма</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Статус</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-surface rounded animate-pulse w-16"></div></td>
                    ))}
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <FiDollarSign size={32} className="mx-auto mb-2 opacity-30" />
                    Платежи не найдены
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4 text-primary font-mono text-xs">#{p.id}</td>
                    <td className="py-3 px-4 text-white">{p.user_id}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                        {p.method || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">{(p.amount || 0).toLocaleString()} сум</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClass(p.status)}`}>
                        {statusLabel(p.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">
                      {p.created_at ? new Date(p.created_at).toLocaleString('ru-RU') : '-'}
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
            <p className="text-text-muted text-sm">Страница {page} из {totalPages}</p>
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
