// src/contexts/LanguageContext.tsx
import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import { Translations } from './translations';

// 1. نوع زبانی که داریم
type Language = 'en' | 'fa';

// 2. نوع Context - تابع t الان هر string ای رو قبول میکنه
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string; // ← اینجا تغییر کرد
};

// 3. خود Context رو می‌سازیم
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 4. Provider که کل برنامه رو می‌پیچه
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // زبان رو از localStorage می‌خونیم، اگه نبود 'en' می‌ذاریم
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'fa') ? saved : 'en';
  });

  // هر وقت زبان عوض شد، توی localStorage ذخیره می‌کنیم
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // تابع ترجمه: هر کلید رو قبول میکنه
  // اگه کلید توی دیکشنری نباشه، خود کلید رو برمیگردونه
  const t = (key: string): string => {
    return Translations[language][key as keyof typeof Translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 5. هوک سفارشی برای راحت‌تر استفاده کردن
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};