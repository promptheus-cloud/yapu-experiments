import {readContent} from '@/lib/content';
import {setRequestLocale, getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {Mail, Linkedin, Twitter, Facebook, Youtube} from 'lucide-react';
import Image from 'next/image';
import {Input} from '@/components/ui/input';
import {ScrollReveal} from '@/components/ScrollReveal';
import type {Metadata} from 'next';

export const dynamic = 'force-dynamic';

type Props = {params: Promise<{locale: string}>};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: 'AboutMeta'});
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}

interface TeamMember {
  name: string;
  email: string;
  linkedin: string;
  photo?: string;
}

interface Address {
  company: string;
  lines: string[];
}

interface AboutContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaHref: string;
  };
  origin: {
    title: string;
    body: string;
  };
  team: TeamMember[];
  mission: {
    title: string;
    text: string;
  };
  sdgs: number[];
  contact: {
    title: string;
    intro: string;
    addresses?: Address[];
    email?: string;
  };
}

function sdgImagePath(sdg: number): string {
  return `/images/sdg/sdg-${String(sdg).padStart(2, '0')}.jpg`;
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const content = readContent<AboutContent>('about', locale);
  const t = await getTranslations('About');

  const originParagraphs = content.origin.body.split('\n\n').filter(Boolean);
  const missionParagraphs = content.mission.text.split('\n\n').filter(Boolean);

  return (
    <>
      {/* Hero */}
      <section className="bg-brand text-white py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-wide mb-6">
            {content.hero.title}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            {content.hero.subtitle}
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 md:py-20 px-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-brand dark:text-primary uppercase tracking-wide mb-8">
              {content.origin.title}
            </h2>
            <div className="space-y-5">
              {originParagraphs.map((para, i) => (
                <p key={i} className="text-foreground/80 leading-relaxed text-base md:text-lg">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Team Grid */}
      <section className="py-16 md:py-20 px-6 bg-section-alt">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal animation="fade-up">
            <h2 className="text-2xl md:text-3xl font-black text-brand dark:text-primary uppercase tracking-wide text-center mb-12">
              {t('teamTitle')}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {content.team.map((member, index) => (
              <ScrollReveal key={member.name} animation="fade-up" delay={index * 80}>
                <div className="text-center dark:glass-card dark:rounded-xl dark:p-4">
                  <div className="w-full aspect-square bg-section-alt mb-4 overflow-hidden rounded-lg">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={280}
                        height={280}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-bold text-muted-foreground">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-base font-black text-foreground mb-2">
                    {member.name}
                  </h3>
                  <div className="flex items-center justify-center gap-3">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-muted-foreground hover:text-brand transition-colors"
                        title={member.email}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    )}
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-brand transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Do What We Do */}
      <ScrollReveal animation="fade-in">
        <section className="py-16 md:py-20 px-6 bg-brand text-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-8">
              {t('missionTitle')}
            </h2>
            <div className="space-y-5">
              {missionParagraphs.map((para, i) => (
                <p key={i} className="text-white/90 leading-relaxed text-base md:text-lg">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* SDGs */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 md:py-20 px-6 bg-section-alt">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl md:text-2xl font-black text-brand dark:text-primary uppercase tracking-wide text-center mb-10">
              {t('sdgsTitle')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {content.sdgs.map((sdg) => (
                <Image
                  key={sdg}
                  src={sdgImagePath(sdg)}
                  alt={`SDG ${sdg}`}
                  width={200}
                  height={200}
                  className="w-full aspect-square object-cover rounded-lg hover-scale"
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Contact / Partners */}
      <ScrollReveal animation="fade-up">
        <section className="py-16 md:py-20 px-6 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black text-brand dark:text-primary uppercase tracking-wide mb-10">
              {t('contactTitle')}
            </h2>

            {/* Addresses */}
            {content.contact.addresses && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {content.contact.addresses.map((addr) => (
                  <div key={addr.company}>
                    <h3 className="font-bold text-foreground mb-2">{addr.company}</h3>
                    {addr.lines.map((line, i) => (
                      <p key={i} className="text-muted-foreground text-sm">{line}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {content.contact.email && (
              <p className="text-muted-foreground mb-4">
                <a href={`mailto:${content.contact.email}`} className="text-brand hover:underline">
                  {content.contact.email}
                </a>
              </p>
            )}

            <div className="flex gap-3 mb-10">
              <a href="https://twitter.com/yapusolutions" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/yapu-solutions/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/yapusolutions" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/channel/UCyapusolutions" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Contact Form */}
            <form className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('contactFirstName')}*
                  </label>
                  <Input type="text" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    {t('contactLastName')}*
                  </label>
                  <Input type="text" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('contactEmail')}*
                </label>
                <Input type="email" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('contactCountry')}*
                </label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">{t('contactCountry')}</option>
                  <option value="AF">Afghanistan</option>
                  <option value="AL">Albania</option>
                  <option value="DZ">Algeria</option>
                  <option value="AR">Argentina</option>
                  <option value="AU">Australia</option>
                  <option value="AT">Austria</option>
                  <option value="BD">Bangladesh</option>
                  <option value="BE">Belgium</option>
                  <option value="BO">Bolivia</option>
                  <option value="BR">Brazil</option>
                  <option value="CA">Canada</option>
                  <option value="CL">Chile</option>
                  <option value="CN">China</option>
                  <option value="CO">Colombia</option>
                  <option value="CR">Costa Rica</option>
                  <option value="DE">Germany</option>
                  <option value="EC">Ecuador</option>
                  <option value="EG">Egypt</option>
                  <option value="ES">Spain</option>
                  <option value="ET">Ethiopia</option>
                  <option value="FR">France</option>
                  <option value="GB">United Kingdom</option>
                  <option value="GH">Ghana</option>
                  <option value="GT">Guatemala</option>
                  <option value="HN">Honduras</option>
                  <option value="IN">India</option>
                  <option value="ID">Indonesia</option>
                  <option value="IT">Italy</option>
                  <option value="JP">Japan</option>
                  <option value="KE">Kenya</option>
                  <option value="KH">Cambodia</option>
                  <option value="MX">Mexico</option>
                  <option value="MM">Myanmar</option>
                  <option value="NG">Nigeria</option>
                  <option value="NL">Netherlands</option>
                  <option value="NP">Nepal</option>
                  <option value="PE">Peru</option>
                  <option value="PH">Philippines</option>
                  <option value="PK">Pakistan</option>
                  <option value="PY">Paraguay</option>
                  <option value="RW">Rwanda</option>
                  <option value="SN">Senegal</option>
                  <option value="TZ">Tanzania</option>
                  <option value="UG">Uganda</option>
                  <option value="US">United States</option>
                  <option value="UY">Uruguay</option>
                  <option value="VN">Vietnam</option>
                  <option value="ZA">South Africa</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('contactEmploymentStatus')}*
                </label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">---</option>
                  <option value="employed">Employed</option>
                  <option value="independent">Independent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('contactEmploymentDetails')}*
                </label>
                <Input type="text" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  {t('contactLinkedIn')}
                </label>
                <Input type="url" />
              </div>
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="consent"
                  className="mt-1 w-4 h-4 rounded border-border accent-brand"
                />
                <label
                  htmlFor="consent"
                  className="text-sm text-muted-foreground"
                >
                  {t('contactConsent')} *
                </label>
              </div>
              <button
                type="button"
                className="bg-cta text-white py-3 px-10 rounded-lg font-semibold hover:bg-white hover:text-cta transition-colors border-2 border-cta btn-hover"
              >
                {t('contactSubmit')}
              </button>
            </form>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
