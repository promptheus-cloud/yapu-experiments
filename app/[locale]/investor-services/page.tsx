import {readContent} from '@/lib/content';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {ScrollReveal} from '@/components/ScrollReveal';
import Image from 'next/image';
import type {Metadata} from 'next';

export const dynamic = 'force-dynamic';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'InvestorServicesMeta'});
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

interface InvestorServicesContent {
  hero: {title: string; subtitle: string; ctaText: string; ctaHref: string};
  approach: {title: string; text: string};
  services: Array<{title: string; description: string; icon: string}>;
  pathToResilience: {
    title: string;
    stages: Array<{title: string; description: string; image: string}>;
  };
  impactMeasurement: {
    title: string;
    environmental: {percentage: string; description: string; image: string};
    social: {percentage: string; description: string; image: string};
  };
  sdgs: number[];
  sdgDescription: string;
  useCases: Array<{
    title: string;
    description: string;
    social: number;
    environmental: number;
    sdgs: number[];
    socialImage: string;
    environmentalImage: string;
  }>;
  greenFinanceRadar: {title: string; text: string; ctaText: string; ctaHref: string};
}

const sdgNames: Record<number, string> = {
  1: 'No Poverty',
  2: 'Zero Hunger',
  5: 'Gender Equality',
  7: 'Affordable and Clean Energy',
  8: 'Decent Work and Economic Growth',
  10: 'Reduced Inequalities',
  11: 'Sustainable Cities and Communities',
  12: 'Responsible Consumption and Production',
  13: 'Climate Action',
  15: 'Life on Land',
};

function sdgImagePath(sdg: number): string {
  return `/images/sdg/sdg-${String(sdg).padStart(2, '0')}.jpg`;
}

