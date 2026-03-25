'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { t as translate, localizedName as lName, localizedDesc as lDesc, LANGUAGES } from '../lib/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('ru');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app_lang');
      if (saved && ['ru', 'uz', 'en'].includes(saved)) {
        setLangState(saved);
      }
    }
  }, []);

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_lang', newLang);
      document.documentElement.lang = newLang;
    }
  }, []);

  const t = useCallback((key) => translate(key, lang), [lang]);
  const localizedName = useCallback((obj) => lName(obj, lang), [lang]);
  const localizedDesc = useCallback((obj) => lDesc(obj, lang), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, localizedName, localizedDesc, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback for components outside provider
    return {
      lang: 'ru',
      setLang: () => {},
      t: (key) => translate(key, 'ru'),
      localizedName: (obj) => lName(obj, 'ru'),
      localizedDesc: (obj) => lDesc(obj, 'ru'),
      LANGUAGES,
    };
  }
  return ctx;
}
