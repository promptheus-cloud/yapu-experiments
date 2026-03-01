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
  return (
    <section className="py-16 px-6 bg-background" aria-label={title}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-12">
          {title}
        </h2>
        <div className="flex overflow-x-auto gap-8 pb-4 snap-x snap-mandatory scrollbar-thin dark:glass-card dark:rounded-xl dark:p-8">
          {logos.map((logo) => (
            <div
              key={logo.alt}
              className="flex-none w-[calc(20%-1.6rem)] min-w-[140px] flex items-center justify-center snap-start"
            >
              <Image
                src={logo.src}
                alt={logo.alt}
                width={200}
                height={80}
                className="object-contain h-16 w-auto grayscale hover:grayscale-0 transition-all duration-300 dark:invert dark:hover:invert-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
