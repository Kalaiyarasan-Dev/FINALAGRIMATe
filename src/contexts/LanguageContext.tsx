import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language, getTranslation, TranslationKey } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isTamil: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'agrimate_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'en' || saved === 'ta') return saved;
      const legacy = localStorage.getItem('language');
      if (legacy === 'en' || legacy === 'ta') return legacy;
    } catch {
      // Ignore localStorage read errors
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      localStorage.setItem('language', lang);
    } catch {
      // Ignore localStorage write errors
    }
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // Ignore DOM access issues
    }
  }, [language]);

  const t = useCallback(
    (key: TranslationKey) => getTranslation(language, key),
    [language]
  );

  const isTamil = language === 'ta';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isTamil }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
