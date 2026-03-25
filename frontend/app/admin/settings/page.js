'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiToggleLeft, FiToggleRight, FiCalendar, FiDollarSign, FiMessageCircle, FiShield, FiAlertCircle, FiRefreshCw, FiCheck } from 'react-icons/fi';
import api from '../../lib/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAdminSettings();
      setSettings({
        contestActive: data.contest_active,
        startDate: data.start_date?.split('T')[0] || '2026-03-01',
        endDate: data.end_date?.split('T')[0] || '2026-04-15',
        dailyVoteLimit: data.daily_vote_limit,
        vipVotePrice: data.vip_vote_price,
        smsEnabled: data.sms_enabled,
        smsProvider: data.sms_provider,
        ipLimit: data.ip_limit,
        deviceLimit: data.device_limit,
        botProtection: data.bot_protection,
        rateLimitPerMinute: data.rate_limit_per_minute,
      });
    } catch (err) {
      setError(err.detail || 'Ошибка загрузки настроек');
      // Fallback defaults
      setSettings({
        contestActive: true,
        startDate: '2026-03-01',
        endDate: '2026-04-15',
        dailyVoteLimit: 1,
        vipVotePrice: 10000,
        smsEnabled: true,
        smsProvider: 'eskiz',
        ipLimit: 10,
        deviceLimit: 3,
        botProtection: true,
        rateLimitPerMinute: 30,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateAdminSettings({
        contest_active: settings.contestActive,
        start_date: settings.startDate + 'T00:00:00',
        end_date: settings.endDate + 'T00:00:00',
        daily_vote_limit: settings.dailyVoteLimit,
        vip_vote_price: settings.vipVotePrice,
        sms_enabled: settings.smsEnabled,
        sms_provider: settings.smsProvider,
        ip_limit: settings.ipLimit,
        device_limit: settings.deviceLimit,
        bot_protection: settings.botProtection,
        rate_limit_per_minute: settings.rateLimitPerMinute,
      });
      showToast('Настройки сохранены успешно!');
    } catch (err) {
      showToast(err.detail || 'Ошибка сохранения', 'error');
    } finally {
      setSaving(false);
    }
  };

  const Toggle = ({ value, onChange, label }) => (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-3 group"
    >
      {value ? (
        <FiToggleRight size={28} className="text-success" />
      ) : (
        <FiToggleLeft size={28} className="text-text-muted" />
      )}
      <span className="text-white text-sm group-hover:text-primary transition-colors">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 bg-surface-card rounded animate-pulse mb-6"></div>
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-surface-card rounded-xl animate-pulse"></div>)}
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-slide-up flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-danger' : 'bg-success'
        }`}>
          {toast.type === 'error' ? <FiAlertCircle size={16} /> : <FiCheck size={16} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">Настройки конкурса</h1>
          <p className="text-text-secondary">Управление параметрами голосования</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-2 glass px-4 py-2 rounded-lg text-text-secondary hover:text-white transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 gradient-bg text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSave size={16} />}
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass rounded-xl p-4 mb-6 border-l-4 border-warning">
          <div className="flex items-center gap-3">
            <FiAlertCircle className="text-warning" size={20} />
            <p className="text-white text-sm">{error}. Показаны значения по умолчанию.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contest Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <FiCalendar size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Конкурс</h3>
              <p className="text-text-muted text-xs">Основные параметры</p>
            </div>
          </div>
          <div className="space-y-4">
            <Toggle
              value={settings.contestActive}
              onChange={(v) => setSettings(s => ({ ...s, contestActive: v }))}
              label="Голосование активно"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1 block">Начало</label>
                <input
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => setSettings(s => ({ ...s, startDate: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1 block">Конец</label>
                <input
                  type="date"
                  value={settings.endDate}
                  onChange={(e) => setSettings(s => ({ ...s, endDate: e.target.value }))}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Votes Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-vote-free/10 flex items-center justify-center text-vote-free">
              <FiDollarSign size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Голосование</h3>
              <p className="text-text-muted text-xs">Лимиты и цены</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Бесплатных голосов в день</label>
              <input
                type="number"
                min={1}
                max={100}
                value={settings.dailyVoteLimit}
                onChange={(e) => setSettings(s => ({ ...s, dailyVoteLimit: parseInt(e.target.value) || 1 }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Цена VIP голоса (сум)</label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={settings.vipVotePrice}
                onChange={(e) => setSettings(s => ({ ...s, vipVotePrice: parseInt(e.target.value) || 10000 }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
              />
              <p className="text-text-muted text-xs mt-1">{(settings.vipVotePrice || 0).toLocaleString('ru-RU')} сум</p>
            </div>
          </div>
        </div>

        {/* SMS Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success">
              <FiMessageCircle size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">SMS / OTP</h3>
              <p className="text-text-muted text-xs">Настройки авторизации</p>
            </div>
          </div>
          <div className="space-y-4">
            <Toggle
              value={settings.smsEnabled}
              onChange={(v) => setSettings(s => ({ ...s, smsEnabled: v }))}
              label="SMS подтверждение включено"
            />
            <div>
              <label className="text-text-secondary text-xs mb-1 block">SMS провайдер</label>
              <select
                value={settings.smsProvider}
                onChange={(e) => setSettings(s => ({ ...s, smsProvider: e.target.value }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="eskiz">Eskiz.uz</option>
                <option value="playmobile">PlayMobile</option>
                <option value="twilio">Twilio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
              <FiShield size={20} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Безопасность</h3>
              <p className="text-text-muted text-xs">Анти-фрод настройки</p>
            </div>
          </div>
          <div className="space-y-4">
            <Toggle
              value={settings.botProtection}
              onChange={(v) => setSettings(s => ({ ...s, botProtection: v }))}
              label="Защита от ботов"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary text-xs mb-1 block">IP лимит (бесплатный)</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={settings.ipLimit}
                  onChange={(e) => setSettings(s => ({ ...s, ipLimit: parseInt(e.target.value) || 10 }))}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs mb-1 block">Device лимит</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={settings.deviceLimit}
                  onChange={(e) => setSettings(s => ({ ...s, deviceLimit: parseInt(e.target.value) || 3 }))}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-text-secondary text-xs mb-1 block">Rate limit (запросов/мин)</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={settings.rateLimitPerMinute}
                onChange={(e) => setSettings(s => ({ ...s, rateLimitPerMinute: parseInt(e.target.value) || 30 }))}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save button (mobile) */}
      <div className="mt-6 lg:hidden">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full gradient-bg text-white py-3.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <FiRefreshCw className="animate-spin" size={16} /> : <FiSave size={16} />}
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </div>
    </div>
  );
}
