# Phase 4: Page Assembly - Research

**Researched:** 2026-02-26
**Domain:** Content extraction, Next.js page patterns, next/image, JSON schema design, multi-locale content
**Confidence:** HIGH

---

## Summary

Phase 4 converts 6 placeholder subpages into fully assembled pages with real YAPU content, and upgrades the homepage carousels from placeholder boxes to real logo images. All content must be available in EN, FR, and ES. The technical stack is already decided and proven (Phases 1-3) — the work in Phase 4 is content authoring, JSON schema design, page component assembly, and image asset integration.

The biggest risk in this phase is **content schema completeness**. Each subpage has a unique section structure extracted from yapu.solutions — the JSON must capture that structure faithfully so the rendered page matches the original. A secondary risk is **image asset sourcing**: all partner and client logos must be downloaded from yapu.solutions WordPress CDN and placed in `public/logos/`, then wired into the carousel components which currently render placeholder boxes.

The News page requires a client-side category filter (static JSON array + useState), which is the only component requiring the `"use client"` directive in this phase. All other pages are pure server components.

**Primary recommendation:** Do Phase 4 in this order: (1) assets first — download all logos, add YAPU logo to Navigation/Footer, (2) content JSON for all 6 subpages in all 3 locales, (3) page components page by page, (4) visual verification pass at 1440px.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CONT-01 | All homepage content extracted from live yapu.solutions in EN, FR, and ES | Homepage JSON already exists for all 3 locales with real content; carousels need real logo images via next/image |
| CONT-02 | All subpage content extracted from live yapu.solutions in EN, FR, and ES | 6 subpage JSON files exist but contain only stub hero+empty sections; must be expanded with real content from live site |
| CONT-03 | Real YAPU logo and brand assets integrated | YAPU SVG logo at yapu.solutions/wp-content/uploads/2022/04/yapu-logo.svg — download + place in public/, update Navigation + Footer |
| CONT-04 | Real partner logos extracted and displayed (UN, IDB Invest, BNP Paribas, etc.) | 12 partner logos referenced in homepage.json; all 3 locales share same logo list; download from WP CDN + enable next/image |
| CONT-05 | Real client logos extracted and displayed | 24 client logos referenced in homepage.json; same approach as CONT-04 |
| CONT-06 | Content JSON schema handles optional sections per locale (structural differences between EN/FR/ES) | FR and ES are structurally identical to EN across all pages; optional arrays (e.g., `sections?: []`) handle empty gracefully — no locale structural mismatches found |
| PAGE-01 | Investor Services page with service details, features, and CTAs | 6 service cards + Path to Resilience 3-stage model + Impact Measurement section + 9 SDG icons + 4 Use Cases + Green Finance Radar CTA |
| PAGE-02 | Data Insights page with product descriptions and feature lists | 6 insight categories intro + 5 content sections (Credit Risk, Financial Risks, Resilience Finance, Performance Monitoring, Capacity Building with 3 sub-pillars) |
| PAGE-03 | Digital Tools page with tool descriptions and use cases | 6 feature sections (Front Office, Team Mgmt, Loan Decision, API, Learning Org, Features grid) + 1 testimonial |
| PAGE-04 | Impact page with project cards, SDG alignment, and partner logos | Hero + 2 narrative sections + 3 partner logos (Alliance, CCAFS, GAWA) + 4 project cards (MEBA, ECOMICRO, Webinar Series, MEbA Biodiversity) |
| PAGE-05 | News page with article list, category filtering, and pagination | Static JSON array of ~18 articles across 5 pages; category filter (All/Knowledge/General/Software/Consulting) via useState; client component |
| PAGE-06 | About page with team roster, SDG cards, company history, and contact form | Yapuchiri origin story + 11 team members (name, email, LinkedIn) + mission statement + 8 SDG cards + contact form (6 fields) |
| VIS-03 | All subpages visually equivalent at desktop and mobile viewpoints | Section-by-section layout components using existing Tailwind v4 tokens (bg-brand, text-accent, bg-cta); responsive grid patterns from homepage already established |
</phase_requirements>

---

## Standard Stack

