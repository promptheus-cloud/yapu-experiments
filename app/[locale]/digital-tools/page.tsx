import {readContent} from '@/lib/content';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {Testimonial} from '@/components/Testimonial';
import {ScrollReveal} from '@/components/ScrollReveal';
import Image from 'next/image';
import type {Metadata} from 'next';

export const dynamic = 'force-dynamic';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'DigitalToolsMeta'});
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

interface DigitalToolsContent {
  hero: {title: string; subtitle: string; ctaText: string; ctaHref: string};
  sections: {
    frontOffice: {title: string; subtitle: string; text: string; features: string[]};
    teamManagement: {title: string; subtitle: string; text: string; features: string[]};
    loanDecision: {title: string; subtitle: string; text: string; features: string[]};
    apiIntegration: {title: string; subtitle: string; text: string; features: string[]};
    learningOrganization: {title: string; subtitle: string; text: string; features: string[]};
    features: Array<{title: string; description: string; icon: string}>;
  };
  testimonial: {
    quote: string;
    author: string;
    role: string;
    organization: string;
  };
}

const featureIconMap: Record<string, string> = {
  Workflow: '/images/icons/icon-workflow-management.png',
  Users: '/images/icons/icon-your-team-connected.png',
  WifiOff: '/images/icons/icon-offline-function.png',
  BarChart: '/images/icons/icon-improved-scoring.png',
  MapPin: '/images/icons/icon-geolocalization.png',
  Shield: '/images/icons/icon-security.png',
};

const frontOfficePhones = [
  {src: '/images/mockups/phone-1-digital-tools.png', alt: 'YAPU secure login screen'},
  {src: '/images/mockups/phone-2-digital-tools.png', alt: 'YAPU field data gathering'},
  {src: '/images/mockups/phone-3-digital-tools.png', alt: 'YAPU results display'},
];

function HighlightedSubtitle({children, className = ''}: {children: React.ReactNode; className?: string}) {
  return (
    <p className={`text-center text-lg mb-10 max-w-2xl mx-auto ${className}`}>
      <span className="inline font-bold leading-relaxed" style={{
        backgroundColor: 'oklch(0.62 0.09 190)',
        color: 'white',
        padding: '0.15em 0.4em',
        boxDecorationBreak: 'clone' as const,
        WebkitBoxDecorationBreak: 'clone' as const,
      }}>
        {children}
      </span>
    </p>
  );
}

function FlowArrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="text-accent">
        <path d="M0 12H52M52 12L42 4M52 12L42 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}


