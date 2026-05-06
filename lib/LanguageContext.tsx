'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  toggleLanguage: () => void; // Add this line
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved preferences from localStorage on initial mount
  useEffect(() => {
    setMounted(true);
    
    try {
      // Load language preference
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang === 'en' || savedLang === 'am') {
        setLanguage(savedLang);
      } else {
        // Default to English if no valid saved language
        setLanguage('en');
      }

      // Load theme preference
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        setDarkMode(true);
      } else if (savedTheme === 'light') {
        setDarkMode(false);
      } else {
        // Check system preference if no saved theme
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(systemPrefersDark);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  }, []);

  // Update localStorage and HTML when language changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('language', language);
        document.documentElement.lang = language;
        // Set text direction (both English and Amharic use ltr)
        document.documentElement.dir = 'ltr';
      } catch (error) {
        console.error('Error saving language:', error);
      }
    }
  }, [language, mounted]);

  // Update localStorage and HTML class when dark mode changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
        
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  }, [darkMode, mounted]);

  // Toggle function for dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Toggle function for language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  // Don't render children until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        darkMode,
        toggleDarkMode,
        toggleLanguage, // Add this line
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}