'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiCheck, FiX, FiEdit, FiTrash2, FiEye, FiPlus, FiRefreshCw, FiAlertCircle, FiChevronLeft, FiChevronRight, FiUpload, FiImage } from 'react-icons/fi';
import api from '../../lib/api';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', '');

export default function AdminBloggersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [bloggers, setBloggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedBlogger, setSelectedBlogger] = useState(null);

  // Form state for adding/editing
  const [formData, setFormData] = useState({
    full_name: '',
    nickname: '',
    phone: '',
    country: 'UZ',
    category_id: 1,
    description: '',
    instagram_url: '',
    youtube_url: '',
    tiktok_url: '',
    telegram_url: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Toast notification
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBloggers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, per_page: perPage };
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;

      const data = await api.request(`/admin/bloggers?${new URLSearchParams(params)}`);
      setBloggers(data.bloggers || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.detail || 'Failed to load bloggers');
      setBloggers([]);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchBloggers();
  }, [fetchBloggers]);

  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearchChange = (value) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      setPage(1);
    }, 500));
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await api.approveBlogger(id);
      showToast('Блогер одобрен!');
      fetchBloggers();
    } catch (err) {
      showToast(err.detail || 'Ошибка одобрения', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await api.rejectBlogger(id);
      showToast('Блогер отклонён');
      fetchBloggers();
    } catch (err) {
      showToast(err.detail || 'Ошибка отклонения', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await api.request(`/admin/bloggers/${id}`, { method: 'DELETE' });
      showToast('Блогер удалён');
      setShowDeleteConfirm(null);
      fetchBloggers();
    } catch (err) {
      showToast(err.detail || 'Ошибка удаления', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddBlogger = async (e) => {
    e.preventDefault();
    setActionLoading('add');
    try {
      const res = await api.registerBlogger(formData);
      const bloggerId = res.id;

      // Upload avatar if selected
      if (avatarFile && bloggerId) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        await fetch(`${API_BASE}/api/v1/bloggers/${bloggerId}/avatar`, {
          method: 'POST',
          body: fd,
        });
      }

      showToast('Блогер добавлен успешно!');
      setShowAddModal(false);
      setFormData({ full_name: '', nickname: '', phone: '', country: 'UZ', category_id: 1, description: '', instagram_url: '', youtube_url: '', tiktok_url: '', telegram_url: '' });
      setAvatarFile(null);
      setAvatarPreview(null);
      fetchBloggers();
    } catch (err) {
      showToast(err.detail || 'Ошибка добавления', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const totalPages = Math.ceil(total / perPage);
  const statusLabel = (s) => {
    switch (s) {
      case 'pending': return 'Ожидает';
      case 'approved': return 'Одобрено';
      case 'rejected': return 'Отклонено';
      case 'blocked': return 'Заблокирован';
      default: return s;
    }
  };
  const statusClass = (s) => {
    switch (s) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'approved': return 'bg-success/10 text-success';
      case 'rejected': return 'bg-danger/10 text-danger';
      case 'blocked': return 'bg-red-900/20 text-red-400';
      default: return 'bg-surface text-text-muted';
    }
  };

  return (
    <div>
      {/* Toast notification */}
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
          <h1 className="text-2xl font-heading font-bold text-white">Управление блогерами</h1>
          <p className="text-text-secondary text-sm mt-1">
            {loading ? 'Загрузка...' : `Всего: ${total} блогеров`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchBloggers}
            disabled={loading}
            className="flex items-center gap-2 glass px-4 py-2 rounded-lg text-text-secondary hover:text-white transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 gradient-bg text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <FiPlus size={16} />
            Добавить
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="glass rounded-xl p-4 mb-6 border-l-4 border-warning">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-warning" size={20} />
            <p className="text-white text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Поиск блогеров..."
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Все' },
            { key: 'pending', label: '⏳ Ожидает' },
            { key: 'approved', label: '✅ Одобрено' },
            { key: 'rejected', label: '❌ Отклонено' },
            { key: 'blocked', label: '🚫 Заблокирован' },
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
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">ID</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Блогер</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Телефон</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Голоса</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Статус</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Дата</th>
                <th className="text-right py-3 px-4 text-text-muted font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className="h-4 bg-surface rounded animate-pulse w-20"></div></td>
                    ))}
                  </tr>
                ))
              ) : bloggers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    {error ? 'Ошибка загрузки данных' : 'Блогеры не найдены'}
                  </td>
                </tr>
              ) : (
                bloggers.map((b) => (
                  <tr key={b.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                    <td className="py-3 px-4 text-text-muted">#{b.id}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-white font-medium">{b.full_name}</p>
                        <p className="text-text-muted text-xs">{b.nickname}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary">{b.phone}</td>
                    <td className="py-3 px-4 text-white font-semibold">{(b.total_votes || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass(b.status)}`}>
                        {statusLabel(b.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted text-xs">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('ru-RU') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {b.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(b.id)}
                              disabled={actionLoading === b.id}
                              className="p-2 rounded-lg hover:bg-success/10 text-success transition-colors disabled:opacity-50"
                              title="Одобрить"
                            >
                              <FiCheck size={16} />
                            </button>
                            <button
                              onClick={() => handleReject(b.id)}
                              disabled={actionLoading === b.id}
                              className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors disabled:opacity-50"
                              title="Отклонить"
                            >
                              <FiX size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => { setSelectedBlogger(b); setShowViewModal(true); }}
                          className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Подробнее"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(b.id)}
                          disabled={actionLoading === b.id}
                          className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors disabled:opacity-50"
                          title="Удалить"
                        >
                          <FiTrash2 size={16} />
                        </button>
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
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 glass rounded-lg text-text-secondary hover:text-white disabled:opacity-30"
              >
                <FiChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 glass rounded-lg text-text-secondary hover:text-white disabled:opacity-30"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-heading font-bold text-lg mb-2">Подтвердите удаление</h3>
            <p className="text-text-secondary text-sm mb-6">Вы уверены, что хотите удалить этого блогера? Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 glass text-text-secondary py-2.5 rounded-lg hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={actionLoading === showDeleteConfirm}
                className="flex-1 bg-danger text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {actionLoading === showDeleteConfirm ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Blogger Modal */}
      {showViewModal && selectedBlogger && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-heading font-bold text-lg">Информация о блогере</h3>
              <button onClick={() => setShowViewModal(false)} className="text-text-muted hover:text-white">
                <FiX size={20} />
              </button>
            </div>
            {/* Avatar */}
            {selectedBlogger.avatar_url && (
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface">
                  <img
                    src={selectedBlogger.avatar_url.startsWith('http') ? selectedBlogger.avatar_url : (selectedBlogger.avatar_url.startsWith('/uploads') ? `${API_BASE}${selectedBlogger.avatar_url}` : selectedBlogger.avatar_url)}
                    alt={selectedBlogger.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>
            )}
            <div className="space-y-3">
              {[
                { label: 'ID', value: `#${selectedBlogger.id}` },
                { label: 'Имя', value: selectedBlogger.full_name },
                { label: 'Никнейм', value: selectedBlogger.nickname },
                { label: 'Телефон', value: selectedBlogger.phone },
                { label: 'Страна', value: selectedBlogger.country },
                { label: 'Голоса', value: (selectedBlogger.total_votes || 0).toLocaleString() },
                { label: 'Статус', value: statusLabel(selectedBlogger.status) },
                { label: 'Аватарка', value: selectedBlogger.avatar_url ? '✓ Загружена' : '✗ Нет' },
                { label: 'Дата регистрации', value: selectedBlogger.created_at ? new Date(selectedBlogger.created_at).toLocaleDateString('ru-RU') : '-' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-text-muted text-sm">{item.label}</span>
                  <span className="text-white text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              {selectedBlogger.status === 'pending' && (
                <>
                  <button
                    onClick={() => { handleApprove(selectedBlogger.id); setShowViewModal(false); }}
                    className="flex-1 bg-success text-white py-2 rounded-lg hover:opacity-90 text-sm font-medium"
                  >
                    Одобрить
                  </button>
                  <button
                    onClick={() => { handleReject(selectedBlogger.id); setShowViewModal(false); }}
                    className="flex-1 bg-danger text-white py-2 rounded-lg hover:opacity-90 text-sm font-medium"
                  >
                    Отклонить
                  </button>
                </>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="flex-1 glass text-text-secondary py-2 rounded-lg hover:text-white text-sm"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Blogger Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-heading font-bold text-lg">Добавить блогера</h3>
              <button onClick={() => setShowAddModal(false)} className="text-text-muted hover:text-white">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBlogger} className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="text-text-secondary text-sm mb-2 block">Аватарка *</label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface border-2 border-dashed border-border shrink-0 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <FiImage className="text-text-muted" size={24} />
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary transition-colors">
                    <FiUpload className="text-text-muted mb-1" size={20} />
                    <span className="text-text-secondary text-xs text-center">
                      {avatarFile ? avatarFile.name : 'Нажмите для загрузки'}
                    </span>
                    <span className="text-text-muted text-[10px] mt-0.5">PNG, JPG до 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">Полное имя *</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData(p => ({ ...p, full_name: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    placeholder="Имя Фамилия"
                  />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">Никнейм *</label>
                  <input
                    type="text"
                    required
                    value={formData.nickname}
                    onChange={(e) => setFormData(p => ({ ...p, nickname: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    placeholder="@nickname"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">Телефон *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">Страна</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(p => ({ ...p, country: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="UZ">🇺🇿 Узбекистан</option>
                    <option value="KZ">🇰🇿 Казахстан</option>
                    <option value="RU">🇷🇺 Россия</option>
                    <option value="KG">🇰🇬 Кыргызстан</option>
                    <option value="TJ">🇹🇯 Таджикистан</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Категория</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData(p => ({ ...p, category_id: parseInt(e.target.value) }))}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary"
                >
                  <option value={1}>Лайфстайл</option>
                  <option value={2}>Красота</option>
                  <option value={3}>Путешествия</option>
                  <option value={4}>Еда</option>
                  <option value={5}>Фитнесс</option>
                  <option value={6}>Технологии</option>
                  <option value={7}>Музыка</option>
                  <option value={8}>Юмор</option>
                </select>
              </div>
              <div>
                <label className="text-text-secondary text-sm mb-1 block">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Кратко о блогере..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">Instagram</label>
                  <input type="url" value={formData.instagram_url} onChange={(e) => setFormData(p => ({ ...p, instagram_url: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="https://instagram.com/..." />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">YouTube</label>
                  <input type="url" value={formData.youtube_url} onChange={(e) => setFormData(p => ({ ...p, youtube_url: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="https://youtube.com/..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">TikTok</label>
                  <input type="url" value={formData.tiktok_url} onChange={(e) => setFormData(p => ({ ...p, tiktok_url: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="https://tiktok.com/..." />
                </div>
                <div>
                  <label className="text-text-secondary text-sm mb-1 block">Telegram</label>
                  <input type="url" value={formData.telegram_url} onChange={(e) => setFormData(p => ({ ...p, telegram_url: e.target.value }))}
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary" placeholder="https://t.me/..." />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 glass text-text-secondary py-2.5 rounded-lg hover:text-white transition-colors">
                  Отмена
                </button>
                <button type="submit" disabled={actionLoading === 'add'}
                  className="flex-1 gradient-bg text-white py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium">
                  {actionLoading === 'add' ? 'Добавление...' : 'Добавить блогера'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
