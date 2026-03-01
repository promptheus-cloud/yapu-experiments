# Phase 3: UI Components - Research

**Researched:** 2026-02-26
**Domain:** React component architecture — navigation mega-menu, homepage sections, logo carousels, footer — in Next.js 16 + Tailwind v4 + shadcn/ui
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NAV-01 | Desktop mega-menu with dropdown submenus matching YAPU's 6 top-level sections | shadcn/ui NavigationMenu (Radix UI primitive) with NavigationMenuTrigger + NavigationMenuContent; 6 top-level items verified from live site |
| NAV-02 | Mobile hamburger menu with collapsible sections | shadcn/ui Sheet component (`side="left"`) with accordion-style collapsible sections using useState |
| NAV-03 | Language switcher (EN/FR/ES) in header | Extends existing Navigation.tsx pattern; next-intl `useRouter().replace(pathname, {locale})` with `hasLocale` guard already in use |
| NAV-04 | "YAPU App" CTA button in header linking to YAPU's existing app | Static `<a>` pointing to `https://app.yapu.solutions` with `bg-cta` styling; key `yupuApp` already in messages |
| NAV-05 | Sticky header with scroll behavior | CSS `sticky top-0 z-50` already on Navigation.tsx; may add shadow-on-scroll behavior via `useEffect` + `scrollY` |
| HOME-01 | Hero section with headline, subtext, and CTA button | New `Hero` server component; reads from `content/data/{locale}/homepage.json` |
| HOME-02 | Four service module cards (Investor Services, Data Insights, Digital Tools, Impact) with icons and descriptions | New `ServiceModules` component with 4 `Card` components from shadcn/ui; icons from lucide-react |
| HOME-03 | Testimonial section with quote and attribution | New `Testimonial` component; quote from Tina Livingston (COO, COK Sodality) verified from live site |
| HOME-04 | Partner logo carousel (~12 organizations: UN, IDB Invest, BNP Paribas, etc.) | CSS infinite-scroll animation via `@theme` keyframes in globals.css; duplicate logo list for seamless loop |
| HOME-05 | Client logo carousel (24+ organizations) | Same CSS infinite-scroll pattern as HOME-04 but separate component/speed |
| HOME-06 | Newsletter subscription section with email input and submit button | New `Newsletter` component; first name, last name, email fields (verified from live site); uses shadcn/ui Input + Button |
| VIS-01 | Homepage visually equivalent to yapu.solutions at desktop (1440px) | Components use YAPU color tokens (bg-brand, bg-accent, bg-cta); Tailwind responsive classes for desktop layout |
| VIS-02 | Homepage visually equivalent to yapu.solutions at mobile (375px) | Mobile-first Tailwind responsive design in all section components; Sheet for mobile nav |
| VIS-04 | Footer matches YAPU's layout: Berlin + Ecuador addresses, legal links, and social links | New `Footer` component; data from `content/data/shared/company.json` (already has both addresses and social links) |
</phase_requirements>

---

## Summary

Phase 3 builds all reusable React components for the homepage and navigation. The codebase already has a working scaffold (Navigation.tsx, ThemeProvider, 21 routes, design tokens) from Phases 1-2. Phase 3 replaces the minimal placeholder `Navigation.tsx` with a full mega-menu + mobile hamburger, and adds all homepage section components (Hero, ServiceModules, Testimonial, partner/client logo carousels, Newsletter, Footer).

The technology choices are already locked by the stack: shadcn/ui provides `NavigationMenu` for desktop mega-menu and `Sheet` for the mobile hamburger panel. Logo carousels on the live YAPU site are continuous auto-scrolling — the right implementation is a pure CSS infinite scroll animation defined with `--animate-scroll` in `@theme` in `globals.css`, with duplicated logo lists to ensure seamless looping. No carousel library is needed for logo carousels. For interactive carousels (testimonials if paginated), the shadcn/ui `Carousel` component (backed by embla-carousel-react) is available but not required in this phase.

The live YAPU site uses a Mint-colored sticky header (not Dark Teal — the nav background is the Mint accent `#45B5B4 = rgb(69,181,180)`), a hero with a Dark Teal background, and sections laid out with a clear max-width container at desktop. All components should use `"use client"` only where interactivity requires it (Navigation mega-menu hover state, mobile Sheet, Newsletter form submit). Hero, ServiceModules, Testimonial, and logo carousels can be server components.

