'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { FiPlus, FiEdit, FiTrash2, FiExternalLink, FiCheck, FiX, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', website_url: '', logo_url: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const data = await api.getAllSponsors();
      setSponsors(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast('Ошибка загрузки спонсоров', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSponsors(); }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await api.createSponsor(formData);
      showToast('Спонсор добавлен');
      setShowForm(false);
      setFormData({ name: '', website_url: '', logo_url: '' });
      fetchSponsors();
    } catch (err) {
      showToast(err.detail || 'Ошибка создания', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      await api.updateSponsor(editingId, formData);
      showToast('Спонсор обновлён');
      setEditingId(null);
      setFormData({ name: '', website_url: '', logo_url: '' });
      fetchSponsors();
    } catch (err) {
      showToast(err.detail || 'Ошибка обновления', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteSponsor(id);
      showToast('Спонсор удалён');
      setDeleteConfirm(null);
      fetchSponsors();
    } catch (err) {
      showToast(err.detail || 'Ошибка удаления', 'error');
    }
  };

  const handleToggleActive = async (sponsor) => {
    try {
      await api.updateSponsor(sponsor.id, { is_active: !sponsor.is_active });
      showToast(sponsor.is_active ? 'Спонсор деактивирован' : 'Спонсор активирован');
      fetchSponsors();
    } catch (err) {
      showToast(err.detail || 'Ошибка', 'error');
    }
  };

  const startEdit = (sponsor) => {
    setEditingId(sponsor.id);
    setFormData({ name: sponsor.name, website_url: sponsor.website_url || '', logo_url: sponsor.logo_url || '' });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', website_url: '', logo_url: '' });
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-up ${
          toast.type === 'error' ? 'bg-danger/90 text-white' : 'bg-success/90 text-white'
        }`}>
          {toast.type === 'error' ? <FiAlertCircle size={16} /> : <FiCheck size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Спонсоры</h1>
          <p className="text-text-secondary text-sm mt-1">Управление спонсорами платформы</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); cancelEdit(); }}
          className="flex items-center gap-2 gradient-bg text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <FiPlus size={16} />
          Добавить спонсора
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="glass rounded-xl p-6 mb-6 animate-slide-up">
          <h3 className="text-lg font-heading font-semibold text-white mb-4">Новый спонсор</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-text-secondary text-sm mb-1">Название *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Название компании"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Сайт</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://example.com"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-sm mb-1">Логотип URL</label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={saving || !formData.name.trim()}
              className="gradient-bg text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <FiRefreshCw className="animate-spin" size={14} /> : <FiCheck size={14} />}
              Создать
            </button>
            <button
              onClick={() => { setShowForm(false); setFormData({ name: '', website_url: '', logo_url: '' }); }}
              className="text-text-muted hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Sponsors list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-card rounded-xl animate-pulse"></div>)}
        </div>
      ) : sponsors.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="text-lg font-heading font-semibold text-white mb-2">Нет спонсоров</h3>
          <p className="text-text-secondary text-sm">Добавьте первого спонсора</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Название</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Сайт</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Статус</th>
                <th className="text-right py-3 px-4 text-text-muted font-medium">Действия</th>
              </tr>
            </thead>
            <tbody>
              {sponsors.map((sponsor) => (
                <tr key={sponsor.id} className="border-b border-border/50 hover:bg-surface-hover transition-colors">
                  {editingId === sponsor.id ? (
                    <>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-surface border border-primary rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="url"
                          value={formData.website_url}
                          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                          className="w-full bg-surface border border-primary rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                          placeholder="https://..."
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          sponsor.is_active ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        }`}>
                          {sponsor.is_active ? 'Активен' : 'Неактивен'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={handleUpdate}
                            disabled={saving}
                            className="p-2 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
                          >
                            <FiCheck size={16} />
                          </button>
                          <button onClick={cancelEdit} className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors">
                            <FiX size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 text-white font-medium">{sponsor.name}</td>
                      <td className="py-3 px-4">
                        {sponsor.website_url ? (
                          <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                            {sponsor.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                            <FiExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(sponsor)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full cursor-pointer transition-colors ${
                            sponsor.is_active ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'
                          }`}
                        >
                          {sponsor.is_active ? 'Активен' : 'Неактивен'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(sponsor)}
                            className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(sponsor.id)}
                            className="p-2 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 max-w-sm w-full animate-slide-up">
            <h3 className="text-lg font-heading font-bold text-white mb-2">Удалить спонсора?</h3>
            <p className="text-text-secondary text-sm mb-6">Это действие нельзя отменить</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-danger text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-danger/80 transition-colors"
              >
                Удалить
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 glass text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-hover transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
