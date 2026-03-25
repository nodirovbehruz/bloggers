'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX, FiUser, FiHome, FiGrid, FiAward, FiEdit3 } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);
  const { t } = useLanguage();

  const navLinks = [
    { href: '/', label: t('nav_home'), icon: FiHome },
    { href: '/categories', label: t('nav_categories'), icon: FiGrid },
    { href: '/leaderboard', label: t('nav_leaderboard'), icon: FiAward },
    { href: '/register', label: t('nav_register'), icon: FiEdit3 },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      setIsLoggedIn(!!token);

      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(16, 18, 23, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : 'none',
      }}
      ref={menuRef}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-[75px]">

          {/* Left: Burger menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white hover:opacity-70 transition-opacity p-2"
            id="menu-toggle"
            style={{ width: '40px' }}
          >
            {menuOpen ? <FiX size={24} /> : (
              <div className="flex flex-col items-center gap-[6px]" style={{ width: '24px' }}>
                <span className="block w-6 h-[2px] bg-white rounded"></span>
                <span className="block w-6 h-[2px] bg-white rounded"></span>
                <span className="block w-6 h-[2px] bg-white rounded"></span>
              </div>
            )}
          </button>

          {/* Center: Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <span
              className="text-white whitespace-nowrap"
              style={{
                fontFamily: "'Monsieur La Doulaise', cursive",
                fontWeight: 400,
                fontSize: '48px',
                lineHeight: '75px',
              }}
            >
              blogger vote
            </span>
          </Link>

          {/* Right: Language + User */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Link
              href={isLoggedIn ? '/profile' : '/login'}
              className="relative text-white hover:opacity-70 transition-opacity p-2"
              id="user-login"
              style={{ width: '40px' }}
            >
              <FiUser size={24} />
              {isLoggedIn && (
                <span
                  className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full"
                  style={{ background: '#9810FA', border: '2px solid #101217' }}
                ></span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 animate-fade-in"
          style={{
            background: 'rgba(16, 18, 23, 0.97)',
            backdropFilter: 'blur(30px)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <nav className="max-w-7xl mx-auto px-6 py-4 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-4 py-3.5 px-5 rounded-xl transition-all ${
                  isActive(href)
                    ? 'text-white bg-[#9810FA]/15'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                <span
                  className="font-medium text-base"
                  style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' }}
                >
                  {label}
                </span>
              </Link>
            ))}

            <Link
              href={isLoggedIn ? '/profile' : '/login'}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-4 py-3.5 px-5 rounded-xl transition-all ${
                pathname === '/profile' || pathname === '/login'
                  ? 'text-white bg-[#9810FA]/15'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FiUser size={20} />
              <span
                className="font-medium text-base"
                style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.3px' }}
              >
                {isLoggedIn ? t('nav_profile') : t('nav_login')}
              </span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
