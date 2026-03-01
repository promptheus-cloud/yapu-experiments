import {readContent, contentExists} from '@/lib/content';
import {setRequestLocale} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {Hero} from '@/components/Hero';
import {ContentSection} from '@/components/ContentSection';
import {Testimonial} from '@/components/Testimonial';
import {Newsletter} from '@/components/Newsletter';
import {PartnerCarousel} from '@/components/PartnerCarousel';
import {ClientCarousel} from '@/components/ClientCarousel';
import type {Metadata} from 'next';
import type {ComponentType} from 'react';

export const dynamic = 'force-dynamic';

type Props = {params: Promise<{locale: string; slug: string[]}>};

// --- Section types and component map ---

interface SectionDef {
  type: string;
  id?: string;
  props: Record<string, unknown>;
}

interface DynamicPageContent {
  meta: {
    title: string;
    description: string;
  };
  sections: SectionDef[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const componentMap: Record<string, ComponentType<any>> = {
  hero: Hero,
  content: ContentSection,
  testimonial: Testimonial,
  newsletter: Newsletter,
  partnerCarousel: PartnerCarousel,
  clientCarousel: ClientCarousel,
};

// --- Metadata ---

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const pageSlug = slug.join('/');
  if (!contentExists(pageSlug, locale)) return {};

  try {
    const content = readContent<DynamicPageContent>(pageSlug, locale);
    return {
      title: content.meta.title,
      description: content.meta.description,
      openGraph: {
        title: content.meta.title,
        description: content.meta.description,
      },
    };
  } catch {
    return {};
  }
}

// --- Page ---

export default async function DynamicPage({params}: Props) {
  const {locale, slug} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const pageSlug = slug.join('/');
  if (!contentExists(pageSlug, locale)) {
    notFound();
  }

  let content: DynamicPageContent;
  try {
    content = readContent<DynamicPageContent>(pageSlug, locale);
  } catch {
    notFound();
  }

  return (
    <>
      {content.sections.map((section, index) => {
        const Component = componentMap[section.type];
        if (!Component) return null;

        const props = {
          ...section.props,
          ...(section.id ? {id: section.id} : {}),
          ...(section.type === 'content' ? {alternate: index % 2 === 1} : {}),
        };

        return <Component key={`${section.type}-${index}`} {...props} />;
      })}
    </>
  );
}
