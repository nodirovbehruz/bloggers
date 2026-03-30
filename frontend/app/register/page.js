'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { FiUpload, FiCheck, FiAlertCircle, FiImage, FiDollarSign } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', '');

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    phone: '',
    country: 'UZ',
    category_id: '',
    description: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    telegram: '',
  });		
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { t, localizedName } = useLanguage();

  const router = useRouter();

  useEffect(() => {
    console.log("Checking RegisterPage Auth...");
    // Immediate redirect if not logged in
    if (!api.isUserLoggedIn()) {
      console.log("Not logged in, redirecting to login...");
      router.replace('/login?redirect=/register');
      return;
    }

    Promise.all([
      api.getCategories().catch(() => []),
      api.getSponsors().catch(() => []),
    ]).then(([cats, spon]) => {
      setCategories(Array.isArray(cats) ? cats : []);
      setSponsors(Array.isArray(spon) ? spon : []);
    });
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, avatar: 'Файл слишком большой (макс 5MB)' }));
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, avatar: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Введите ФИО';
    if (!formData.nickname.trim()) newErrors.nickname = 'Введите никнейм';
    if (!formData.phone.trim()) newErrors.phone = 'Введите номер телефона';
    if (!formData.country) newErrors.country = 'Выберите страну';
    if (!formData.category_id) newErrors.category_id = 'Выберите категорию';
    if (!formData.description.trim()) newErrors.description = 'Введите описание';
    if (!avatarFile) newErrors.avatar = 'Загрузите фото';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError('');
    try {
      // Register blogger
      const res = await api.registerBlogger({
        full_name: formData.fullName,
        nickname: formData.nickname,
        phone: formData.phone,
        country: formData.country,
        category_id: parseInt(formData.category_id),
        description: formData.description,
        instagram_url: formData.instagram || null,
        youtube_url: formData.youtube || null,
        tiktok_url: formData.tiktok || null,
        telegram_url: formData.telegram || null,
      });

      // Upload avatar
      if (avatarFile && res.id) {
        const fd = new FormData();
        fd.append('file', avatarFile);
        await fetch(`${API_BASE}/api/v1/bloggers/${res.id}/avatar`, {
          method: 'POST',
          body: fd,
        });
      }

      setSubmitted(true);
    } catch (err) {
      setApiError(err.detail || 'Ошибка отправки. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-dark rounded-2xl p-10 text-center max-w-md w-full animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-success" size={40} />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-3">{t('register_success')}</h2>
          <p className="text-text-secondary mb-2">
            Ваша заявка на участие в конкурсе отправлена на модерацию.
          </p>
          <p className="text-text-muted text-sm">
            Мы уведомим вас о результате проверки в ближайшее время.
          </p>
          <div className="mt-8 mb-4 inline-flex items-center gap-2 glass rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-warning rounded-full pulse-dot"></span>
            <span className="text-sm text-text-secondary">Статус: ожидает модерации</span>
          </div>

          {/* Sponsors Section on Success */}
          {sponsors.length > 0 && (
            <div className="mt-12 pt-10 border-t border-white/5 animate-fade-in">
              <p className="text-text-muted text-[10px] font-black uppercase tracking-[4px] mb-8 opacity-50">Наши партнеры</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sponsors.slice(0, 6).map((s, i) => {
                   const logoSrc = s.logo_url ? (s.logo_url.startsWith('/uploads') ? `${API_BASE}${s.logo_url}` : s.logo_url) : null;
                   return (
                     <div key={i} className="flex items-center justify-center p-5 bg-white/[0.02] rounded-2xl border border-white/5 transition-all group hover:bg-white/[0.05] hover:border-primary/20">
                        {logoSrc ? (
                          <img 
                            src={logoSrc} 
                            alt={s.name} 
                            className="max-h-10 w-auto object-contain grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                          />
                        ) : (
                          <span className="text-[10px] text-white/40 font-bold truncate group-hover:text-white/60">{s.name}</span>
                        )}
                     </div>
                   );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const inputClass = (name) =>
    `w-full bg-surface border ${errors[name] ? 'border-danger' : 'border-border'} rounded-xl px-4 py-3 text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors`;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="glass-dark rounded-2xl p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-heading font-bold text-white mb-2">
              {t('register_title')}
            </h1>
            <p className="text-text-secondary text-sm">
              {t('register_subtitle')}
            </p>
          </div>

          {/* Revenue share info */}
          <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4 items-start animate-fade-in">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
               <FiDollarSign size={24} />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Доход от голосов</h4>
              <p className="text-text-secondary text-xs leading-relaxed">
                Вы получаете <span className="text-primary font-black">30%</span> от общей суммы всех платных голосов (донатов). 
                Например, если вам задонатят <span className="text-white font-bold">1 000 000 сум</span>, 
                ваша выплата составит <span className="text-success font-black">300 000 сум</span>.
              </p>
            </div>
          </div>

          {/* API Error */}
          {apiError && (
            <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-2">
              <FiAlertCircle className="text-danger shrink-0 mt-0.5" size={16} />
              <p className="text-danger text-sm">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">{t('register_avatar')} *</label>
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-xl overflow-hidden bg-surface border-2 border-dashed shrink-0 flex items-center justify-center ${errors.avatar ? 'border-danger' : 'border-border'}`}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FiImage className="text-text-muted" size={24} />
                  )}
                </div>
                <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${errors.avatar ? 'border-danger hover:border-danger' : 'border-border hover:border-primary'}`}>
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
              {errors.avatar && <p className="text-danger text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={12} /> {errors.avatar}</p>}
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('register_fullname')} *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Введите ваше полное имя"
                className={inputClass('fullName')}
                id="reg-fullname"
              />
              {errors.fullName && <p className="text-danger text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={12} /> {errors.fullName}</p>}
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('register_nickname')} *</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname}
                onChange={handleChange}
                placeholder="@ваш_никнейм"
                className={inputClass('nickname')}
                id="reg-nickname"
              />
              {errors.nickname && <p className="text-danger text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={12} /> {errors.nickname}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('register_phone')} *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+998 __ ___ __ __"
                className={inputClass('phone')}
                id="reg-phone"
              />
              {errors.phone && <p className="text-danger text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={12} /> {errors.phone}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('register_country')} *</label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={inputClass('country')}
                id="reg-country"
              >
                <option value="UZ">Узбекистан</option>
                <option value="KZ">Казахстан</option>
                <option value="RU">Россия</option>
                <option value="KG">Кыргызстан</option>
                <option value="TJ">Таджикистан</option>
              </select>
              {errors.country && <p className="text-danger text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={12} /> {errors.country}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('register_category')} *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={inputClass('category_id')}
                id="reg-category"
              >
                <option value="">{t('categories_subtitle')}</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{localizedName(c)}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-danger text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={12} /> {errors.category_id}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">{t('register_desc')} *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Расскажите о себе и своём контенте"
                rows={4}
                className={`${inputClass('description')} resize-none`}
                id="reg-description"
              />
              {errors.description && <p className="text-danger text-xs mt-1 flex items-center gap-1"><FiAlertCircle size={12} /> {errors.description}</p>}
            </div>

            {/* Social links */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-text-secondary">{t('blogger_social')}</p>
              <input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram URL..." className={inputClass('instagram')} id="reg-instagram" />
              <input type="url" name="youtube" value={formData.youtube} onChange={handleChange} placeholder="YouTube URL..." className={inputClass('youtube')} id="reg-youtube" />
              <input type="url" name="tiktok" value={formData.tiktok} onChange={handleChange} placeholder="TikTok URL..." className={inputClass('tiktok')} id="reg-tiktok" />
              <input type="url" name="telegram" value={formData.telegram} onChange={handleChange} placeholder="Telegram URL..." className={inputClass('telegram')} id="reg-telegram" />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white font-bold py-4 rounded-xl text-lg hover:opacity-90 transition-all disabled:opacity-50 vote-btn"
              id="reg-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Отправка...
                </span>
              ) : (
                t('register_submit')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
