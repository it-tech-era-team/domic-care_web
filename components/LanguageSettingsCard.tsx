'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

export function getActiveLanguage(): 'en' | 'bg' {
  if (typeof document === 'undefined') return 'en';
  const cookieMatch = document.cookie.match(/googtrans=\/(?:en|auto)\/([a-z]{2})/i);
  if (cookieMatch && cookieMatch[1].toLowerCase() === 'bg') return 'bg';
  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('domiccare_lang') : null;
  if (stored === 'bg') return 'bg';
  return 'en';
}

export function switchLanguage(targetLang: 'en' | 'bg') {
  if (typeof window === 'undefined') return;

  // 1. Persist local storage
  localStorage.setItem('domiccare_lang', targetLang);

  // 2. Clear old googtrans cookies across all domains/paths
  const domain = window.location.hostname;
  const isLocal = domain === 'localhost' || domain === '127.0.0.1';
  const expire = '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  document.cookie = `googtrans${expire}`;
  if (!isLocal) {
    document.cookie = `googtrans${expire} domain=.${domain};`;
    document.cookie = `googtrans${expire} domain=${domain};`;
  }

  // 3. Set fresh cookie
  const cookieVal = targetLang === 'bg' ? '/en/bg' : '/en/en';
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  if (targetLang === 'bg') {
    document.cookie = `googtrans=/auto/bg; path=/;`;
  }
  if (!isLocal) {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${domain};`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${domain};`;
  }

  // 4. Try triggering combo if present
  const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (selectElem) {
    selectElem.value = targetLang;
    selectElem.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // 5. Instant 1-click reload guarantees 100% full-page translation
  window.dispatchEvent(new CustomEvent('domiccare_language_changed', { detail: targetLang }));
  window.location.reload();
}

export default function LanguageSettingsCard() {
  const [currentLang, setCurrentLang] = useState<'en' | 'bg'>('en');

  useEffect(() => {
    setCurrentLang(getActiveLanguage());

    const handleLanguageChange = () => {
      setCurrentLang(getActiveLanguage());
    };

    window.addEventListener('domiccare_language_changed', handleLanguageChange);
    return () => window.removeEventListener('domiccare_language_changed', handleLanguageChange);
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-xs shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">Language & Regional Preferences</h2>
            <p className="text-xs font-semibold text-slate-500">
              {currentLang === 'bg'
                ? 'Изберете предпочитания от вас език за платформата.'
                : 'Choose your preferred language for portal navigation and services.'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
          {currentLang === 'bg' ? '🇧🇬 Български' : '🇬🇧 English'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Option 1: English */}
        <button
          type="button"
          onClick={() => {
            if (currentLang !== 'en') switchLanguage('en');
          }}
          className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
            currentLang === 'en'
              ? 'border-blue-600 bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🇬🇧</span>
              <div>
                <div className="text-sm font-black text-slate-900">English</div>
                <div className="text-[11px] font-semibold text-slate-500">International / United Kingdom</div>
              </div>
            </div>
            {currentLang === 'en' && (
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Standard platform language for dashboard, requests, and receipts.
          </p>
        </button>

        {/* Option 2: Bulgarian */}
        <button
          type="button"
          onClick={() => {
            if (currentLang !== 'bg') switchLanguage('bg');
          }}
          className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
            currentLang === 'bg'
              ? 'border-blue-600 bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🇧🇬</span>
              <div>
                <div className="text-sm font-black text-slate-900">Български</div>
                <div className="text-[11px] font-semibold text-slate-500">България (Bulgarian)</div>
              </div>
            </div>
            {currentLang === 'bg' && (
              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
            )}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            Пълен превод на цялата платформа, филтри, карти и съобщения.
          </p>
        </button>
      </div>
    </div>
  );
}
