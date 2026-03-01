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
  const t = await getTranslations({locale, namespace: 'ImpactMeta'});
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

interface Partner {
  name: string;
  logo: string;
}

interface ImpactReference {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  logo: string | null;
  link: string;
  layout: 'picture-left' | 'picture-right';
}

interface ImpactContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  digitalResilienceFinance: {
    title: string;
    rows: Array<{image: string; text: string}>;
  };
  scaleForResilience: {
    title: string;
    intro: string;
    headerImage: string;
    logo: string;
    description: string;
    ctaText: string;
    ctaHref: string;
    partners: Partner[];
  };
  impactReferences: ImpactReference[];
}

export default async function ImpactPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const content = readContent<ImpactContent>('impact', locale);

  return (
    <>
      {/* Hero — Gold background with cover image */}
      <section className="relative text-white py-20 md:py-28 px-6 overflow-hidden min-h-[400px] md:min-h-[480px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: `url(${content.hero.backgroundImage})`}}
        />
        <div className="absolute inset-0 bg-gold/50" />
        <div className="relative max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-[0.1em] mb-6">
                {content.hero.title}
              </h1>
              <p className="text-xl md:text-2xl lg:text-[1.75rem] font-medium leading-relaxed">
                <span className="bg-gold/80 box-decoration-clone px-2 py-1 leading-[2.2]">
                  {content.hero.subtitle}
                </span>
              </p>
            </div>
            <div className="hidden md:block" />
          </div>
        </div>
      </section>

      {/* Digital Resilience Finance */}
      <section className="py-16 md:py-20 px-6 bg-background" id="digital-resilience-finance">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-wide mb-12 text-center">
              {content.digitalResilienceFinance.title}
            </h2>
          </ScrollReveal>

          <div className="space-y-0">
            {content.digitalResilienceFinance.rows.map((row, index) => (
              <ScrollReveal key={index} animation="fade-up" delay={index * 100}>
                <div>
                  <div className="relative w-full h-[50vw] max-h-[500px] overflow-hidden">
                    <Image
                      src={row.image}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="bg-gold text-white p-8 md:p-12">
                    <p className="leading-relaxed text-lg md:text-xl font-light max-w-4xl">
                      {row.text}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Scale for Resilience */}
      <section className="py-16 md:py-20 px-6 bg-section-alt" id="scale-for-resilience">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-[0.15em] mb-6 text-center">
              {content.scaleForResilience.title}
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fade-up">
            <p className="text-lg font-medium leading-relaxed mb-8 max-w-4xl">
              <span className="bg-accent/30 text-foreground box-decoration-clone px-2 py-1 leading-[2.2]">
                {content.scaleForResilience.intro}
              </span>
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fade-up">
            <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8">
              <Image
                src={content.scaleForResilience.headerImage}
                alt="Scale for Resilience"
                fill
                className="object-cover"
              />
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="mb-6">
                  <Image
                    src={content.scaleForResilience.logo}
                    alt="Scale for Resilience"
                    width={280}
                    height={90}
                    className="object-contain h-20 w-auto"
                  />
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg mb-6">
                  {content.scaleForResilience.description}
                </p>
                <a
                  href={content.scaleForResilience.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-accent text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity btn-hover"
                >
                  {content.scaleForResilience.ctaText}
                </a>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-6 text-foreground uppercase tracking-wide">
                  Partners
                </h3>
                <div className="space-y-4">
                  {content.scaleForResilience.partners.map((partner) => (
                    <div key={partner.name} className="bg-card glass-card rounded-lg p-4">
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={160}
                        height={80}
                        className="object-contain h-12 w-auto dark:invert"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Impact References */}
      <section className="py-16 md:py-20 px-6 bg-background" id="impact-references">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-[0.15em] mb-12 text-center">
              Impact References
            </h2>
          </ScrollReveal>

          <div className="space-y-0">
            {content.impactReferences.map((ref, index) => {
              const isPictureLeft = ref.layout === 'picture-left';

              return (
                <ScrollReveal key={ref.title} animation="fade-up" delay={index * 100}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[400px]">
                    {/* Image column */}
                    <div
                      className={`relative overflow-hidden ${
                        isPictureLeft ? 'md:order-1' : 'md:order-2'
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{backgroundImage: `url(${ref.image})`}}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                      {ref.logo && (
                        <div className="absolute bottom-6 left-6">
                          <Image
                            src={ref.logo}
                            alt={ref.title}
                            width={160}
                            height={70}
                            className="object-contain h-14 w-auto dark:invert"
                          />
                        </div>
                      )}
                      <div className="relative h-64 md:h-full min-h-[300px]" />
                    </div>

                    {/* Text column */}
                    <div
                      className={`flex flex-col justify-center p-8 md:p-12 bg-card dark:glass-card ${
                        isPictureLeft ? 'md:order-2' : 'md:order-1'
                      }`}
                    >
                      <h3 className="text-xl md:text-2xl font-black text-brand dark:text-primary uppercase tracking-wide mb-1">
                        {ref.title}
                      </h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4 font-medium">
                        {ref.subtitle}
                      </p>
                      {ref.description.split('\n\n').map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-muted-foreground leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      ))}
                      <a
                        href={ref.link}
                        className="inline-block bg-cta text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity mt-2 self-start btn-hover"
                      >
                        read more
                      </a>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
