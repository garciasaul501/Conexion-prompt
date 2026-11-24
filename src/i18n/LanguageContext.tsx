import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  TRANSLATIONS,
  TranslationDictionary,
} from './translations';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  translateCategory: (categoryId: string, fallbackName: string) => string;
  locale: string;
}

const STORAGE_KEY = 'conexion_prompts_lang_v1';

const LOCALE_MAP: Record<LanguageCode, string> = {
  es: 'es-ES',
  en: 'en-US',
  pt: 'pt-BR',
  fr: 'fr-FR',
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    const browserLang = (navigator.language || 'es').slice(0, 2).toLowerCase() as LanguageCode;
    if (SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
  } catch {
    // ignore storage errors
  }
  return 'es';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(detectInitialLanguage);

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = TRANSLATIONS[language] || TRANSLATIONS.es;
    return {
      language,
      setLanguage,
      t,
      locale: LOCALE_MAP[language] || 'es-ES',
      translateCategory: (categoryId: string, fallbackName: string) =>
        t.categories[categoryId] || fallbackName,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside a LanguageProvider');
  }
  return ctx;
}
