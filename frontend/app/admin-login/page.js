'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle, FiBarChart2 } from 'react-icons/fi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.adminLogin(username, password);
      router.push('/admin');
    } catch (err) {
      setError(err.detail || 'Ошибка авторизации. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <FiBarChart2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white">Админ панель</h1>
          <p className="text-text-secondary text-sm mt-1">Введите логин и пароль для входа</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3">
              <FiAlertCircle className="text-danger shrink-0 mt-0.5" size={18} />
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          {/* Username */}
          <div className="mb-5">
            <label htmlFor="username" className="block text-text-secondary text-sm font-medium mb-2">
              Логин
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                autoComplete="username"
                className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-text-secondary text-sm font-medium mb-2">
              Пароль
            </label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-surface border border-border rounded-xl pl-12 pr-12 py-3.5 text-white placeholder:text-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            id="admin-login-btn"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Вход...
              </>
            ) : (
              <>
                <FiLock size={16} />
                Войти в панель
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-text-muted text-xs mt-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Blogger Awards Admin Panel &copy; 2026
        </p>
      </div>
    </div>
  );
}
