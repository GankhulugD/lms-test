import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getApiErrorKey } from '../i18n/apiErrors';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

const STORAGE_KEY = 'language';

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /**
   * Backend-ээс ирсэн алдааг (err.response.data.message-д машины КОД байна
   * гэж үзнэ) одоогийн хэл рүү орчуулна. Танигдаагүй код бол `fallback`
   * түлхүүрийг ашиглана — backend-ийн түүхий текстийг хэзээ ч шууд харуулахгүй.
   */
  tError: (err: unknown, fallback?: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'mn' || stored === 'en') return stored;
  return 'mn';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next: Language) {
    setLanguageState(next);
  }

  function toggleLanguage() {
    setLanguageState((prev) => (prev === 'mn' ? 'en' : 'mn'));
  }

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    const entry = translations[key];
    let text: string = entry ? entry[language] : key;
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }
    return text;
  }

  function tError(err: unknown, fallback: TranslationKey = 'apiError.generic'): string {
    const key = getApiErrorKey(err);
    return t(key ?? fallback);
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t, tError }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