**Primary recommendation:** Build all components as server components by default. Add `"use client"` only to Navigation.tsx (already client), Newsletter form (for submit handling), and any component that requires useState/useEffect. Content is read via `readContent()` in page.tsx and passed as props to section components — do NOT call `readContent()` inside components directly.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | App Router + SSR/SSG | Already installed (package.json) |
| react | 19.2.3 | Component model | Already installed |
| tailwindcss | ^4 | Utility CSS, responsive breakpoints, custom animations | Already installed; @theme inline in globals.css |
| shadcn/ui (CLI) | 3.8.5 | NavigationMenu, Sheet, Card, Input, Button, Carousel | Already configured (components.json "new-york" style) |
| lucide-react | ^0.575.0 | Nav icons, service module icons, social icons | Already installed |
| next-intl | ^4.8.3 | Translation strings in Navigation (client), page content (server) | Already installed and configured |
| next-themes | ^0.4.6 | Theme toggle (already in Navigation.tsx) | Already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| embla-carousel-react | (installed by shadcn Carousel) | Testimonial/slide carousels | Only if testimonial section needs prev/next navigation |
| embla-carousel-autoplay | latest | Carousel autoplay plugin | Only if shadcn Carousel is used with autoplay |
| tw-animate-css | ^1.4.0 | Animation utilities imported in globals.css | Already imported; provides base animation utilities |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS infinite scroll (logo carousels) | embla-carousel with AutoScroll plugin | CSS approach has zero JS overhead; embla is better when logos need click navigation or user interaction |
| shadcn NavigationMenu (desktop) | Custom dropdown with useState | Radix NavigationMenu has built-in keyboard navigation, ARIA, and hover delay management — worth the dependency |
| shadcn Sheet (mobile) | Custom modal/overlay | Sheet handles focus trap, scroll lock, and animation correctly out of the box |

**Installation (shadcn components needed this phase):**
```bash
npx shadcn@latest add navigation-menu --legacy-peer-deps
npx shadcn@latest add sheet --legacy-peer-deps
npx shadcn@latest add card --legacy-peer-deps
npx shadcn@latest add button --legacy-peer-deps
npx shadcn@latest add input --legacy-peer-deps
```

Note: `--legacy-peer-deps` is required with npm + React 19. Already established as project pattern in Phase 1 research.

---

## Architecture Patterns

### Recommended Project Structure

```
components/
  Navigation.tsx          -- REPLACE with full mega-menu + mobile hamburger (client)
  Footer.tsx              -- NEW: addresses, legal links, social links (server)
  Hero.tsx                -- NEW: homepage hero section (server)
  ServiceModules.tsx      -- NEW: 4 service cards grid (server)
  Testimonial.tsx         -- NEW: quote + attribution (server)
  PartnerCarousel.tsx     -- NEW: infinite CSS scroll, partner logos (server)
  ClientCarousel.tsx      -- NEW: infinite CSS scroll, client logos (server)
  Newsletter.tsx          -- NEW: email subscription form (client — needs form submit)
  ui/
    navigation-menu.tsx   -- scaffolded by shadcn CLI
    sheet.tsx             -- scaffolded by shadcn CLI
    card.tsx              -- scaffolded by shadcn CLI
    button.tsx            -- scaffolded by shadcn CLI
    input.tsx             -- scaffolded by shadcn CLI

app/[locale]/
  layout.tsx              -- UPDATE: add Footer, replace Navigation import
  page.tsx                -- UPDATE: compose all homepage section components
```

### Pattern 1: Desktop Mega-Menu with shadcn NavigationMenu

**What:** Radix-backed NavigationMenu that renders a full-width dropdown panel under each top-level item, containing sublinks. Desktop only — hidden on mobile via `hidden md:flex`.

**When to use:** All 6 top-level nav items. Items with submenus use `NavigationMenuTrigger` + `NavigationMenuContent`. Items without submenus (News, About link directly) use `NavigationMenuLink asChild` with `<Link>` from `@/i18n/navigation`.

