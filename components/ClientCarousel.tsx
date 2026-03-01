"use client";

import Image from 'next/image';

interface Logo {
  alt: string;
  src: string;
}

interface ClientCarouselProps {
  title: string;
  logos: Logo[];
}

export function ClientCarousel({ title, logos }: ClientCarouselProps) {
  // Double the logos for seamless infinite scroll
  const doubled = [...logos, ...logos];

  return (
    <section className="py-16 px-6 bg-background overflow-hidden" aria-label={title}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-12">
          {title}
        </h2>
        <div className="relative dark:glass-card dark:rounded-xl dark:p-8">
          <div className="flex gap-12 animate-scroll-left hover:[animation-play-state:paused]">
            {doubled.map((logo, i) => (
              <div
                key={`${logo.alt}-${i}`}
                className="flex-none flex items-center justify-center"
                style={{ width: 'calc(100% / 5 - 2.4rem)' }}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={400}
                  height={160}
                  className="object-contain h-24 w-auto grayscale hover:grayscale-0 transition-all duration-300 dark:invert dark:hover:invert-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
