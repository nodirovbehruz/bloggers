'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '../lib/api';
import { FiPhone, FiArrowRight, FiShield, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const { t } = useLanguage();

  const cleanPhone = (p) => p.replace(/\s/g, '');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    const phoneClean = cleanPhone(phone);
    if (phoneClean.length < 13) {
      setError(t('auth_phone'));
      return;
    }
    setLoading(true);
    try {
      const res = await api.sendOtp(phoneClean);
      if (res.otp_debug) {
        setDebugOtp(res.otp_debug);
      }
      setStep('code');
    } catch (err) {
      setError(err.detail || t('vote_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (code.length < 6) return;
    setLoading(true);
    try {
      const res = await api.verifyOtp(cleanPhone(phone), code);
      api.setToken(res.access_token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_id', res.user_id);
        localStorage.setItem('user_phone', cleanPhone(phone));
      }
      setStep('success');
    } catch (err) {
      setError(err.detail || t('vote_error'));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    const redirectTo = typeof window !== 'undefined' 
      ? new URLSearchParams(window.location.search).get('redirect') || '/categories'
      : '/categories';

    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-dark rounded-2xl p-10 text-center max-w-md w-full animate-slide-up">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-heading font-bold text-white mb-3">{t('nav_login')}!</h2>
          <p className="text-text-secondary mb-6">{t('vote_success')}</p>
          <Link href={redirectTo} className="gradient-bg text-white font-semibold px-8 py-3 rounded-full inline-block hover:opacity-90 transition-opacity">
            {t('home_start_voting')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-dark rounded-2xl p-8 max-w-md w-full animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <FiPhone className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white mb-2">{t('auth_login_title')}</h1>
          <p className="text-text-secondary text-sm">
            {step === 'phone' 
              ? t('auth_phone')
              : t('auth_enter_code')
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2">
            <FiAlertCircle className="text-danger shrink-0 mt-0.5" size={16} />
            <p className="text-danger text-sm">{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('auth_phone')}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-lg placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                id="login-phone"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              id="login-send-code"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{t('auth_send_code')} <FiArrowRight /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('auth_enter_code')}</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                autoFocus
                className="w-full bg-surface border border-border rounded-xl px-4 py-3.5 text-white text-2xl text-center tracking-[0.5em] font-mono placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                id="login-code"
              />
              {debugOtp && (
                <p className="text-primary text-xs mt-1 font-mono">
                  [DEV] Code: {debugOtp}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full gradient-bg text-white font-semibold py-3.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              id="login-verify"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{t('auth_verify')} <FiShield /></>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setCode(''); setError(''); setDebugOtp(''); }}
              className="w-full text-text-secondary text-sm hover:text-white transition-colors py-2"
            >
              {t('back')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