**YAPU nav structure from live site:**
```
Investor Services → Path to Resilience, Impact Measurement, SDGs, Use Cases
Data Insights     → Credit Risk Assessment, Financial Risks, Resilience Finance, Performance Monitoring, Capacity Building
Digital Tools     → Front Office, Team Management, Loan Decision, System Integration, Learning Organization, Features
Impact            → Digital Resilience Finance, Scale for Resilience, Impact References
News              → direct link /news/
About             → direct link /about/
```

**Key detail:** The YAPU header background is MINT (`bg-accent`, `#45B5B4`) — NOT the Dark Teal. Text on mint background should be dark (`text-foreground` or `text-[--yapu-teal]`). The YAPU App CTA button uses the Orange-Red (`bg-cta text-white`).

**Example:**
```tsx
// Source: https://ui.shadcn.com/docs/components/navigation-menu
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {Link} from '@/i18n/navigation';

// For items WITH submenus:
<NavigationMenuItem>
  <NavigationMenuTrigger>Investor Services</NavigationMenuTrigger>
  <NavigationMenuContent>
    <ul className="grid grid-cols-2 gap-1 p-4 w-[400px]">
      <li><NavigationMenuLink asChild><Link href="/investor-services#path-to-resilience">Path to Resilience</Link></NavigationMenuLink></li>
      {/* ... */}
    </ul>
  </NavigationMenuContent>
</NavigationMenuItem>

// For items WITHOUT submenus (News, About):
<NavigationMenuItem>
  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
    <Link href="/news">News</Link>
  </NavigationMenuLink>
</NavigationMenuItem>
```

### Pattern 2: Mobile Sheet Hamburger Menu

**What:** shadcn Sheet with `side="left"` triggered by a hamburger Menu icon (lucide). Contains all nav links as a vertical list. On mobile, expandable sections via `useState` accordion. Replaces the desktop NavigationMenu on screens below `md`.

**When to use:** Visible on mobile (`flex md:hidden`). Desktop NavigationMenu visible on `hidden md:flex`.

**Key detail:** Sheet requires `"use client"` — Navigation.tsx is already a client component, so no change needed.

```tsx
// Source: https://ui.shadcn.com/docs/components/sheet
import {Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle} from "@/components/ui/sheet"
import {Menu} from 'lucide-react';

// In Navigation.tsx (already "use client"):
<div className="flex md:hidden">
  <Sheet>
    <SheetTrigger asChild>
      <button aria-label="Open menu"><Menu className="w-6 h-6" /></button>
    </SheetTrigger>
    <SheetContent side="left" className="w-[300px]">
      <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
      {/* Vertical nav links with collapsible sections */}
    </SheetContent>
  </Sheet>
</div>
```

### Pattern 3: CSS Infinite Scroll Logo Carousel

**What:** A logo strip that scrolls continuously left using a CSS `@keyframes` animation. Two identical copies of the logo list side-by-side; when the first copy exits left, the second copy (identical) has arrived — creating a seamless loop. No JavaScript required.

**When to use:** HOME-04 (partner logos, ~12 orgs) and HOME-05 (client logos, 24+ orgs). Pause on hover via `group`/`group-hover:pause` pattern.

**Implementation in globals.css (Tailwind v4 @theme):**
```css
@theme inline {
  /* Add to existing @theme block */
  --animate-scroll-left: scroll-left 30s linear infinite;
  --animate-scroll-left-fast: scroll-left 20s linear infinite;

  @keyframes scroll-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
}
```

**Component structure:**
```tsx
// PartnerCarousel.tsx (server component — no JS needed)
export function PartnerCarousel({logos}: {logos: Logo[]}) {
  return (
    <div className="overflow-hidden group">
      <div className="flex w-max animate-scroll-left group-hover:[animation-play-state:paused]">
        {/* Render logos twice for seamless loop */}
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="mx-6 flex-shrink-0">
            <img src={logo.src} alt={logo.alt} className="h-12 w-auto object-contain grayscale hover:grayscale-0 transition-all" />
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Critical:** The `translateX(-50%)` value works because the duplicate list makes the total width 200% of the visible content — translating -50% brings the first copy back to position 0 at loop restart.

### Pattern 4: Server Component Composition Pattern

**What:** Page component (`app/[locale]/page.tsx`) reads all content once via `readContent()` and distributes data to child section components as props. Section components are server components — no data fetching, just rendering.

**When to use:** All homepage section components (Hero, ServiceModules, Testimonial, carousels, Newsletter). Only Navigation and Newsletter need `"use client"`.

```tsx
// app/[locale]/page.tsx (server component)
const content = readContent<HomepageContent>('homepage', locale);
const company = readSharedContent<CompanyData>('company');

