import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaHref?: string;
  variant?: 'homepage' | 'subpage';
  backgroundImage?: string;
}

export function Hero({ title, subtitle, ctaText, ctaHref, variant = 'homepage', backgroundImage }: HeroProps) {
  if (variant === 'subpage') {
    return (
      <section
        className="relative min-h-[40vh] flex items-center"
        style={{
          background: 'linear-gradient(135deg, oklch(0.35 0.07 195) 0%, oklch(0.22 0.04 210) 100%)',
        }}
      >
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 md:py-20">
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide leading-tight mb-4 text-white uppercase">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-xl font-light leading-relaxed">
            {subtitle}
          </p>
          {ctaText && ctaHref && (
            <a
              href={ctaHref}
              className="mt-8 bg-cta text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block text-lg"
            >
              {ctaText}
            </a>
          )}
        </div>
      </section>
    );
  }

  /* Homepage variant: full background image + laptop mockup */

  /* Split the title into the three styled lines:
     "YAPU facilitates resilience finance for the most vulnerable"
     → Line 1: "YAPU FACILITATES"  (white, uppercase, bold)
     → Line 2: "resilience finance" (accent/mint, italic)
     → Line 3: "FOR THE most vulnerable" (white, "most vulnerable" italic)

     We parse the title to stay content-driven, but fall back gracefully. */

  const facilitatesIdx = title.toLowerCase().indexOf('facilitates');
  const resilienceIdx = title.toLowerCase().indexOf('resilience finance');
  const forTheIdx = title.toLowerCase().indexOf('for the');

  let line1 = '';
  let line2 = '';
  let line3pre = '';
  let line3emphasis = '';

  if (facilitatesIdx !== -1 && resilienceIdx !== -1 && forTheIdx !== -1) {
    line1 = title.slice(0, resilienceIdx).trim();
    line2 = title.slice(resilienceIdx, forTheIdx).trim();
    const remainder = title.slice(forTheIdx).trim();
    // "for the most vulnerable" → "FOR THE" + "most vulnerable"
    const words = remainder.split(' ');
    line3pre = words.slice(0, 2).join(' ');
    line3emphasis = words.slice(2).join(' ');
  }

  const hasParsedLines = line1 && line2;

  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background image */}
      <Image
        src={backgroundImage || "/images/homepage-header-bg.jpg"}
        alt=""
        fill
        priority
        className="object-cover"
      />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, oklch(0.15 0.04 195 / 0.88) 0%, oklch(0.15 0.04 195 / 0.65) 60%, oklch(0.15 0.04 195 / 0.40) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 md:py-28 flex items-center">
        {/* Left: text */}
        <div className="max-w-[60%] lg:max-w-[55%]">
          {hasParsedLines ? (
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-wide leading-tight mb-8">
              <span className="block text-white uppercase">{line1}</span>
              <span className="block text-accent italic font-normal font-sans">{line2}</span>
              <span className="block text-white uppercase">
                {line3pre}{' '}
                <span className="italic normal-case">{line3emphasis}</span>
              </span>
            </h1>
          ) : (
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-wide leading-tight mb-8 text-white uppercase">
              {title}
            </h1>
          )}

          <p className="text-lg md:text-xl mb-10 text-white/70 max-w-xl font-light leading-relaxed">
            {subtitle}
          </p>

          {ctaText && ctaHref && (
            <a
              href={ctaHref}
              className="bg-cta text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-block text-lg"
            >
              {ctaText}
            </a>
          )}
        </div>

        {/* Right spacer — background image fills this area */}
        <div className="hidden lg:flex flex-1" />
      </div>
    </section>
  );
}