export default async function InvestorServicesPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const content = readContent<InvestorServicesContent>('investor-services', locale);
  const t = await getTranslations('InvestorServices');

  return (
    <>
      {/* Hero -- background image with dark overlay, matching original */}
      <section className="relative min-h-[35em] flex items-center overflow-hidden">
        <Image
          src="/images/impact-header.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(30,90,100,0.85) 0%, rgba(30,90,100,0.6) 50%, rgba(30,90,100,0.4) 100%)',
          }}
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-[3em] font-black tracking-wide leading-tight mb-4 text-white uppercase" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.3)'}}>
            {content.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl font-medium leading-relaxed">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Our Approach */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 px-6 bg-section-alt">
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="font-heading text-[2.5em] font-bold mb-6 uppercase text-brand dark:text-primary">
              {t('ourApproach')}
            </h2>
            <p className="text-base leading-relaxed font-medium text-foreground">
              {content.approach.text}
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* Our Services -- 3-column grid with illustration icons */}
      <section className="py-16 px-6 bg-section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="font-heading text-[2.5em] font-bold mb-10 text-center uppercase text-brand dark:text-primary">
              {t('ourServices')}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.services.map((service, index) => (
              <ScrollReveal key={service.title} animation="fade-up" delay={index * 100}>
                <div className="text-center p-8">
                  <div className="flex justify-center mb-4">
                    <Image
                      src={service.icon}
                      alt={service.title}
                      width={180}
                      height={180}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-heading text-[1.5em] font-bold mb-2 text-brand dark:text-primary">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Path to Resilience -- overview image + 3 stage illustrations */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="font-heading text-[2.5em] font-bold mb-6 text-center uppercase text-brand dark:text-primary">
              {t('pathToResilience')}
            </h2>
          </ScrollReveal>
          {/* Overview diagram */}
          <ScrollReveal animation="fade-up">
            <div className="flex justify-center mb-10">
              <Image
                src="/images/investor-services/path-to-resilience.png"
                alt="Path to Resilience overview"
                width={800}
                height={200}
                className="object-contain max-w-full"
              />
            </div>
          </ScrollReveal>
          {/* Three stage cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.pathToResilience.stages.map((stage, index) => (
              <ScrollReveal key={stage.title} animation="fade-up" delay={index * 150}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <Image
                      src={stage.image}
                      alt={stage.title}
                      width={300}
                      height={200}
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-2 text-brand dark:text-primary">
                    {stage.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    {stage.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Measurement -- circular percentage graphics */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 px-6 bg-section-alt">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-[2.5em] font-bold mb-10 text-center uppercase text-brand dark:text-primary">
              {t('impactMeasurement')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Environmental */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Image
                    src={content.impactMeasurement.environmental.image}
                    alt="Environmental impact"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2 text-accent">
                  {t('environmental')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {content.impactMeasurement.environmental.description}
                </p>
              </div>
              {/* Social */}
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <Image
                    src={content.impactMeasurement.social.image}
                    alt="Social impact"
                    width={200}
                    height={200}
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wide mb-2 text-gold">
                  {t('social')}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {content.impactMeasurement.social.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* SDGs */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 px-6 bg-background">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-[2.5em] font-bold mb-6 uppercase text-brand dark:text-primary">
              {t('sdgsTitle')} (SDGs)
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed mb-8 font-medium">
              {content.sdgDescription}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {content.sdgs.map((sdg) => (
                <Image
                  key={sdg}
                  src={sdgImagePath(sdg)}
                  alt={`SDG ${sdg}: ${sdgNames[sdg] ?? ''}`}
                  title={`SDG ${sdg}: ${sdgNames[sdg] ?? ''}`}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded shadow-md object-cover"
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Use Cases -- alternating layout with percentage circles */}
      <section className="py-16 px-6 bg-section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="font-heading text-[2.5em] font-bold mb-10 text-center uppercase text-brand dark:text-primary">
              {t('useCasesTitle')}
            </h2>
          </ScrollReveal>
          <div className="space-y-12">
            {content.useCases.map((useCase, index) => {
              const isReversed = index % 2 === 1;
              return (
                <ScrollReveal key={useCase.title} animation="fade-up" delay={index * 100}>
                  <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center glass-card rounded-xl p-8`}>
                    {/* Text content */}
                    <div className="flex-1">
                      <h3 className="font-heading text-[1.75em] font-bold mb-4 text-brand dark:text-primary">
                        {useCase.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {useCase.description}
                      </p>
                      {/* SDG badges */}
                      <div className="flex flex-wrap gap-2">
                        {useCase.sdgs.map((sdg) => (
                          <Image
                            key={sdg}
                            src={sdgImagePath(sdg)}
                            alt={`SDG ${sdg}: ${sdgNames[sdg] ?? ''}`}
                            title={`SDG ${sdg}: ${sdgNames[sdg] ?? ''}`}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded shadow-sm object-cover"
                          />
                        ))}
                      </div>
                    </div>
                    {/* Percentage circles */}
                    <div className="flex gap-6 items-center shrink-0">
                      <div className="text-center">
                        <Image
                          src={useCase.socialImage}
                          alt={`Social: ${useCase.social}%`}
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                        <span className="text-xs font-bold uppercase tracking-wide block mt-1 text-gold">
                          {t('social')}
                        </span>
                      </div>
                      <div className="text-center">
                        <Image
                          src={useCase.environmentalImage}
                          alt={`Environmental: ${useCase.environmental}%`}
                          width={120}
                          height={120}
                          className="object-contain"
                        />
                        <span className="text-xs font-bold uppercase tracking-wide block mt-1 text-accent">
                          {t('environmental')}
                        </span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Green Finance Radar CTA */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 px-6 bg-accent">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-[2.5em] font-bold mb-4 text-white uppercase">
              {content.greenFinanceRadar.title}
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              {content.greenFinanceRadar.text}
            </p>
            <a
              href={content.greenFinanceRadar.ctaHref}
              className="bg-white px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity inline-block text-accent"
            >
              {content.greenFinanceRadar.ctaText}
            </a>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