return (
  <main>
    <Hero data={content.hero} />
    <ServiceModules modules={content.serviceModules} />
    <Testimonial data={content.testimonial} />
    <PartnerCarousel logos={content.partnerLogos} />
    <ClientCarousel logos={content.clientLogos} />
    <Newsletter />  {/* reads its own UI strings via useTranslations */}
    <Footer company={company} />
  </main>
);
```

### Pattern 5: Footer Structure

**What:** Footer reads company data from `content/data/shared/company.json` (addresses, social links already defined) and legal link URLs from messages.

**YAPU footer structure from live site:**
- YAPU logo + tagline (left)
- Two address columns: Berlin HQ + Ecuador office (from `company.json` — note: current `company.json` has outdated Berlin address `Potsdamer Str. 144` but live site shows `Schönhauser Allee 44A, 10435 Berlin` — update needed in Phase 4 content pass)
- Contact email: info@yapu.solutions
- Legal links: Legal notice, Privacy policy (link to YAPU's existing pages for now)
- Social icons: Twitter/X, LinkedIn, Facebook, YouTube (lucide-react has `Twitter`, `Linkedin`, `Facebook`, `Youtube`)
- Copyright: `© 2025 YAPU SOLUTIONS GMBH`

**Note:** YouTube icon available in lucide-react. Twitter icon in lucide-react is the old Twitter bird (now X) — use the `Twitter` icon or `X` depending on version. With lucide-react 0.575.0, both `Twitter` and `X` icons should be available.

### Anti-Patterns to Avoid

- **`"use client"` on section components:** Hero, ServiceModules, Testimonial, Footer can all be server components — only Navigation (state for open/close) and Newsletter (form submit) need client.
- **Calling `readContent()` inside components:** Content reading belongs in `page.tsx` (server component). Pass data as props. This keeps components testable and content-agnostic.
- **Hard-coding nav submenu items in Navigation.tsx:** Submenu structure should be defined as a TypeScript constant array inside Navigation.tsx (since it's structural UI, not translatable content), not loaded from JSON. Nav link labels come from `useTranslations('Navigation')`.
- **Using `<img>` without width/height for logos:** Use explicit dimensions or `width`/`height` attributes to avoid layout shift. For Phase 3 with placeholder images, use `h-12 w-auto` pattern.
- **Animating the container instead of the inner div:** The overflow-hidden container must be static; the inner div holds the doubled logo list and receives the animation class.
- **NavigationMenu on mobile breaking layout:** Use `hidden md:block` on the NavigationMenu and `md:hidden` on the hamburger button. Never render both simultaneously.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Desktop dropdown mega-menu | Custom hover/focus state management | shadcn NavigationMenu (Radix) | Keyboard navigation, ARIA roles, hover delay, focus-within management — complex to get right |
| Mobile slide-in menu | Custom CSS overlay + transition | shadcn Sheet | Focus trap, scroll lock, accessibility, animation — all handled |
| Logo carousel (infinite) | embla-carousel with autoplay | CSS @keyframes infinite scroll | Zero JS, no hydration cost, smoother on low-powered devices, simpler code |
| Form components | Raw `<input>` elements | shadcn Input + Button | Consistent focus ring, disabled state, accessible labels from day one |
| Icon set | SVG sprites or custom icons | lucide-react | Already installed; 24px grid-aligned, tree-shakable |
| Class merging | String template literals | `cn()` from lib/utils.ts | Handles Tailwind conflict resolution |

**Key insight:** Logo carousels are the most common area where developers reach for a library unnecessarily. A CSS `translateX` loop with duplicated content outperforms JS-based solutions for pure display carousels with no user interaction needed.

---

## Common Pitfalls

### Pitfall 1: NavigationMenu Dropdown Positioning at Full Width

**What goes wrong:** NavigationMenuContent renders inside the navigation bar's bounding box by default. For a mega-menu that should span full width or align to a specific position, the default positioning may produce overlapping or misaligned dropdowns.

**Why it happens:** Radix NavigationMenu positions `NavigationMenuContent` relative to the `NavigationMenuItem`. If the nav bar is `position: sticky`, the dropdown inherits the stacking context.

**How to avoid:** Wrap the content in a `NavigationMenuViewport` if needed. Alternatively, use absolute positioning with a `w-[Npx]` constraint on the content panel. The YAPU site uses relatively narrow dropdown panels (single column or 2-column grid) — not a truly full-width mega-menu. This simplifies the positioning problem.

**Warning signs:** Dropdowns appearing under other page content or misaligned with the trigger button.

### Pitfall 2: CSS Scroll Animation Jumping at Loop Point

**What goes wrong:** The logo carousel has a visible "jump" when the animation resets, making it obvious the list is duplicated.

**Why it happens:** The `translateX(-50%)` endpoint assumes the total inner div width is exactly 2× the single-copy width. If logos have variable widths or margins cause misalignment, the loop point shifts.

**How to avoid:** Ensure all logos are rendered in a `flex` row with consistent `mx-N` spacing. Use `w-max` on the inner div so it doesn't wrap. Use `flex-shrink-0` on each logo item. Test by temporarily setting `animation-duration: 2s` to make the loop visible.

**Warning signs:** A brief flash or position jump visible at the loop restart; the animation pausing for a frame.

### Pitfall 3: Sheet Closing on Navigation

**What goes wrong:** User taps a navigation link in the Sheet (mobile menu), the route changes, but the Sheet doesn't close.

**Why it happens:** Next.js Link navigation doesn't trigger a Sheet close event. The Sheet's open state is managed by Radix internally — it doesn't know that navigation occurred.

**How to avoid:** Either use `SheetClose asChild` wrapper around each `<Link>` in the mobile menu, or manage the Sheet's `open` state manually with `useState` and a controlled `open` prop, setting it to `false` in an `onClick` handler on each link.

**Warning signs:** Mobile menu stays open after tapping a nav link.

### Pitfall 4: Navigation.tsx Hydration Warning with next-themes

**What goes wrong:** `Warning: Prop className did not match` in the browser console after Navigation.tsx re-renders.

**Why it happens:** `useTheme()` returns `undefined` on the server render (before ThemeProvider is mounted). The Sun/Moon icon conditional on `theme === 'dark'` may differ between server and client render.

**How to avoid:** Use `mounted` state pattern: `const [mounted, setMounted] = useState(false)` with `useEffect(() => setMounted(true), [])`. Only render the theme-dependent icon after mounting. Or use `suppressHydrationWarning` on the icon container. The existing Navigation.tsx already has this risk — Phase 3 should address it.

**Warning signs:** React hydration mismatch warnings in browser console; theme icon flickering on initial load.

### Pitfall 5: Logo Carousels Causing Layout Shift (CLS)

**What goes wrong:** The logo carousel section causes a visible layout shift as images load, affecting Core Web Vitals.

**Why it happens:** `<img>` tags without explicit dimensions cause the browser to reserve no space, then reflow when images load.

**How to avoid:** For Phase 3 with placeholder logos (gray boxes), use `<div className="w-24 h-12 bg-muted rounded" />` as placeholders. When real logos are added in Phase 4, use `next/image` with explicit `width` and `height`. For Phase 3, the placeholder approach avoids CLS entirely.

**Warning signs:** Visible section height change as placeholder images load.

### Pitfall 6: Mobile Breakpoint Overflow

**What goes wrong:** Horizontal scrollbar appears at 375px or 768px viewport width.

**Why it happens:** Fixed pixel widths on components, negative margins without matching padding, or content wider than the viewport.

**How to avoid:** Use `max-w-full overflow-hidden` on the outer layout container. Use `w-full` on sections. For the logo carousel, apply `overflow-hidden` on the wrapper. Avoid `min-w-[Npx]` on cards that might exceed 375px.

**Warning signs:** `overflow-x: scroll` visible in browser devtools; horizontal scrollbar appears in responsive preview.

---

## Code Examples

Verified patterns from official sources:

### Desktop NavigationMenu with next-intl Link

```tsx
// Source: https://ui.shadcn.com/docs/components/navigation-menu
"use client";
import {Link} from '@/i18n/navigation';
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const investorServicesLinks = [
  {label: 'Path to Resilience', href: '/investor-services#path-to-resilience'},
  {label: 'Impact Measurement', href: '/investor-services#impact-measurement'},
  {label: 'SDGs', href: '/investor-services#sdgs'},
  {label: 'Use Cases', href: '/investor-services#use-cases'},
];

