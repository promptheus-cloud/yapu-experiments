import Image from 'next/image';
import {Facebook, Linkedin, Twitter, Youtube} from 'lucide-react';

interface CompanyData {
  name: string;
  email: string;
  addresses: {
    berlin: {street: string; city: string; zip: string; country: string};
    ecuador: {street: string; city: string; country: string};
  };
  social: {linkedin: string; twitter: string; facebook: string; youtube: string};
  website: string;
  app: string;
}

interface FooterProps {
  company: CompanyData;
  tagline: string;
  legalNoticeLabel: string;
  privacyPolicyLabel: string;
  copyrightName: string;
}

export function Footer({company, legalNoticeLabel, privacyPolicyLabel, copyrightName}: FooterProps) {
  const {addresses, social, email} = company;

  return (
    <footer className="bg-brand text-white">
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          {/* Left: Company names + addresses */}
          <div className="space-y-6">
            <div>
              <p className="font-bold text-base">YAPU Solutions GmbH</p>
              <address className="not-italic text-sm opacity-80 mt-1 leading-relaxed">
                {addresses.berlin.street}<br />
                {addresses.berlin.zip} {addresses.berlin.city}<br />
                Berlin, {addresses.berlin.country}
              </address>
            </div>

            <div>
              <p className="font-bold text-base">YAPU Services Ecuador S.A.</p>
              <address className="not-italic text-sm opacity-80 mt-1 leading-relaxed">
                {addresses.ecuador.street}<br />
                {addresses.ecuador.city}, {addresses.ecuador.country}
              </address>
            </div>

            {/* Contact + Email pill */}
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm">contact</span>
              <a
                href={`mailto:${email}`}
                className="inline-flex bg-accent text-white px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {email}
              </a>
            </div>

            {/* Social icons */}
            <div className="flex gap-4 items-center">
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Right: Logo with claim + GfS badge */}
          <div className="flex flex-col items-start md:items-end gap-6">
            <Image
              src="/logos/yapu-logo-with-claim.svg"
              alt="YAPU Solutions — Digital Tools for Sustainable Finance"
              width={220}
              height={80}
              className="h-16 w-auto"
              style={{ filter: 'brightness(0) saturate(100%) invert(1)' }}
            />
            <Image
              src="/images/gfs-alumni-2021.png"
              alt="German Accelerator — GfS Alumni 2021"
              width={98}
              height={30}
              className="h-8 w-auto opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col items-center gap-2 text-xs">
          <div className="flex gap-8">
            <a
              href="https://yapu.solutions/legal-notice"
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-widest font-bold opacity-80 hover:opacity-100 transition-opacity"
            >
              {legalNoticeLabel}
            </a>
            <a
              href="https://yapu.solutions/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase tracking-widest font-bold opacity-80 hover:opacity-100 transition-opacity"
            >
              {privacyPolicyLabel}
            </a>
          </div>
          <p className="opacity-70">&copy; {new Date().getFullYear()} {copyrightName}</p>
        </div>
      </div>
    </footer>
  );
}
