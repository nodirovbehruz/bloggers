'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiLock, FiUnlock, FiRefreshCw, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../lib/api';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: perPage };
      if (search) params.search = search;

      const data = await api.request(`/admin/users?${new URLSearchParams(params)}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.detail || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearchChange = (value) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      setPage(1);
    }, 500));
  };

  const handleBlock = async (userId) => {
    setActionLoading(userId);
    try {
      await api.blockUser(userId);
      showToast('Пользователь заблокирован');
      fetchUsers();
    } catch (err) {
      showToast(err.detail || 'Ошибка блокировки', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (userId) => {
    setActionLoading(userId);
    try {
      await api.unblockUser(userId);
      showToast('Пользователь разблокирован');
      fetchUsers();
    } catch (err) {
      showToast(err.detail || 'Ошибка разблокировки', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const countryFlags = { UZ: '🇺🇿', KZ: '🇰🇿', RU: '🇷🇺', KG: '🇰🇬', TJ: '🇹🇯' };
  const totalPages = Math.ceil(total / perPage);

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
          <h1 className="text-2xl font-heading font-bold text-white">Пользователи</h1>
          <p className="text-text-secondary text-sm mt-1">
            {loading ? 'Загрузка...' : `Всего: ${total} пользователей`}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 glass px-4 py-2 rounded-lg text-text-secondary hover:text-white transition-colors"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
        </button>
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

      {/* Search */}
      <div className="relative mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Поиск по номеру телефона..."
          className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">ID</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Телефон</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Роль</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Монеты</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Дата регистрации</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Статус</th>
                <th className="text-right py-3 px-4 text-text-muted font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-surface rounded animate-pulse w-16"></div></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    {error ? 'Ошибка загрузки данных' : 'Пользователи не найдены'}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4 text-text-muted">#{u.id}</td>
                    <td className="py-3 px-4 text-white font-medium">{u.phone}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        u.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-surface text-text-muted'
                      }`}>
                        {u.role === 'admin' ? 'Админ' : 'Пользователь'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-warning font-semibold">{u.coins || 0}</td>
                    <td className="py-3 px-4 text-text-muted text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        u.is_blocked ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'
                      }`}>
                        {u.is_blocked ? 'Заблокирован' : 'Активен'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => u.is_blocked ? handleUnblock(u.id) : handleBlock(u.id)}
                            disabled={actionLoading === u.id}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              u.is_blocked
                                ? 'hover:bg-success/10 text-text-muted hover:text-success'
                                : 'hover:bg-danger/10 text-text-muted hover:text-danger'
                            }`}
                            title={u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                          >
                            {actionLoading === u.id ? (
                              <FiRefreshCw className="animate-spin" size={16} />
                            ) : u.is_blocked ? (
                              <FiUnlock size={16} />
                            ) : (
                              <FiLock size={16} />
                            )}
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
