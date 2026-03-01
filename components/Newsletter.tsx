"use client";

import { useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';

export function Newsletter() {
  const t = useTranslations('Newsletter');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email }),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(t('errorMessage'));
      }
    } catch {
      setError(t('errorMessage'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="py-16 px-6 bg-section-alt">
      <div className="max-w-xl mx-auto text-center">
        <div className="overflow-hidden rounded-xl glass-card">
          <div className="h-1.5 bg-cta" />
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-2 text-foreground">{t('title')}</h2>
            <p className="text-muted-foreground mb-6">{t('description')}</p>

            {submitted ? (
              <p className="text-brand font-semibold text-lg">{t('successMessage')}</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder={t('firstNamePlaceholder')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background dark:bg-input/30 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    required
                  />
                  <input
                    type="text"
                    placeholder={t('lastNamePlaceholder')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background dark:bg-input/30 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    required
                  />
                </div>
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-4 rounded-lg border border-border bg-background dark:bg-input/30 px-4 py-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto bg-cta text-white rounded-full px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
                >
                  {loading ? t('loadingMessage') : t('submitButton')}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