// In Navigation component (already "use client"):
<NavigationMenu className="hidden md:flex">
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Investor Services</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid grid-cols-1 gap-1 p-3 w-[260px]">
          {investorServicesLinks.map(({label, href}) => (
            <li key={href}>
              <NavigationMenuLink asChild>
                <Link href={href} className="block px-3 py-2 rounded text-sm hover:bg-accent/10">
                  {label}
                </Link>
              </NavigationMenuLink>
            </li>
          ))}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    {/* News and About — direct links without dropdown */}
    <NavigationMenuItem>
      <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
        <Link href="/news">News</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Mobile Sheet Menu with Auto-Close on Link Click

```tsx
// Source: https://ui.shadcn.com/docs/components/sheet
import {useState} from 'react';
import {Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {Menu, ChevronDown, ChevronUp} from 'lucide-react';
import {Link} from '@/i18n/navigation';

const [mobileOpen, setMobileOpen] = useState(false);
const [expandedSection, setExpandedSection] = useState<string | null>(null);

<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
  <SheetTrigger asChild>
    <button className="flex md:hidden" aria-label="Open menu">
      <Menu className="w-6 h-6" />
    </button>
  </SheetTrigger>
  <SheetContent side="left" className="w-[300px] overflow-y-auto">
    <SheetHeader><SheetTitle>YAPU Solutions</SheetTitle></SheetHeader>
    <nav className="mt-4 flex flex-col gap-1">
      {/* Section with submenu */}
      <button
        className="flex items-center justify-between px-3 py-2 text-sm font-medium"
        onClick={() => setExpandedSection(prev => prev === 'investor' ? null : 'investor')}
      >
        Investor Services
        {expandedSection === 'investor' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expandedSection === 'investor' && (
        <div className="pl-4 flex flex-col gap-1">
          <Link href="/investor-services#path-to-resilience" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm">
            Path to Resilience
          </Link>
        </div>
      )}
      {/* Direct link */}
      <Link href="/news" onClick={() => setMobileOpen(false)} className="px-3 py-2 text-sm font-medium">
        News
      </Link>
    </nav>
  </SheetContent>
</Sheet>
```

