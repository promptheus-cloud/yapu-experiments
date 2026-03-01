import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale, getMessages, getTranslations} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {Nunito, Varela_Round} from 'next/font/google';
import {ThemeProvider} from '@/components/ThemeProvider';
import {Navigation, type NavSection} from '@/components/Navigation';
import {Footer} from '@/components/Footer';

import {GoogleAnalytics} from '@/components/GoogleAnalytics';
import {CookieConsent} from '@/components/CookieConsent';
import {readSharedContent} from '@/lib/content';
import type {ReactNode} from 'react';
import '../globals.css';

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const varelaRound = Varela_Round({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-varela-round',
  weight: '400',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const t = await getTranslations({locale, namespace: 'Metadata'});
  return {
    metadataBase: new URL('https://yapu.promptheus.cloud'),
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    openGraph: {
      siteName: t('title'),
      type: 'website',
    },
  };
}

interface CompanyData {
  name: string;
  email: string;
  addresses: {
    berlin: {street: string; city: string; zip: string; country: string};
    ecuador: {street: string; city: string; country: string};
  };
  social: {linkedin: string; twitter: string; facebook: string; youtube: string};
  website: string;
  app: string;
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const company = readSharedContent<CompanyData>('company');
  const navSections = readSharedContent<NavSection[]>('navigation');
  const tFooter = await getTranslations({locale, namespace: 'Footer'});

  return (
    <html lang={locale} className={`${nunito.variable} ${varelaRound.variable}`} suppressHydrationWarning>
      <body>
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <Navigation navSections={navSections} />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer
              company={company}
              tagline={tFooter('tagline')}
              legalNoticeLabel={tFooter('legalNotice')}
              privacyPolicyLabel={tFooter('privacyPolicy')}
              copyrightName={tFooter('copyright')}
            />
            <CookieConsent />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
