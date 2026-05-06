import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { translations, LOCALES, type Locale, type LocaleInfo } from './translations';

interface I18nContextValue {
  locale: Locale;
  localeInfo: LocaleInfo;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  locales: LocaleInfo[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('cvforge_locale');
    if (saved && saved in translations) return saved as Locale;
    return 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('cvforge_locale', l);
  }, []);

  const localeInfo = LOCALES.find(l => l.code === locale) || LOCALES[0];

  // Apply dir attribute for RTL
  useEffect(() => {
    document.documentElement.dir = localeInfo.dir;
    document.documentElement.lang = locale;
  }, [locale, localeInfo.dir]);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, localeInfo, setLocale, t, locales: LOCALES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
