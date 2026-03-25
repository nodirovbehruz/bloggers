'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FiGlobe } from 'react-icons/fi';

export default function LanguageSwitcher() {
  const { lang, setLang, LANGUAGES } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all text-sm"
        title="Language"
      >
        <FiGlobe size={16} />
        <span className="font-medium text-xs">{current.short}</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-2 w-40 rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in"
          style={{
            background: 'rgba(20, 28, 49, 0.98)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${
                lang === l.code
                  ? 'text-white bg-[#9810FA]/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <span className="font-medium">{l.label}</span>
              {lang === l.code && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#9810FA]"></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
