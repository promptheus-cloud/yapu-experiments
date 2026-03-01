"use client";

import {useState, useEffect} from 'react';
import {useTranslations, useLocale, hasLocale} from 'next-intl';
import {Link, usePathname, useRouter} from '@/i18n/navigation';
import {Menu, ChevronDown, ChevronUp} from 'lucide-react';
import Image from 'next/image';
import {routing} from '@/i18n/routing';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {cn} from '@/lib/utils';
import {ThemeToggle} from '@/components/ThemeToggle';

/* IDs of the 4 main nav sections that get boxed teal styling */
const BOXED_SECTIONS = new Set(['investor-services', 'data-insights', 'digital-tools', 'impact']);

export interface NavSubItem {
  labelKey: string;
  href: string;
}

export interface NavSection {
  id: string;
  labelKey: string;
  href: string;
  subItems?: NavSubItem[];
}

interface NavigationProps {
  navSections: NavSection[];
}

export function Navigation({navSections}: NavigationProps) {
  const t = useTranslations('Navigation');
  const tSub = useTranslations('NavigationSub');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener('scroll', handleScroll, {passive: true});
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function switchLocale(newLocale: string) {
    if (hasLocale(routing.locales, newLocale)) {
      router.replace(pathname, {locale: newLocale});
    }
    setLangOpen(false);
  }

  function toggleSection(id: string) {
    setExpandedSection(expandedSection === id ? null : id);
  }

  return (
    <nav className={cn(
      'sticky top-0 z-50 glass-nav backdrop-blur-xl transition-shadow',
      scrolled && 'shadow-lg'
    )}>
      <div className="w-full flex items-center justify-between px-4 py-4 lg:px-6 lg:py-3">

        {/* Logo — white/inverted */}
        <Link href="/" className="hover:opacity-90 transition-opacity flex-shrink-0">
          <Image
            src="/logos/yapu-logo.svg"
            alt="YAPU Solutions"
            width={160}
            height={53}
            priority
            className="h-10 lg:h-11 w-auto"
            style={{ filter: 'brightness(0) saturate(100%) invert(1)' }}
          />
        </Link>

        {/* Desktop NavigationMenu */}
        <div className="hidden lg:flex items-center flex-1 justify-end mr-4">
          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              {navSections.map((section) => {
                const isBoxed = BOXED_SECTIONS.has(section.id);

                if (section.subItems && section.subItems.length > 0) {
                  return (
                    <NavigationMenuItem key={section.id}>
                      <NavigationMenuTrigger
                        className={cn(
                          'bg-transparent text-white text-xs font-semibold uppercase tracking-wider',
                          isBoxed
                            ? 'rounded px-3 py-1.5 hover:bg-white/10 data-[state=open]:bg-white/10'
                            : 'px-3 py-1.5 hover:text-white/80'
                        )}
                        onPointerDown={(e) => e.preventDefault()}
                        onClick={() => router.push(section.href)}
                      >
                        {t(section.labelKey as Parameters<typeof t>[0])}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-1 p-3 w-[220px] glass-card rounded-md">
                          {section.subItems.map((subItem) => (
                            <li key={subItem.labelKey}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subItem.href}
                                  className="block px-3 py-2 rounded text-sm text-foreground/80 hover:bg-muted transition-colors"
                                >
                                  {tSub(subItem.labelKey as Parameters<typeof tSub>[0])}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }
                return (
                  <NavigationMenuItem key={section.id}>
                    <NavigationMenuLink asChild>
                      <Link
                        href={section.href}
                        className="text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5 hover:text-white/80 transition-colors"
                      >
                        {t(section.labelKey as Parameters<typeof t>[0])}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side: YAPU App CTA + Language switcher */}
        <div className="flex items-center gap-2">
          {/* YAPU App CTA — visible on all sizes */}
          <a
            href="https://my.yapu.solutions/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex bg-accent text-white px-3 py-1 lg:px-4 lg:py-1.5 rounded text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            {t('yupuApp')}
          </a>

          {/* Language switcher — desktop only */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/10 transition-colors"
              aria-label={t('switchLanguage')}
            >
              <span>{locale.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 glass-card text-card-foreground rounded min-w-[120px] z-10">
                {routing.locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => switchLocale(loc)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${loc === locale ? 'font-semibold text-brand dark:text-primary' : ''}`}
                  >
                    {loc.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle — desktop */}
          <ThemeToggle className="hidden lg:block" />

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex lg:hidden p-1.5 rounded text-white hover:bg-white/10 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>
                  <Image
                    src="/logos/yapu-logo.svg"
                    alt="YAPU Solutions"
                    width={100}
                    height={34}
                    className="h-7 w-auto"
                    style={{ filter: 'brightness(0) saturate(100%)' }}
                  />
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 mt-4">
                {navSections.map((section) => {
                  if (section.subItems && section.subItems.length > 0) {
                    const isExpanded = expandedSection === section.id;
                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
                        >
                          <span>{t(section.labelKey as Parameters<typeof t>[0])}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                        {isExpanded && (
                          <div className="ml-3 flex flex-col gap-0.5 mt-0.5">
                            {section.subItems.map((subItem) => (
                              <Link
                                key={subItem.labelKey}
                                href={subItem.href}
                                onClick={() => setMobileOpen(false)}
                                className="block px-3 py-1.5 rounded text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                {tSub(subItem.labelKey as Parameters<typeof tSub>[0])}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={section.id}
                      href={section.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded text-sm font-medium hover:bg-muted transition-colors"
                    >
                      {t(section.labelKey as Parameters<typeof t>[0])}
                    </Link>
                  );
                })}

                {/* YAPU App CTA */}
                <div className="mt-4 pt-4 border-t border-border">
                  <a
                    href="https://my.yapu.solutions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center bg-accent text-white px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    {t('yupuApp')}
                  </a>
                </div>

                {/* Theme toggle — mobile */}
                <div className="mt-3 pt-3 border-t border-border">
                  <ThemeToggle />
                </div>

                {/* Language switcher */}
                <div className="mt-3 flex gap-1">
                  {routing.locales.map((loc) => (
                    <button
                      key={loc}
                      onClick={() => {
                        switchLocale(loc);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        'flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors',
                        loc === locale
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      {loc.toUpperCase()}
                    </button>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
