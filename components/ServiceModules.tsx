import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ArrowRight } from 'lucide-react';

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

interface ServiceModulesProps {
  modules: ServiceModule[];
}

type SectionStyle = {
  sectionClass: string;
  titleClass: string;
  bulletClass: string;
  linkClass: string;
  borderClass: string;
};

const sectionConfig: Record<string, SectionStyle> = {
  'investor-services': {
    sectionClass: 'bg-section-alt',
    titleClass: 'text-brand dark:text-primary',
    bulletClass: 'text-muted-foreground',
    linkClass: 'text-cta',
    borderClass: 'border-l-[3px] border-brand dark:border-primary',
  },
  'data-insights': {
    sectionClass: 'bg-background',
    titleClass: 'text-brand dark:text-primary',
    bulletClass: 'text-muted-foreground',
    linkClass: 'text-cta',
    borderClass: 'border-l-[3px] border-accent',
  },
  'digital-tools': {
    sectionClass: 'bg-section-alt',
    titleClass: 'text-brand dark:text-primary',
    bulletClass: 'text-muted-foreground',
    linkClass: 'text-cta',
    borderClass: 'border-l-[3px] border-brand dark:border-primary',
  },
  impact: {
    sectionClass: 'service-section-impact relative overflow-hidden',
    titleClass: 'text-white',
    bulletClass: 'text-white/80',
    linkClass: 'text-white hover:text-white/80',
    borderClass: 'border-l-[3px] border-white/40',
  },
};

const defaultStyle: SectionStyle = {
  sectionClass: 'bg-section-alt',
  titleClass: 'text-brand dark:text-primary',
  bulletClass: 'text-muted-foreground',
  linkClass: 'text-cta',
  borderClass: 'border-l-[3px] border-brand dark:border-primary',
};

export function ServiceModules({ modules }: ServiceModulesProps) {
  return (
    <>
      {modules.map((module, index) => {
        const style = sectionConfig[module.id] ?? defaultStyle;
        const isReversed = index % 2 === 1;

        const isImpact = module.id === 'impact';

        return (
          <section
            key={module.id}
            id={module.id}
            className={`py-16 px-6 ${style.sectionClass}`}
          >
            {/* Impact: background image with overlay */}
            {isImpact && (
              <>
                <Image
                  src="/images/impact-header.jpg"
                  alt=""
                  fill
                  className="object-cover"
                  aria-hidden="true"
                  priority={false}
                />
                <div className="absolute inset-0 bg-black/70" aria-hidden="true" />
              </>
            )}

            <div
              className={`max-w-6xl mx-auto flex flex-col items-center gap-12 md:flex-row ${
                isImpact ? 'relative z-10' : ''
              } ${isReversed ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Text Column */}
              <div className={`flex-1 space-y-6 pl-5 ${style.borderClass} dark:glass-card dark:rounded-xl dark:p-8`}>
                <h2
                  className={`text-3xl font-bold uppercase tracking-wide md:text-4xl ${style.titleClass}`}
                >
                  {module.title}
                </h2>
                <ul className="space-y-3">
                  {module.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-3 text-lg ${style.bulletClass}`}
                    >
                      <span
                        className="mt-2 w-1.5 h-1.5 rounded-full bg-current flex-shrink-0 opacity-70"
                        aria-hidden="true"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
                <Link
                  href={module.href}
                  className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider hover:underline ${style.linkClass}`}
                >
                  {module.readMoreText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Image Column (not for impact — uses background instead) */}
              {module.image && !isImpact && (
                <div className="flex-1 flex flex-col items-center gap-4">
                  <Image
                    src={module.image}
                    alt={module.imageAlt || module.title}
                    width={600}
                    height={400}
                    className="h-auto w-full max-w-md object-contain shadow-xl rounded-lg"
                  />
                  {module.badge && (
                    <Image
                      src={module.badge}
                      alt={module.badgeAlt || ''}
                      width={160}
                      height={60}
                      className="h-auto object-contain"
                    />
                  )}
                </div>
              )}
              {/* Impact: show S4R logo below text */}
              {isImpact && module.badge && (
                <div className="flex-1 flex justify-center relative z-10">
                  <Image
                    src={module.badge}
                    alt={module.badgeAlt || ''}
                    width={200}
                    height={80}
                    className="h-auto object-contain"
                  />
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
