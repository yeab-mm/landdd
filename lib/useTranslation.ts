// lib/useTranslation.ts
'use client';

import { useLanguage } from './LanguageContext';
import translations from './translations';

// Create a type from the English translation keys
export type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const { language } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    // First try to get from current language
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    // Fallback to English
    if (translations.en && translations.en[key]) {
      return translations.en[key];
    }
    // If all else fails, return the key itself
    console.warn(`Translation missing for key: ${key}`);
    return String(key);
  };

  return { t };
}