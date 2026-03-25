'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiRefreshCw, FiAlertCircle, FiX, FiCheck, FiSave, FiUpload, FiImage } from 'react-icons/fi';
import api from '../../lib/api';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', '');

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Add form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '' });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: '', slug: '', icon: '' });

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.detail || 'Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Auto-generate slug from name
  const generateSlug = (name) => {
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    };
    return name.toLowerCase().split('').map(c => translitMap[c] || c).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNameChange = (value, isNew = true) => {
    const slug = generateSlug(value);
    if (isNew) {
      setNewCategory(prev => ({ ...prev, name: value, slug }));
    } else {
      setEditData(prev => ({ ...prev, name: value, slug }));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.slug) {
      showToast('Заполните название и slug', 'error');
      return;
    }
    setActionLoading('create');
    try {
      await api.createCategory(newCategory);
      showToast('Категория создана!');
      setShowAddForm(false);
      setNewCategory({ name: '', slug: '', icon: '', name_uz: '', name_en: '' });
      fetchCategories();
    } catch (err) {
      showToast(err.detail || 'Ошибка создания', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditData({ name: cat.name, slug: cat.slug, icon: cat.icon || '', name_uz: cat.name_uz || '', name_en: cat.name_en || '' });
  };

  const handleSaveEdit = async (id) => {
    if (!editData.name || !editData.slug) {
      showToast('Заполните название и slug', 'error');
      return;
    }
    setActionLoading(id);
    try {
      await api.updateCategory(id, editData);
      showToast('Категория обновлена!');
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      showToast(err.detail || 'Ошибка обновления', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await api.deleteCategory(id);
      showToast('Категория удалена!');
      setDeleteConfirm(null);
      fetchCategories();
    } catch (err) {
      showToast(err.detail || 'Ошибка удаления', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleImageUpload = async (categoryId, file) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      showToast('Авторизуйтесь как админ', 'error');
      return;
    }
    setActionLoading(`img-${categoryId}`);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_BASE}/api/v1/categories/${categoryId}/image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      showToast('Изображение загружено!');
      fetchCategories();
    } catch (err) {
      showToast('Ошибка загрузки изображения', 'error');
    } finally {
      setActionLoading(null);
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
          <h1 className="text-2xl font-heading font-bold text-white">Категории</h1>
          <p className="text-text-secondary text-sm mt-1">
            {loading ? 'Загрузка...' : `${categories.length} номинаций`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCategories} disabled={loading}
            className="flex items-center gap-2 glass px-4 py-2 rounded-lg text-text-secondary hover:text-white transition-colors">
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 gradient-bg text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
            <FiPlus size={16} /> Добавить
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

      {/* Add form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="glass rounded-xl p-5 mb-6 animate-slide-up">
          <h3 className="text-white font-semibold mb-4">Новая категория</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Название *</label>
              <input type="text" required value={newCategory.name}
                onChange={(e) => handleNameChange(e.target.value, true)}
                placeholder="Лайфстайл"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Slug * (авто)</label>
              <input type="text" required value={newCategory.slug}
                onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="lifestyle"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary font-mono" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Иконка (emoji)</label>
              <input type="text" value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="🎨"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary" />
            </div>
          </div>
          {/* Multilingual fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-text-secondary text-xs mb-1 block">🇺🇿 Название (узб)</label>
              <input type="text" value={newCategory.name_uz || ''}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name_uz: e.target.value }))}
                placeholder="Lajfstajl"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">🇬🇧 Название (eng)</label>
              <input type="text" value={newCategory.name_en || ''}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder="Lifestyle"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-text-muted focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={actionLoading === 'create'}
              className="gradient-bg text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {actionLoading === 'create' ? <FiRefreshCw className="animate-spin" size={14} /> : <FiPlus size={14} />}
              {actionLoading === 'create' ? 'Создание...' : 'Создать'}
            </button>
            <button type="button" onClick={() => { setShowAddForm(false); setNewCategory({ name: '', slug: '', icon: '' }); }}
              className="glass text-text-secondary px-4 py-2 rounded-lg text-sm hover:text-white">
              Отмена
            </button>
          </div>
          <input type="hidden" value="" />
        </form>
      )}

      {/* Categories grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass rounded-xl p-5 animate-pulse">
              <div className="h-6 w-32 bg-surface rounded mb-3"></div>
              <div className="h-4 w-20 bg-surface rounded mb-3"></div>
              <div className="h-4 w-24 bg-surface rounded"></div>
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-heading font-semibold text-white mb-2">Нет категорий</h3>
          <p className="text-text-secondary mb-4">Создайте первую категорию для начала работы</p>
          <button onClick={() => setShowAddForm(true)}
            className="gradient-bg text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90">
            <FiPlus className="inline mr-2" size={16} /> Создать категорию
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="glass rounded-xl p-5 card-hover">
              {editingId === cat.id ? (
                /* Edit mode */
                <div className="space-y-3">
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Название</label>
                    <input type="text" value={editData.name}
                      onChange={(e) => handleNameChange(e.target.value, false)}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Slug</label>
                    <input type="text" value={editData.slug}
                      onChange={(e) => setEditData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary font-mono" />
                  </div>
                  <div>
                    <label className="text-text-secondary text-xs mb-1 block">Иконка</label>
                    <input type="text" value={editData.icon}
                      onChange={(e) => setEditData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(cat.id)} disabled={actionLoading === cat.id}
                      className="flex-1 bg-success text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1">
                      <FiSave size={14} /> Сохранить
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="flex-1 glass text-text-secondary py-2 rounded-lg text-sm hover:text-white flex items-center justify-center gap-1">
                      <FiX size={14} /> Отмена
                    </button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <>
                  {/* Image preview */}
                  <div className="mb-3">
                    {cat.image_url ? (
                      <div className="relative w-full h-28 rounded-lg overflow-hidden bg-surface mb-2">
                        <img
                          src={cat.image_url.startsWith('/uploads') ? `${API_BASE}${cat.image_url}` : cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = ''; e.target.className = 'hidden'; }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-28 rounded-lg bg-surface/50 border-2 border-dashed border-border flex items-center justify-center mb-2">
                        <FiImage className="text-text-muted" size={28} />
                      </div>
                    )}
                    <label className={`flex items-center gap-2 justify-center text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      actionLoading === `img-${cat.id}` ? 'bg-surface text-text-muted' : 'bg-primary/10 text-primary hover:bg-primary/20'
                    }`}>
                      <FiUpload size={12} />
                      {actionLoading === `img-${cat.id}` ? 'Загрузка...' : (cat.image_url ? 'Заменить фото' : 'Загрузить фото')}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={actionLoading === `img-${cat.id}`}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleImageUpload(cat.id, file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {cat.name}
                    </h3>
                    <div className="flex gap-1">
                      <button onClick={() => handleStartEdit(cat)}
                        className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors" title="Редактировать">
                        <FiEdit size={14} />
                      </button>
                      <button onClick={() => setDeleteConfirm(cat.id)}
                        className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors" title="Удалить">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-text-muted text-sm mb-3 font-mono">/{cat.slug}</p>
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <FiUsers size={14} />
                    <span>{cat.blogger_count || 0} участников</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-heading font-bold text-lg mb-2">Удалить категорию?</h3>
            <p className="text-text-secondary text-sm mb-6">
              Категория будет удалена. Если к ней привязаны блогеры, удаление невозможно.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 glass text-text-secondary py-2.5 rounded-lg hover:text-white transition-colors">
                Отмена
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading === deleteConfirm}
                className="flex-1 bg-danger text-white py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50">
                {actionLoading === deleteConfirm ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
