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
  const t = await getTranslations({locale, namespace: 'DataInsightsMeta'});
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

interface DataInsightsContent {
  hero: {title: string; subtitle: string};
  overview: {text: string};
  categories: Array<{title: string; icon: string}>;
  sections: {
    creditRisk: {
      title: string;
      icon: string;
      text: string;
      features: string[];
      benefits: string[];
      image: string;
    };
    financialRisks: {
      title: string;
      icon: string;
      intro: string;
      text: string;
      benefits: string[];
      images: {laptop: string; phone: string};
    };
    resilienceFinance: {
      title: string;
      icon: string;
      intro: string;
      features: string[];
      benefits: string[];
      callout: string;
      image: string;
      example: {title: string; text: string};
    };
    performanceMonitoring: {
      title: string;
      icon: string;
      text: string;
      dashboards: Array<{title: string; image: string}>;
      benefits: string[];
    };
    capacityBuilding: {
      title: string;
      intro: string;
      pillars: Array<{title: string; description: string}>;
    };
  };
}

/* These sections use brand-colored backgrounds with white text — they work in both modes */

export default async function DataInsightsPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const content = readContent<DataInsightsContent>('data-insights', locale);

  const {sections} = content;

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-brand">
        <div className="max-w-[1200px] mx-auto px-8 py-16 md:py-20 flex items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-wider mb-4">
              {content.hero.title}
            </h1>
            <p className="inline-block text-lg text-white leading-relaxed px-6 py-3 rounded bg-accent">
              {content.hero.subtitle}
            </p>
          </div>
          <div className="hidden lg:flex flex-shrink-0">
            <div className="relative w-[400px] h-[280px]">
              <Image
                src="/images/data-insights/laptop-data-insights.png"
                alt="YAPU data insights dashboard"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== DATA INSIGHTS OVERVIEW with Icon Grid ===== */}
      <section className="py-16 px-8 bg-background">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-black mb-4 text-center uppercase tracking-wider text-brand dark:text-primary">
              Data Insights
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              {content.overview.text}
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {content.categories.map((category, index) => (
              <ScrollReveal key={category.title} animation="fade-up" delay={index * 80}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.icon}
                      alt={category.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{category.title}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CREDIT RISK ASSESSMENT ===== */}
      <ScrollReveal animation="fade-up">
        <section id="credit-risk" className="py-16 px-8 bg-brand">
          <div className="max-w-[1200px] mx-auto">
            {/* Section heading */}
            <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider text-center mb-8">
              {sections.creditRisk.title}
            </h2>

            <div className="flex flex-col md:flex-row items-start gap-10">
              {/* Icon + Text + features */}
              <div className="flex-1">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={sections.creditRisk.icon} alt="" className="w-full h-full object-contain" />
                  </div>
                  <p className="inline-block text-lg text-white font-bold leading-relaxed px-5 py-3 rounded bg-accent">
                    {sections.creditRisk.text}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {sections.creditRisk.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-white">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/60 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Phone image */}
              <div className="flex-shrink-0 flex justify-center">
                <div className="relative w-[260px] h-[460px]">
                  <Image
                    src={sections.creditRisk.image}
                    alt="YAPU credit risk assessment on mobile"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Benefits box */}
            <div className="mt-8 rounded-lg p-6 bg-accent">
              <h3 className="text-xl font-bold text-white mb-4">Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.creditRisk.benefits.map((benefit) => (
                  <p key={benefit} className="text-white/90 leading-relaxed">{benefit}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ===== SOCIAL, CLIMATE & NATURE-RELATED FINANCIAL RISKS ===== */}
      <ScrollReveal animation="fade-up">
        <section id="financial-risks" className="py-16 px-8 bg-background">
          <div className="max-w-[1200px] mx-auto">
            {/* Section icon + heading */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-12 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sections.financialRisks.icon} alt="" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-brand dark:text-primary">
                {sections.financialRisks.title}
              </h2>
            </div>

            <p className="text-muted-foreground leading-relaxed mb-4 text-center max-w-3xl mx-auto font-medium">
              {sections.financialRisks.intro}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8 text-center max-w-3xl mx-auto">
              {sections.financialRisks.text}
            </p>

            {/* Images */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8">
              <div className="relative w-full max-w-md aspect-[4/3]">
                <Image
                  src={sections.financialRisks.images.laptop}
                  alt="YAPU climate risk dashboard"
                  fill
                  className="object-contain drop-shadow-xl"
                />
              </div>
              <div className="relative w-[180px] h-[320px]">
                <Image
                  src={sections.financialRisks.images.phone}
                  alt="YAPU climate risk mobile"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Benefits box */}
            <div className="rounded-lg p-6 bg-accent">
              <h3 className="text-xl font-bold text-white mb-4">Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.financialRisks.benefits.map((benefit) => (
                  <p key={benefit} className="text-white/90 leading-relaxed">{benefit}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ===== RESILIENCE FINANCE ===== */}
      <ScrollReveal animation="fade-up">
        <section id="resilience-finance" className="py-16 px-8 bg-accent">
          <div className="max-w-[1200px] mx-auto">
            {/* Section icon + heading */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-12 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sections.resilienceFinance.icon} alt="" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">
                {sections.resilienceFinance.title}
              </h2>
            </div>

            <p className="text-white font-bold text-lg mb-6 text-center max-w-3xl mx-auto">
              {sections.resilienceFinance.intro}
            </p>

            <div className="flex flex-col md:flex-row items-start gap-10">
              {/* Features */}
              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {sections.resilienceFinance.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white/90">
                      <span className="mt-2 w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Phone image */}
              <div className="flex-shrink-0 flex justify-center">
                <div className="relative w-[200px] h-[380px]">
                  <Image
                    src={sections.resilienceFinance.image}
                    alt="YAPU resilience finance verification"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Callout */}
            <div className="bg-white/20 rounded-lg px-6 py-4 mb-8 text-center">
              <p className="text-white font-bold text-lg">{sections.resilienceFinance.callout}</p>
            </div>

            {/* Benefits */}
            <div className="rounded-lg p-6 mb-8 bg-brand">
              <h3 className="text-xl font-bold text-white mb-4">Benefits</h3>
              <div className="space-y-3">
                {sections.resilienceFinance.benefits.map((benefit) => (
                  <p key={benefit} className="text-white/90 leading-relaxed">{benefit}</p>
                ))}
              </div>
            </div>

            {/* Example */}
            <div className="bg-card dark:bg-card rounded-lg p-8">
              <p className="text-sm font-bold uppercase tracking-wider mb-2 text-brand dark:text-primary">Example</p>
              <h3 className="text-xl font-black mb-3 text-brand dark:text-primary">
                {sections.resilienceFinance.example.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">{sections.resilienceFinance.example.text}</p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ===== PERFORMANCE MONITORING ===== */}
      <ScrollReveal animation="fade-up">
        <section id="performance-monitoring" className="py-16 px-8 bg-brand">
          <div className="max-w-[1200px] mx-auto">
            {/* Section heading */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-10 h-10 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sections.performanceMonitoring.icon} alt="" className="w-full h-full object-contain" style={{filter: 'brightness(0) invert(1)'}} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider">
                {sections.performanceMonitoring.title}
              </h2>
            </div>

            <p className="text-white/80 leading-relaxed mb-10 text-center max-w-3xl mx-auto">
              {sections.performanceMonitoring.text}
            </p>

            {/* Dashboard screenshots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {sections.performanceMonitoring.dashboards.map((dashboard) => (
                <div key={dashboard.title} className="bg-card rounded p-2.5 shadow-lg">
                  <div className="relative w-full aspect-[4/3]">
                    <Image
                      src={dashboard.image}
                      alt={dashboard.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="rounded-lg p-6 bg-accent">
              <h3 className="text-xl font-bold text-white mb-4">Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sections.performanceMonitoring.benefits.map((benefit) => (
                  <p key={benefit} className="text-white/90 leading-relaxed">{benefit}</p>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ===== CAPACITY BUILDING ===== */}
      <section id="capacity-building" className="py-16 px-8 bg-section-alt">
        <div className="max-w-[1200px] mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-center mb-4 text-brand dark:text-primary">
              {sections.capacityBuilding.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10 max-w-3xl mx-auto text-center">
              {sections.capacityBuilding.intro}
            </p>
          </ScrollReveal>

          {/* Institutional Assessment -- full width text */}
          <ScrollReveal animation="fade-up">
            <div className="mb-8">
              <h3 className="text-xl font-black mb-3 text-brand dark:text-primary">
                {sections.capacityBuilding.pillars[0].title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {sections.capacityBuilding.pillars[0].description}
              </p>
            </div>
          </ScrollReveal>

          {/* Photo + Consultancy */}
          <ScrollReveal animation="fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-0">
              <div className="h-[300px] bg-cover bg-center" style={{backgroundImage: 'url(/images/data-insights/capacity-workshop.jpg)'}} />
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-xl font-black mb-3 text-brand dark:text-primary">
                  {sections.capacityBuilding.pillars[1].title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {sections.capacityBuilding.pillars[1].description}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Training + Photo */}
          <ScrollReveal animation="fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-8 flex flex-col justify-center">
                <h3 className="text-xl font-black mb-3 text-brand dark:text-primary">
                  {sections.capacityBuilding.pillars[2].title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {sections.capacityBuilding.pillars[2].description}
                </p>
              </div>
              <div className="h-[300px] bg-cover bg-center" style={{backgroundImage: 'url(/images/data-insights/capacity-training.jpg)'}} />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