export default async function DigitalToolsPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const content = readContent<DigitalToolsContent>('digital-tools', locale);
  const t = await getTranslations('DigitalTools');

  const {sections} = content;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, oklch(0.35 0.06 195) 0%, oklch(0.28 0.05 210) 100%)',
      }}>
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center gap-10">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-wider mb-6">
              {content.hero.title}
            </h1>
            <p className="text-lg md:text-xl leading-relaxed max-w-xl">
              <span className="inline font-bold" style={{
                backgroundColor: 'oklch(0.62 0.09 190)',
                color: 'white',
                padding: '0.15em 0.4em',
                boxDecorationBreak: 'clone' as const,
                WebkitBoxDecorationBreak: 'clone' as const,
              }}>
                {content.hero.subtitle}
              </span>
            </p>
          </div>
          <div className="hidden lg:flex flex-shrink-0">
            <div className="relative w-[280px] h-[420px]">
              <Image
                src="/images/phone-digital-tools-hero.png"
                alt="YAPU digital tools mobile app"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Your Digital Front Office -- White background, 3 phones with arrows */}
      <ScrollReveal animation="fade-up">
        <section id="front-office" className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand uppercase tracking-wide text-center mb-3">
              {sections.frontOffice.title}
            </h2>
            <HighlightedSubtitle>{sections.frontOffice.subtitle}</HighlightedSubtitle>
            <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-0">
              {frontOfficePhones.map((phone, i) => (
                <div key={phone.src} className="flex items-center">
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="relative w-[200px] h-[360px] md:w-[220px] md:h-[400px] mb-4">
                      <Image
                        src={phone.src}
                        alt={phone.alt}
                        fill
                        className="object-contain drop-shadow-lg"
                      />
                    </div>
                    <p className="text-muted-foreground font-medium text-sm">
                      {sections.frontOffice.features[i]}
                    </p>
                  </div>
                  {i < 2 && <FlowArrow />}
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 2: Your Digital Team Management -- TEAL background, white text */}
      <ScrollReveal animation="fade-left">
        <section id="team-management" className="py-16 px-6" style={{
          backgroundColor: 'rgb(69, 181, 180)',
        }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide text-center mb-3">
              {sections.teamManagement.title}
            </h2>
            <HighlightedSubtitle>{sections.teamManagement.subtitle}</HighlightedSubtitle>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <ul className="space-y-3">
                  {sections.teamManagement.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white font-medium">
                      <span className="mt-2 w-2.5 h-2.5 rounded-full bg-white/80 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-lg aspect-[4/3]">
                  <Image
                    src="/images/mockups/laptop-1-digital-tools.png"
                    alt="YAPU team management dashboard"
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 3: Your Digital Loan Decision -- White bg, image + bullets below */}
      <ScrollReveal animation="fade-right">
        <section id="loan-decision" className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand uppercase tracking-wide text-center mb-3">
              {sections.loanDecision.title}
            </h2>
            <HighlightedSubtitle>{sections.loanDecision.subtitle}</HighlightedSubtitle>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-lg aspect-[4/3]">
                  <Image
                    src="/images/mockups/laptop-1-digital-tools.png"
                    alt="YAPU loan decision dashboard"
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
              </div>
              <div className="flex-1">
                <ul className="space-y-3">
                  {sections.loanDecision.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-2 w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 4: YAPU API -- Dark teal, text left, API diagram right */}
      <ScrollReveal animation="fade-left">
        <section id="api-integration" className="py-16 px-6" style={{
          background: 'linear-gradient(135deg, oklch(0.35 0.06 195) 0%, oklch(0.28 0.05 210) 100%)',
        }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-wide text-center mb-3">
              {sections.apiIntegration.title}
            </h2>
            <HighlightedSubtitle>{sections.apiIntegration.subtitle}</HighlightedSubtitle>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <ul className="space-y-3">
                  {sections.apiIntegration.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-white/90 font-medium">
                      <span className="mt-2 w-2.5 h-2.5 rounded-full bg-white/70 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-sm aspect-square">
                  <Image
                    src="/images/mockups/yapu-api-image.svg"
                    alt="YAPU API integration diagram"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Section 5: Your Learning Organization -- White bg, text left, dashboard right */}
      <ScrollReveal animation="fade-right">
        <section id="learning-organization" className="py-16 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-brand uppercase tracking-wide text-center mb-3">
              {sections.learningOrganization.title}
            </h2>
            <HighlightedSubtitle>{sections.learningOrganization.subtitle}</HighlightedSubtitle>
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <ul className="space-y-3">
                  {sections.learningOrganization.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-2 w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-lg aspect-[4/3]">
                  <Image
                    src="/images/mockups/laptop-home.png"
                    alt="YAPU learning organization dashboard"
                    fill
                    className="object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Features Grid -- original PNG icons, no card backgrounds */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-brand text-center uppercase tracking-wide">{t('features')}</h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {sections.features.map((feature, index) => {
              const iconSrc = featureIconMap[feature.icon] ?? featureIconMap.Shield;
              return (
                <ScrollReveal key={feature.title} animation="fade-up" delay={index * 100}>
                  <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <Image
                        src={iconSrc}
                        alt={feature.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <ScrollReveal animation="fade-in">
        <Testimonial
          title={t('testimonialTitle')}
          quote={content.testimonial.quote}
          author={content.testimonial.author}
          role={content.testimonial.role}
          organization={content.testimonial.organization}
        />
      </ScrollReveal>
    </>
  );
}
