// src/contexts/LanguageContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {Translations} from './translations';

// 1. نوع زبانی که داریم
type Language = 'en' | 'fa';

// 2. نوع Context که قراره توی کل برنامه استفاده بشه
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof Translations.en) => string;
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

  // تابع ترجمه: کلید رو می‌گیره و متن رو برمی‌گردونه
  const t = (key: keyof typeof Translations.en) => {
    return Translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 5. هوک سفارشی برای راحت‌تر استفاده کردن
export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};