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
    <section className="py-16 px-6 bg-white" aria-label={title}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground text-center mb-12">
          {title}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {logos.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={140}
              height={48}
              className="object-contain h-12 w-auto grayscale hover:grayscale-0 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
