'use client';

import Link from 'next/link';
import { FiInstagram, FiYoutube, FiMessageCircle } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-surface-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-xl font-heading italic tracking-wider text-white">
              Blogger <span className="gradient-text font-bold">Awards</span>
            </Link>
            <p className="text-text-muted text-sm mt-3 leading-relaxed">
              {t('footer_about')}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer_nav')}</h4>
            <nav className="space-y-2">
              <Link href="/" className="block text-text-secondary text-sm hover:text-primary transition-colors">{t('nav_home')}</Link>
              <Link href="/categories" className="block text-text-secondary text-sm hover:text-primary transition-colors">{t('nav_categories')}</Link>
              <Link href="/leaderboard" className="block text-text-secondary text-sm hover:text-primary transition-colors">{t('nav_leaderboard')}</Link>
              <Link href="/register" className="block text-text-secondary text-sm hover:text-primary transition-colors">{t('nav_register')}</Link>
            </nav>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('nav_register')}</h4>
            <nav className="space-y-2">
              <Link href="/register" className="block text-text-secondary text-sm hover:text-primary transition-colors">{t('nav_register')}</Link>
              <Link href="/categories" className="block text-text-secondary text-sm hover:text-primary transition-colors">{t('nav_categories')}</Link>
            </nav>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer_contact')}</h4>
            <div className="space-y-2">
              <a href="mailto:info@bloggerawards.uz" className="block text-text-secondary text-sm hover:text-primary transition-colors">
                info@bloggerawards.uz
              </a>
              <a href="tel:+998901234567" className="block text-text-secondary text-sm hover:text-primary transition-colors">
                +998 90 123 45 67
              </a>
            </div>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
                <FiInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
                <FiYoutube size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-all">
                <FiMessageCircle size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © 2026 Blogger Awards. {t('footer_rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
