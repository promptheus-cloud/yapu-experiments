import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'es'],
  defaultLocale: 'en',
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365  // 1 year persistence
  }
});
