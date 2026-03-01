import Image from 'next/image';
import { Quote } from 'lucide-react';

interface TestimonialProps {
  title: string;
  quote: string;
  author: string;
  role: string;
  organization: string;
  organizationLogo?: string;
}

export function Testimonial({ title, quote, author, role, organization, organizationLogo }: TestimonialProps) {
  return (
    <section className="testimonial-section py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white/60 mb-16">
          {title}
        </h2>
        <Quote className="w-10 h-10 mx-auto mb-8 text-white/30" />
        <blockquote className="text-xl md:text-2xl italic leading-relaxed text-white/90">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="mt-8 flex items-center justify-center gap-3">
          {organizationLogo && (
            <Image
              src={organizationLogo}
              alt={organization}
              width={40}
              height={40}
              className="rounded-full object-contain w-10 h-10"
            />
          )}
          <div className={organizationLogo ? 'text-left' : ''}>
            <p className="text-base font-semibold text-white">{author}</p>
            <p className="text-sm text-white/60 mt-1">
              {role} &mdash; {organization}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