### Core (already installed, no new installs required)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/image | Built-in Next.js | Optimized image rendering for logos | Automatic WebP, lazy loading, prevents layout shift — replaces placeholder divs in carousels |
| readContent | lib/content.ts | Load per-locale JSON with EN fallback | Already established pattern; use consistently for all 6 subpages |
| next-intl getTranslations | Built-in | Server-side UI string access | Established pattern in all existing pages |
| Tailwind v4 | CSS only | All layout and styling | No config changes needed — all tokens already defined |
| lucide-react | Already installed | Icons for SDG section, team, feature grid | Already in use; add icons as needed (Users, Leaf, Target, etc.) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React useState | Built-in | News category filter client state | Only the News page; everything else is server components |
| next-intl useTranslations | Built-in | Client-side UI string access | Only in News page filter component since it needs "use client" |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Static JSON for news | WordPress REST API | API approach needs authentication, CORS setup, and breaks SSG — static JSON is correct |
| next/image | Plain `<img>` tag | next/image gives automatic optimization, prevents CLS; use it for all logos |
| Client-side news filter | Server-side route params | Route params force full-page reload; useState filter is instant and simpler for ~18 articles |

**Installation:** None required. All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure (additions for Phase 4)

```
public/
  logos/
    yapu-logo.svg           # YAPU brand logo (Navigation + Footer)
    partners/               # 12 partner logos (un.png, idb-invest.png, etc.)
    clients/                # 24 client logos (banco-solidario.png, etc.)

content/data/
  en/
    homepage.json           # Already complete — add nothing
    investor-services.json  # Expand from stub to full schema
    data-insights.json      # Expand from stub to full schema
    digital-tools.json      # Expand from stub to full schema
    impact.json             # Expand from stub to full schema
    news.json               # Expand: add articles array
    about.json              # Expand: add team, sdgs, mission
  fr/                       # Mirror of en/ with French content
  es/                       # Mirror of en/ with Spanish content

components/
  # New components for subpage sections:
  InvestorServicesPage/     # OR inline sections in page.tsx
  NewsFilter.tsx            # "use client" — category filter + article list
```

### Pattern 1: Server Page with Typed Content

All subpage pages follow this established pattern from Phase 3:

```typescript
// Source: established in app/[locale]/investor-services/page.tsx
export const dynamic = 'force-dynamic';

interface InvestorServicesContent {
  hero: { title: string; subtitle: string };
  approach: { text: string };
  services: Array<{ title: string; description: string; icon: string }>;
  pathToResilience: {
    stages: Array<{ title: string; description: string }>;
  };
  impactMeasurement: {
    environmental: { percentage: string; description: string };
    social: { percentage: string; description: string };
  };
  sdgs: number[];  // SDG numbers: [1, 2, 5, 7, 8, 10, 12, 13, 15]
  useCases: Array<{
    title: string;
    social: number;
    environmental: number;
    sdgs: number[];
  }>;
  greenFinanceRadar: { text: string; ctaText: string; ctaHref: string };
}

export default async function InvestorServicesPage({ params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const content = readContent<InvestorServicesContent>('investor-services', locale);
  const t = await getTranslations('InvestorServices');
  // render sections...
}
```

### Pattern 2: next/image for Logo Carousels

Replace the current placeholder divs in PartnerCarousel and ClientCarousel:

```typescript
// Replace current placeholder div with:
import Image from 'next/image';

// In PartnerCarousel and ClientCarousel:
<Image
  src={logo.src}          // e.g., "/logos/partners/un.png"
  alt={logo.alt}
  width={120}
  height={40}
  className="object-contain h-10 w-auto"
  unoptimized={false}     // next/image handles optimization
/>
```

Note: `next.config.ts` does not declare `remotePatterns` — logos must be local files in `public/` not remote URLs.

### Pattern 3: News Page with Client Filter

```typescript
// components/NewsFilter.tsx — "use client"
'use client';

interface Article {
  title: string;
  date: string;
  categories: string[];
  excerpt: string;
  slug: string;
}

interface NewsFilterProps {
  articles: Article[];
  allLabel: string;
  readMoreLabel: string;
}

export function NewsFilter({ articles, allLabel, readMoreLabel }: NewsFilterProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const categories = ['all', ...new Set(articles.flatMap(a => a.categories))];
  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter(a => a.categories.includes(activeCategory));
  // render filter buttons + article cards
}
```

