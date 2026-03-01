import {readContent} from '@/lib/content';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {Hero} from '@/components/Hero';
import {ServiceModules} from '@/components/ServiceModules';
import {Testimonial} from '@/components/Testimonial';
import {PartnerCarousel} from '@/components/PartnerCarousel';
import {ClientCarousel} from '@/components/ClientCarousel';
import {Newsletter} from '@/components/Newsletter';
import {ScrollReveal} from '@/components/ScrollReveal';
import type {Metadata} from 'next';

export const dynamic = 'force-dynamic';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'HomepageMeta'});
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

interface ServiceModule {
  id: string;
  title: string;
  bullets: string[];
  readMoreText: string;
  href: string;
  image?: string;
  imageAlt?: string;
  badge?: string;
  badgeAlt?: string;
}

interface Logo {
  alt: string;
  src: string;
}

interface HomepageContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
  };
  serviceModules: ServiceModule[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
    organization: string;
  };
  partnerLogos: Logo[];
  clientLogos: Logo[];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const content = readContent<HomepageContent>('homepage', locale);
  const t = await getTranslations('Homepage');

  return (
    <>
      <Hero
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        ctaText={content.hero.ctaText}
        ctaHref={content.hero.ctaHref}
      />
      <ScrollReveal animation="fade-up">
        <ServiceModules
          modules={content.serviceModules}
        />
      </ScrollReveal>
      <ScrollReveal animation="fade-in">
        <Testimonial
          title={t('testimonialsTitle')}
          quote={content.testimonial.quote}
          author={content.testimonial.author}
          role={content.testimonial.role}
          organization={content.testimonial.organization}
        />
      </ScrollReveal>
      <ScrollReveal animation="fade-up">
        <PartnerCarousel
          title={t('partnersTitle')}
          logos={content.partnerLogos}
        />
      </ScrollReveal>
      <ScrollReveal animation="fade-up" delay={100}>
        <ClientCarousel
          title={t('clientsTitle')}
          logos={content.clientLogos}
        />
      </ScrollReveal>
      <ScrollReveal animation="fade-up">
        <Newsletter />
      </ScrollReveal>
    </>
  );
}
