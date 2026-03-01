'use client';

import {useState, useEffect} from 'react';
import {useTranslations} from 'next-intl';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = 'yapu_cookie_consent';

export function CookieConsent() {
  const t = useTranslations('CookieConsent');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setShowBanner(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'granted');
    setShowBanner(false);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {analytics_storage: 'granted'});
    }
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'denied');
    setShowBanner(false);
  }

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand text-white p-4 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm">
          {t('message')}
          <a
            href="https://yapu.solutions/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline ml-1"
          >
            {t('privacyPolicy')}
          </a>
        </p>
        <div className="flex gap-3">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-full border border-white/40 text-sm hover:bg-white/10 transition-colors"
          >
            {t('decline')}
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-full bg-accent text-brand text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