Server page passes articles and translated labels as props — client component stays thin.

### Pattern 4: SDG Icons

SDGs are represented as numbered badges (1-17). No external SDG icon library is needed — render as styled `<div>` with the SDG number and a color mapped per SDG:

```typescript
const sdgColors: Record<number, string> = {
  1: '#E5243B', 2: '#DDA63A', 5: '#FF3A21', 7: '#FCC30B',
  8: '#A21942', 10: '#DD1367', 12: '#BF8B2E', 13: '#3F7E44', 15: '#56C02B'
};
```

Or use actual SDG icon images if downloaded from the UN SDG brand guidelines — either approach works, styled divs are faster to implement.

### Pattern 5: JSON Schema for About Page Team

```typescript
interface TeamMember {
  name: string;
  email: string;
  linkedin: string;
}

interface AboutContent {
  hero: { title: string; subtitle: string };
  origin: { title: string; body: string };
  team: TeamMember[];
  mission: string;
  sdgs: number[];
  contact: {
    intro: string;
  };
}
```

Team member photos are NOT available — the live site uses photos from WordPress media. For Phase 4, use placeholder avatar (initials-based `<div>`) or a generic silhouette from lucide-react (`<User />` icon).

### Anti-Patterns to Avoid

- **Adding remote image domains**: Don't put yapu.solutions as a `remotePattern` in next.config.ts — download assets locally instead. Remote images from WordPress CDN may change or be rate-limited.
- **Duplicating logo lists across locale files**: Logo `src` paths are language-agnostic — keep them in all locale files (they are already identical in EN/FR/ES), or extract to `shared/logos.json` and load separately. The current approach (duplicated in each locale) is fine and matches the existing pattern.
- **"use client" on subpage components**: Only NewsFilter needs client state. All other subpage sections are pure server-rendered.
- **Pagination as a route**: News pagination should be client-side (useState page index) for ~18 articles, not server-side routes. The article count is small and static.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Logo image optimization | Custom image component | next/image | Automatic WebP, sizing, lazy loading, prevents CLS |
| Category filter state | Custom event system | React useState | Trivial for 18 static articles |
| Team member photos | Photo scraping system | Placeholder avatars (initials + lucide User icon) | WordPress media needs auth; not required for Phase 4 visual fidelity |
| Infinite news pagination | Server routes with params | Client-side pageIndex state | ~18 articles fit in one JSON file; server routes add complexity with no benefit |

**Key insight:** All the hard infrastructure (i18n, content loading, styling, force-dynamic, carousel animations) is done. Phase 4 is content work wrapped in simple server components.

---

## Common Pitfalls

### Pitfall 1: Incomplete Locale Coverage

**What goes wrong:** EN content is built first, then FR/ES are forgotten or partially done. Visual check at `/en/` passes but `/fr/` and `/es/` show stale stub content.

**Why it happens:** Each subpage JSON must be created/expanded in 3 locales. Easy to miss.

**How to avoid:** Write all 3 locale files atomically in each plan task. Never commit EN without FR and ES.

**Warning signs:** Checking `/fr/investor-services` shows "Investor Services" instead of "Services aux investisseurs".

### Pitfall 2: Logo `src` Path Mismatches

**What goes wrong:** Homepage JSON references `/logos/partners/un.png` but the file is placed at `/logos/partners/UN.png` (case mismatch) or wrong subdirectory.

**Why it happens:** Windows filesystem is case-insensitive; Linux production server is case-sensitive.

**How to avoid:** Use all-lowercase filenames for all downloaded assets. Match JSON `src` values exactly to filesystem paths.

**Warning signs:** Images render locally on Windows but are broken on the VPS.

### Pitfall 3: next/image Requires Known Dimensions or `fill`

**What goes wrong:** Adding `<Image src="..." alt="..." />` without `width`/`height` throws a Next.js build error.

**Why it happens:** next/image requires explicit dimensions or `fill` layout prop to prevent layout shift.

**How to avoid:** Use `width={120} height={40}` for partner logos, `width={80} height={30}` for client logos, and `className="object-contain"` to let the image scale within bounds.

**Warning signs:** Build error: "Image is missing required 'width' property."

### Pitfall 4: Contact Form is UI-Only in Phase 4

