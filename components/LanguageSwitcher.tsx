'use client';

import React, { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { getActiveLanguage, switchLanguage } from './LanguageSettingsCard';

export default function LanguageSwitcher({ className = '' }: { className?: string }) {
  const [lang, setLang] = useState<'en' | 'bg'>('en');

  useEffect(() => {
    setLang(getActiveLanguage());

    const handleLanguageChange = () => {
      setLang(getActiveLanguage());
    };

    window.addEventListener('domiccare_language_changed', handleLanguageChange);
    return () => window.removeEventListener('domiccare_language_changed', handleLanguageChange);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'bg' : 'en';
    switchLanguage(nextLang);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black text-slate-700 shadow-xs transition-all cursor-pointer select-none active:scale-95 ${className}`}
      title={lang === 'en' ? 'Превключи на Български (1 клик)' : 'Switch to English (1 click)'}
    >
      <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
      <span>{lang === 'en' ? '🇬🇧 EN' : '🇧🇬 BG'}</span>
    </button>
  );
}
