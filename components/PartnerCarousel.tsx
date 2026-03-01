"use client";

import Image from 'next/image';

interface Logo {
  alt: string;
  src: string;
}

interface PartnerCarouselProps {
  title: string;
  logos: Logo[];
}

export function PartnerCarousel({ title, logos }: PartnerCarouselProps) {
  // Double the logos for seamless infinite scroll
  const doubled = [...logos, ...logos];

  return (
    <section className="py-16 bg-background overflow-hidden" aria-label={title}>
      <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-12 px-6">
        {title}
      </h2>
      <div className="flex gap-16 animate-scroll-left hover:[animation-play-state:paused]">
        {doubled.map((logo, i) => (
          <div
            key={`${logo.alt}-${i}`}
            className="flex-none flex items-center justify-center w-[300px] h-[200px]"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={600}
              height={400}
              className="object-contain max-h-full max-w-full grayscale hover:grayscale-0 transition-all duration-300 dark:invert dark:hover:invert-0"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