**What goes wrong:** Treating the About page contact form as a working form submission to implement now.

**Why it happens:** The form is visible on yapu.solutions but the backend integration (COMP-04) is Phase 5.

**How to avoid:** Render the contact form fields (first name, last name, email, country, employment status, LinkedIn, checkbox) as visual HTML only — no form action, no POST handler. The form becomes functional in Phase 5.

**Warning signs:** Spending time on server actions or email APIs in Phase 4.

### Pitfall 5: FR/ES Content Fidelity vs. Machine Translation

**What goes wrong:** FR and ES content JSON is auto-generated text that doesn't match the live site's phrasing.

**Why it happens:** yapu.solutions has real translations; using machine translation produces different text.

**How to avoid:** Fetch the actual FR/ES pages from yapu.solutions (they have real locale URLs: `/fr/investor-services`, `/es/servicios-al-inversor`) and copy text directly. Don't translate from EN.

**Warning signs:** The FR page says "Services aux investisseurs" but the real site says "Services aux investisseurs" — these happen to match, but body text may differ.

---

## Content Inventory (What Must Be Built)

### Subpage JSON Schemas

#### Investor Services (`investor-services.json`)

Sections from live site:
1. `hero` — title: "Investor Services", subtitle: "Measure climate vulnerabilities..."
2. `approach` — text block about thriving resilience finance
3. `services` — array of 6 cards: Strategy Development, Operational Consulting, Portfolio Certification, Portfolio Generation, Impact Measurement, Investor Value Proposition
4. `pathToResilience` — 3 stages: Reaction, Disclosure, Promotion
5. `impactMeasurement` — environmental + social dimensions with "0%" placeholder metrics
6. `sdgs` — array of SDG numbers: [1, 2, 5, 7, 8, 10, 12, 13, 15]
7. `useCases` — 4 entries with social/environmental percentages and SDG refs
8. `greenFinanceRadar` — CTA text + link

#### Data Insights (`data-insights.json`)

Sections from live site:
1. `hero` — "Data Insights" / "We offer data insights based on international best practices!"
2. `categories` — 6 cards: Financial Projections, Algorithm-based Decisions, Climate Risks, Social Impact, Taxonomies, Staff Performance
3. `sections` — 5 content sections:
   - `creditRisk` — Credit Risk Assessment (credit ratings, sector risks, cashflow)
   - `financialRisks` — Social, Climate & Nature-Related Financial Risks (CIAT partnership)
   - `resilienceFinance` — Resilience Finance (taxonomy verification, green credit)
   - `performanceMonitoring` — Performance Monitoring (team tracking)
   - `capacityBuilding` — 3 pillars: Institutional Assessment, Consultancy, Training

#### Digital Tools (`digital-tools.json`)

Sections from live site:
1. `hero` — "Digital Tools"
2. `sections` — 6 sections:
   - `frontOffice` — field data, secure login, real-time access
   - `teamManagement` — activity assignment, supervision
   - `loanDecision` — automated rules, virtual credit committee
   - `apiIntegration` — YAPU API, system integration
   - `learningOrganization` — real-time monitoring
   - `features` — 6 features: Workflow Management, Team Connectivity, Offline Function, Improved Scoring, Geo-Localization, Security
3. `testimonial` — Abou Baker, Pan African Microfinance quote

#### Impact (`impact.json`)

Sections from live site:
1. `hero` — "Impact" / "Creating positive impact is at the DNA of YAPU Solutions"
2. `digitalResilienceFinance` — narrative text block
3. `scaleForResilience` — text + 3 partner logos (Alliance, CCAFS/CGIAR, GAWA Capital)
4. `impactReferences` — 4 project cards: MEBA, ECOMICRO, Webinar Series, MEbA Biodiversity Platform

#### News (`news.json`)

Structure: flat array of ~18 articles across 5 pages of the live site:
```json
{
  "articles": [
    {
      "title": "YAPU launches Resilience Finance explainer series",
      "date": "2023-02-09",
      "categories": ["General", "Knowledge"],
      "excerpt": "To de-mystify the topic of Resilience Finance...",
      "slug": "resilience-finance-explainer-series"
    }
  ]
}
```