### Continuous Logo Carousel (CSS-only)

```css
/* globals.css — add to existing @theme inline block */
@theme inline {
  /* ... existing tokens ... */
  --animate-scroll-logos: scroll-logos 35s linear infinite;
  --animate-scroll-logos-fast: scroll-logos 20s linear infinite;

  @keyframes scroll-logos {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
}
```

```tsx
// PartnerCarousel.tsx (server component)
interface Logo { src: string; alt: string; }

export function PartnerCarousel({logos, label}: {logos: Logo[]; label: string}) {
  return (
    <section className="py-12 overflow-hidden" aria-label={label}>
      <div className="flex w-max animate-[scroll-logos_35s_linear_infinite] hover:[animation-play-state:paused]">
        {[...logos, ...logos].map((logo, i) => (
          <div key={i} className="mx-8 flex-shrink-0 flex items-center justify-center">
            {/* Phase 3: placeholder box. Phase 4: real logo img */}
            <div className="h-10 w-24 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
              {logo.alt}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

### Footer Component

```tsx
// Footer.tsx (server component — no "use client" needed)
import {Linkedin, Twitter, Facebook, Youtube, MapPin, Mail} from 'lucide-react';

interface CompanyData {
  name: string;
  addresses: {
    berlin: { street: string; city: string; zip: string; country: string };
    ecuador: { street: string; city: string; country: string };
  };
  social: { linkedin: string; twitter: string };
  website: string;
}

