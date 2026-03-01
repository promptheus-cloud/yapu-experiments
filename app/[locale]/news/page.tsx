import {readContent} from '@/lib/content';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {NewsFilter} from '@/components/NewsFilter';
import {ScrollReveal} from '@/components/ScrollReveal';
import type {Metadata} from 'next';

export const dynamic = 'force-dynamic';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'NewsMeta'});
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

interface Article {
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
  slug: string;
  image?: string;
  externalUrl?: string;
}

interface NewsContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaHref: string;
  };
  articles: Article[];
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const content = readContent<NewsContent>('news', locale);
  const t = await getTranslations('News');

  return (
    <>
      {/* Hero with background image */}
      <section
        className="relative bg-cover bg-center py-24 md:py-32 px-6"
        style={{backgroundImage: `url(${content.hero.backgroundImage})`}}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-wide">
            {content.hero.title}
          </h1>
        </div>
      </section>

      {/* Filter + Articles */}
      <ScrollReveal animation="fade-up">
        <section className="max-w-[1200px] w-[88%] mx-auto py-16">
          <NewsFilter
            articles={content.articles}
            allLabel={t('filterAll')}
            readMoreLabel={t('readMore')}
            noArticlesLabel={t('noArticles')}
          />
        </section>
      </ScrollReveal>
    </>
  );
}