All known articles (from live site research):
- Page 1: 4 articles (2022-2023)
- Page 2: 4 articles (2021-2022)
- Page 3: 4 articles (2021)
- Page 4: 4 articles (2021)
- Page 5: 2 articles (2021)
Total: ~18 articles

Categories observed: General, Knowledge, Software, Consulting

#### About (`about.json`)

1. `hero` — "About" / "We make resilience finance operational."
2. `origin` — Yapuchiri origin story text
3. `team` — 11 members: Esthela Gaspar, Christoph Jungfleisch, Hong Lem, Yessenia Naranjo, Delphin Ngamije, Katy Osculio, Jaime Osorio, Priscila Palate, Alexander Ulbrich, Sven Volland, Katherine Zambrano
4. `mission` — mission statement text
5. `sdgs` — [1, 2, 7, 8, 10, 12, 13, 15]
6. `contact` — intro text (form fields are UI-only in Phase 4, backend in Phase 5)

### Logo Assets Required

**YAPU Brand Logo** (CONT-03):
- Source: `https://www.yapu.solutions/wp-content/uploads/2022/04/yapu-logo.svg`
- Target: `public/logos/yapu-logo.svg`
- Used in: Navigation (replace text "YAPU Solutions"), Footer (replace text fallback)

**Partner Logos** (CONT-04) — 12 logos:
Current JSON references (all in `public/logos/partners/`):
`un.png`, `idb-invest.png`, `bnp-paribas.png`, `giz.png`, `kfw.png`, `swiss-re.png`, `responsability.png`, `grameen-ca.png`, `oikocredit.png`, `symbiotics.png`, `blueorchard.png`, `triodos.png`

**Client Logos** (CONT-05) — 24 logos:
Current JSON references (all in `public/logos/clients/`):
`banco-solidario.png`, `banco-fie.png`, `finca.png`, `visionfund.png`, `opportunity.png`, `brac.png`, `fundacion-paraguaya.png`, `fondesurco.png`, `crecer.png`, `caja-arequipa.png`, `pro-mujer.png`, `asa-international.png`, `compartamos.png`, `bancosol.png`, `contactar.png`, `fundenuse.png`, `sembrar-sartawi.png`, `idepro.png`, `banco-economico.png`, `diaconia.png`, `cidre.png`, `credinka.png`, `faces.png`, `agrocapital.png`

All sourced from YAPU's WordPress CDN (`wp-content/uploads/`). Download with `curl` or `wget` using the actual filenames from the live site.

---

## Code Examples

### Expanding Carousel Components for Real Images

```typescript
// Source: Next.js docs — next/image local images
// In PartnerCarousel.tsx — replace placeholder div:
import Image from 'next/image';

{[...logos, ...logos].map((logo, i) => (
  <div key={i} className="mx-8 flex-shrink-0 flex items-center justify-center">
    <Image
      src={logo.src}
      alt={logo.alt}
      width={120}
      height={40}
      className="object-contain h-10 w-auto grayscale hover:grayscale-0 transition-all"
    />
  </div>
))}
```

### News JSON Article Structure

```json
{
  "articles": [
    {
      "title": "YAPU launches Resilience Finance explainer series",
      "date": "2023-02-09",
      "categories": ["General", "Knowledge"],
      "excerpt": "To de-mystify the topic of Resilience Finance, Christoph Jungfleisch, Managing Director of YAPU Solutions, has created an 8-part explainer series.",
      "slug": "resilience-finance-explainer-series"
    }
  ]
}
```

### YAPU Logo in Navigation

```typescript
// Replace text-only YAPU Solutions with logo image:
import Image from 'next/image';

<Link href="/">
  <Image
    src="/logos/yapu-logo.svg"
    alt="YAPU Solutions"
    width={120}
    height={40}
    priority  // above-the-fold logo
    className="h-8 w-auto"
  />
</Link>
```

### i18n UI Strings Needed for New Namespaces