export function Footer({company}: {company: CompanyData}) {
  return (
    <footer className="bg-brand text-white py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo + addresses */}
        <div>
          <p className="font-bold text-lg mb-4">YAPU Solutions</p>
          <div className="space-y-3 text-sm opacity-80">
            <address className="not-italic">
              <MapPin className="w-4 h-4 inline mr-1" />
              {company.addresses.berlin.street}, {company.addresses.berlin.zip} {company.addresses.berlin.city}
            </address>
            <address className="not-italic">
              <MapPin className="w-4 h-4 inline mr-1" />
              {company.addresses.ecuador.street}, {company.addresses.ecuador.city}
            </address>
            <p><Mail className="w-4 h-4 inline mr-1" />info@yapu.solutions</p>
          </div>
        </div>
        {/* Legal links */}
        <div className="text-sm opacity-80">
          <a href="https://yapu.solutions/legal-notice" className="block hover:opacity-100 mb-2">Legal notice</a>
          <a href="https://yapu.solutions/privacy-policy" className="block hover:opacity-100">Privacy policy</a>
        </div>
        {/* Social icons */}
        <div className="flex gap-4">
          <a href={company.social.linkedin} aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
          <a href={company.social.twitter} aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
          {/* Facebook and YouTube not yet in company.json — add in Phase 4 */}
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-8 pt-4 border-t border-white/20 text-sm opacity-60">
        © 2025 YAPU SOLUTIONS GMBH
      </div>
    </footer>
  );
}
```

### Hydration-Safe Theme Toggle in Navigation

```tsx
// Source: next-themes best practice for SSR
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

// Only render theme-dependent content after mount:
{mounted ? (
  theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />
) : (
  <Moon className="w-4 h-4" /> // consistent server-side fallback
)}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JavaScript-based logo scroll | CSS `@keyframes` translate animation | Tailwind v4 @theme custom animations (2025) | Zero JS runtime cost; works without hydration |
| `tailwind.config.js` for custom keyframes | `@theme` block in globals.css | Tailwind v4 (2025) | No separate config; inline in CSS |
| Custom hamburger menu implementation | shadcn Sheet component | shadcn/ui v1+ | Accessibility, focus trap, animation — all handled |
| Headless UI NavigationMenu | Radix UI (shadcn NavigationMenu) | shadcn/ui v2+ | Radix is the recommended primitive in the ecosystem |
| `import Link from 'next/link'` | `import {Link} from '@/i18n/navigation'` | next-intl v3+ | Locale-aware Link prevents broken links across locales |

**Deprecated/outdated:**
- `tailwindcss-animate`: Replaced by `tw-animate-css`. Already using correct version in this project.
- `getStaticPaths` pattern: Replaced by `generateStaticParams` in App Router. Already using correct pattern.
- Dynamic import for carousels to avoid SSR issues: The CSS infinite scroll approach has no SSR concerns at all — no dynamic import needed.

---

## Key Decisions for Planner

These design decisions should be embedded into task specs to prevent planner re-deriving them:

1. **Navigation background is MINT (`bg-accent`), not Dark Teal.** The live YAPU site uses `rgb(69,181,180)` = `#45B5B4` = `--yapu-mint` for the header. Text in nav should be dark (not white).

2. **Navigation.tsx is already a `"use client"` component** — no need to restructure. Add shadcn NavigationMenu + Sheet imports within the existing client component.

3. **Logo carousels use CSS animation only** — no library install. Keyframes go in the `@theme inline` block in `globals.css`. The `--animate-scroll-logos` custom property creates the `animate-scroll-logos` Tailwind utility.

4. **Phase 3 uses placeholder logo boxes** (gray `<div>` elements) — real logo images are a Phase 4 concern. This keeps Phase 3 independent of asset availability.