Add to `messages/en.json` (and FR/ES equivalents):
```json
{
  "InvestorServices": {
    "ourApproach": "Our Approach",
    "ourServices": "Our Services",
    "pathToResilience": "Path to Resilience",
    "impactMeasurement": "Impact Measurement",
    "sdgsTitle": "Sustainable Development Goals",
    "useCasesTitle": "Use Cases",
    "greenFinanceRadarTitle": "Green Finance Radar"
  },
  "News": {
    "filterAll": "All",
    "readMore": "Read more",
    "heroTitle": "News",
    "heroSubtitle": "Latest updates from YAPU Solutions"
  },
  "About": {
    "originTitle": "YAPU DERIVES FROM YAPUCHIRI",
    "teamTitle": "Our Team",
    "sdgsTitle": "Our SDGs",
    "contactTitle": "Contact Us"
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Placeholder div boxes for logos | next/image with `src` from JSON | Real logos render with automatic optimization |
| Empty `sections: []` in subpage JSON | Full typed schema per page | Pages render real YAPU content |
| `t('Placeholder.description')` in subpages | Real section components | Visual equivalence with yapu.solutions |
| Navigation/Footer text fallback | YAPU SVG logo | Brand-accurate header and footer |

---

## Open Questions

1. **Team member photos for About page**
   - What we know: Live site has photos; Phase 4 requires team roster
   - What's unclear: Whether photos can be scraped from yapu.solutions without auth issues
   - Recommendation: Use `<User />` lucide icon or initials-based avatar in Phase 4; real photos via CONT-03 asset delivery in a future update if YAPU provides them

2. **News article slugs and detail pages**
   - What we know: PAGE-05 says "article list, category filtering, and pagination"
   - What's unclear: Whether individual news article detail pages are required in Phase 4
   - Recommendation: Phase 4 scope is list + filter + pagination only. Individual article pages (clicking "Read more") can link to yapu.solutions article URLs directly as external links. Internal article detail pages are Phase 5+ scope.

3. **FR/ES news articles**
   - What we know: yapu.solutions serves news in EN only (no FR/ES news URLs observed)
   - What's unclear: Whether YAPU has FR/ES article translations
   - Recommendation: Use same English articles JSON for all 3 locales (via EN fallback in readContent). This matches the existing fallback behavior.

4. **Exact logo filenames from WordPress CDN**
   - What we know: The JSON references normalized filenames (e.g., `un.png`); actual WP filenames may differ
   - What's unclear: Exact CDN URLs for all 36 logos
   - Recommendation: During asset download task, check the live site HTML/network tab for exact URLs. The homepage reveals at least 12 partner logo URLs. Client logo URLs require network inspection of the carousel on yapu.solutions.

---

## Sources

### Primary (HIGH confidence)
- Direct inspection of `app/[locale]/*/page.tsx` — all 6 subpage stubs confirmed as placeholder-only
- Direct inspection of `content/data/en/*.json` — all 6 files confirmed with stub `"sections": []`
- Direct inspection of `components/PartnerCarousel.tsx` + `ClientCarousel.tsx` — placeholder divs confirmed
- WebFetch of yapu.solutions/investor-services — section structure confirmed
- WebFetch of yapu.solutions/data-insights — section structure confirmed
- WebFetch of yapu.solutions/digital-tools — section structure confirmed
- WebFetch of yapu.solutions/impact — section structure confirmed
- WebFetch of yapu.solutions/news (pages 1-5) — 18 articles catalogued
- WebFetch of yapu.solutions/about — 11 team members, form fields confirmed
- WebFetch of yapu.solutions/fr/about — structural parity with EN confirmed
- WebFetch of yapu.solutions/es/investor-services — structural parity with EN confirmed

### Secondary (MEDIUM confidence)
- next/image API — no Context7 lookup performed (built-in Next.js, well-known API); width/height requirement verified against standard Next.js behavior
- Logo filenames: exact WordPress CDN URLs for all 36 logos not verified — client logos require network inspection of live site

### Tertiary (LOW confidence)
- SDG color codes — not verified against official UN SDG brand guidelines; approximate values from common usage

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already installed and in use
- Architecture: HIGH — patterns established in Phase 3 and directly observed in codebase
- Content schemas: HIGH — directly extracted from live yapu.solutions pages
- Asset sourcing: MEDIUM — YAPU logo URL confirmed; 36 logo CDN URLs require network inspection during execution
- Pitfalls: HIGH — based on direct codebase inspection (Windows case sensitivity, image dimension requirement, form backend deferral)

**Research date:** 2026-02-26
**Valid until:** 2026-03-28 (yapu.solutions content is stable; Next.js image API is stable)