5. **Newsletter form is `"use client"`** — form submission handling. For Phase 3, just validate/show success state without actual API integration (that's Phase 5 COMP-04).

6. **Footer data comes from `content/data/shared/company.json`** — already has Berlin and Ecuador addresses and social links. The Berlin address in the JSON (`Potsdamer Str. 144`) differs from the live site (`Schönhauser Allee 44A`) — update the JSON in this phase with the correct address.

7. **`readContent()` is called in `page.tsx` and data passed as props** — components do not call `readContent()` themselves.

8. **Homepage JSON schema needs expanding** — the current `homepage.json` only has `{hero, sections:[]}`. Phase 3 must define the content schema for all section components (serviceModules array, testimonial object, partnerLogos array, clientLogos array) and populate placeholder data.

---

## Open Questions

1. **Nav background: White or Mint?**
   - What we know: The WebFetch result says header uses `rgb(69,181,180)` = Mint. But at desktop the live YAPU site header may actually use white for the top bar and Mint for a secondary bar. The WebFetch description was from the page content extraction, not pixel inspection.
   - What's unclear: Exact nav background color at 1440px vs 375px on the live site.
   - Recommendation: Match what was observed (`bg-accent` = Mint). Planner should note this as a visual verification checkpoint.

2. **Facebook and YouTube social links in company.json**
   - What we know: The live YAPU footer has Twitter, LinkedIn, Facebook, YouTube. Current `company.json` only has `linkedin` and `twitter`.
   - What's unclear: The exact Facebook and YouTube URLs for YAPU.
   - Recommendation: Add placeholder Facebook/YouTube fields to `company.json` in this phase with empty strings. Phase 4 content pass fills real URLs.

3. **Newsletter form: submit behavior in Phase 3**
   - What we know: Phase 5 (COMP-04) connects the form to an email provider. Phase 3 should show the form.
   - What's unclear: Should Phase 3 have a functional submit (client-side only, no API) or just the form HTML?
   - Recommendation: Phase 3 implements a client-side form with basic email validation and a "Subscribed!" success state shown on submit. No API call. This is testable without Phase 5 dependency.

---

## Sources

### Primary (HIGH confidence)
- `C:/Users/hmk/promptheus/yapu2/components/Navigation.tsx` — existing Navigation.tsx structure; already uses `hasLocale`, `useRouter`, `Link` from `@/i18n/navigation`
- `C:/Users/hmk/promptheus/yapu2/package.json` — confirmed installed packages (next 16.1.6, shadcn 3.8.5, lucide-react 0.575.0, next-intl 4.8.3, tailwindcss ^4, tw-animate-css ^1.4.0)
- `C:/Users/hmk/promptheus/yapu2/app/globals.css` — confirmed `@theme inline {}` structure; OKLCH tokens; `@import "tw-animate-css"`
- `C:/Users/hmk/promptheus/yapu2/components.json` — shadcn configured with `"style": "new-york"`, `"rsc": true`, `"iconLibrary": "lucide"`
- [https://ui.shadcn.com/docs/components/navigation-menu](https://ui.shadcn.com/docs/components/navigation-menu) — NavigationMenu install, import names, asChild + Link integration
- [https://ui.shadcn.com/docs/components/sheet](https://ui.shadcn.com/docs/components/sheet) — Sheet install, side prop, sub-components
- [https://tailwindcss.com/docs/animation](https://tailwindcss.com/docs/animation) — `@theme` custom keyframes syntax: `--animate-*` variable + `@keyframes` inside `@theme` block
- [https://www.embla-carousel.com/get-started/react/](https://www.embla-carousel.com/get-started/react/) — Embla carousel hook API (relevant if shadcn Carousel used for testimonials)
- WebFetch of `https://yapu.solutions` — confirmed nav structure (6 top-level items, submenu items per section), hero text, testimonial attribution, footer addresses and social links

### Secondary (MEDIUM confidence)
- WebFetch of `https://yapu.solutions/about/` — footer details: Berlin address `Schönhauser Allee 44A, 10435 Berlin`, Ecuador address `Av. Atahualpa E1-131 y Av. República, Quito`, social icons: Twitter/LinkedIn/Facebook/YouTube, copyright `© 2025 YAPU SOLUTIONS GMBH`
- WebFetch of `https://yapu.solutions/investor-services/` — confirmed Investor Services submenu: Path to Resilience, Impact Measurement, SDGs, Use Cases
- WebFetch of `https://yapu.solutions` (second fetch) — confirmed header background as Mint `rgb(69,181,180)`, YAPU App CTA in header

### Tertiary (LOW confidence)
- Newsletter fields (first name, last name, email) — reported by WebFetch summary; not visually verified in page source. Treating as confirmed given consistency across two fetches.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified in package.json; shadcn components verified in official docs
- Architecture: HIGH — patterns derived from existing working code in this repo + official library docs
- YAPU visual structure: MEDIUM — from WebFetch which summarizes HTML content, not full pixel inspection; a human visual review pass should be built into the plan
- Logo carousel CSS technique: HIGH — pattern verified against Tailwind v4 official animation docs

**Research date:** 2026-02-26
**Valid until:** 2026-05-26 (stable stack — shadcn and Tailwind v4 are stable; Next.js 16 minor updates unlikely to affect component patterns)
