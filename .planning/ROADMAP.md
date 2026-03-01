# Roadmap: YAPU Solutions Website Rebuild

## Overview

Seven phases from scaffold to chatbot-editable demo. The project builds a faithful visual recreation of yapu.solutions on the Promptheus stack (Next.js 16, Tailwind v4, next-intl) with Ember as the editing interface. Phases 1-2 establish the technical foundation and validate the two-instance architecture before any UI work begins. Phases 3-4 build all components and assemble all pages with real content. Phase 5 adds compliance and integrations. Phase 6 is the demo payload: Ember edits content, production reflects it instantly. Phase 7 unlocks full code and design editing for the complete Promptheus pitch.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Next.js 16 scaffold with YAPU design system, EN/FR/ES routing, and typed content JSON layer (completed 2026-02-26)
- [x] **Phase 2: Infrastructure** - Two-instance PM2 setup on VPS with nginx, Content API, and verified Tier 1 revalidation pipeline (completed 2026-02-26)
- [x] **Phase 3: UI Components** - All section components and full navigation built, responsive at all breakpoints (completed 2026-02-26)
- [x] **Phase 4: Page Assembly** - All 7 pages populated with real YAPU content and assets in EN/FR/ES (completed 2026-02-27)
- [x] **Phase 5: Compliance + Integration** - GDPR consent, analytics, newsletter, SEO metadata, and legal pages (completed 2026-02-27)
- [x] **Phase 6: Ember Integration (Tier 1)** - Ember edits content JSON, changes appear on production within one reload (completed 2026-02-27)
- [x] **Phase 7: Ember Tier 2 + Deploy** - Ember edits code and design via dev server with HMR, deploy flow to production (completed 2026-02-27)

## Phase Details

### Phase 1: Foundation
**Goal**: Developers can work against a running Next.js project with YAPU's design tokens, i18n routing, and typed content loading — ready to accept components and content
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, VIS-05
**Success Criteria** (what must be TRUE):
  1. `next dev` starts without errors and renders placeholder pages at `/en/`, `/fr/`, and `/es/`
  2. YAPU color palette (Dark Teal #1E5A64, Mint #45B5B4, Orange-Red #FF2A13) is applied as Tailwind v4 OKLCH CSS custom properties and visually verifiable on a test element
  3. `readContent('homepage', 'en')` returns typed content without TypeScript errors, and next-intl type checking rejects unknown translation keys at compile time
  4. Navigating to `/fr/` and `/es/` renders the correct locale without defaulting to EN
**Plans**: 2 plans
- [ ] 01-01-PLAN.md -- Scaffold Next.js 16 project with Tailwind v4, shadcn/ui, and full next-intl i18n routing (EN/FR/ES) with TypeScript type augmentation
- [ ] 01-02-PLAN.md -- YAPU design tokens (OKLCH), Nunito font, dark mode, typed content JSON layer, 7 placeholder pages in 3 locales, basic navigation

### Phase 2: Infrastructure
**Goal**: Two Next.js instances run on the Promptheus VPS — production serving visitors, dev serving Ember — with SSL, nginx routing, and a verified Content API that writes JSON and triggers revalidation
**Depends on**: Phase 1
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, EDIT-01, EDIT-03
**Success Criteria** (what must be TRUE):
  1. Production site is publicly accessible at the YAPU subdomain over HTTPS
  2. Dev server is accessible only via the preview subdomain and returns 403 for direct public requests
  3. A POST to `/api/content` with a valid auth token writes a JSON file and the change appears on the production site within one page reload — no rebuild required
  4. Both PM2 instances survive a VPS reboot and restart automatically
**Plans**: 3 plans
- [ ] 02-01-PLAN.md -- Application-side: distDir build separation, force-dynamic on all pages, Content API route handler with Zod validation and bearer auth
- [ ] 02-02-PLAN.md -- Server configs: PM2 ecosystem (two instances), nginx reverse proxy (prod + preview with bearer token gate), deploy script with --prod/--dev/--all, env template
- [ ] 02-03-PLAN.md -- VPS deployment checkpoint: DNS setup, certbot SSL, PM2 start, end-to-end verification

### Phase 3: UI Components
**Goal**: All reusable section components and the full navigation exist as React components, match YAPU's visual structure, and are responsive at mobile and desktop breakpoints
**Depends on**: Phase 1
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, HOME-01, HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, VIS-01, VIS-02, VIS-04
**Success Criteria** (what must be TRUE):
  1. Desktop mega-menu renders all 6 top-level sections with submenus, language switcher, and YAPU App CTA; mobile hamburger menu collapses and expands correctly
  2. Hero section, four service module cards, testimonial, partner carousel, client carousel, newsletter form, and footer all render with placeholder content at 375px and 1440px
  3. Footer matches YAPU's layout: Berlin and Ecuador addresses, legal links, and social links
  4. No horizontal scroll or layout overflow at any of the four target breakpoints (375/768/1024/1440px)
**Plans**: 4 plans
- [ ] 03-01-PLAN.md -- Install shadcn/ui primitives (NavigationMenu, Sheet, Card, Input, Button), CSS scroll animations, expand homepage JSON schema, expand i18n message strings
- [ ] 03-02-PLAN.md -- Full Navigation: desktop mega-menu with dropdown submenus, mobile Sheet hamburger, YAPU App CTA, sticky scroll shadow, hydration-safe theme toggle
- [ ] 03-03-PLAN.md -- Homepage sections: Hero, ServiceModules, Testimonial, PartnerCarousel (CSS infinite scroll), ClientCarousel, Newsletter form
- [ ] 03-04-PLAN.md -- Footer component, wire all sections into page.tsx, add Footer to locale layout, visual verification checkpoint at 375px and 1440px

### Phase 4: Page Assembly
**Goal**: All 7 pages render in EN, FR, and ES with real YAPU content and assets — the site looks like yapu.solutions running on a modern stack
**Depends on**: Phase 3
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, CONT-06, PAGE-01, PAGE-02, PAGE-03, PAGE-04, PAGE-05, PAGE-06, VIS-03
**Success Criteria** (what must be TRUE):
  1. All 7 pages render at `/en/`, `/fr/`, and `/es/` with locale-correct content — no EN fallback visible in FR or ES
  2. Real YAPU logos, partner logos (~12 organizations), and client logos (24+) are displayed on the homepage
  3. Each subpage (Investor Services, Data Insights, Digital Tools, Impact, News, About) renders its real content with YAPU's section structure
  4. Side-by-side comparison with yapu.solutions at 1440px shows the Hero, Module Cards, and logo carousels as visually equivalent
**Plans**: 4 plans
- [ ] 04-01-PLAN.md -- Download all logo assets (YAPU brand + 12 partner + 24 client), upgrade carousels to next/image, add YAPU logo to Nav/Footer, add all subpage i18n namespaces to messages
- [ ] 04-02-PLAN.md -- Investor Services + Data Insights + Digital Tools: full content JSON in EN/FR/ES + page components with all sections
- [ ] 04-03-PLAN.md -- Impact + News + About: full content JSON in EN/FR/ES + page components + NewsFilter client component
- [ ] 04-04-PLAN.md -- Visual verification checkpoint: all 7 pages at 1440px and 375px, locale verification, interactive checks

### Phase 04.2: Visual Pixel Match (INSERTED)

**Goal:** Structural layout and content fidelity to close remaining visual gaps vs yapu.solutions — ServiceModules layout rebuild, hero text accuracy, Newsletter dark teal treatment, and section title corrections
**Requirements**: VIS-03
**Depends on:** Phase 4.1
**Success Criteria** (what must be TRUE):
  1. Homepage ServiceModules renders 4 stacked full-width colored sections with bullet lists — not a 4-column card grid
  2. Hero headline, CTA text, and CTA link match yapu.solutions exactly
  3. Newsletter section has dark teal background with white text and mint submit button
  4. All section titles (testimonials, partners, clients, newsletter) match yapu.solutions
  5. Partner logos display in full color (no grayscale)
**Plans:** 2/2 plans complete

Plans:
- [ ] 04.2-01-PLAN.md -- ServiceModules rebuild (stacked full-width sections), hero text + CTA update, homepage JSON schema migration (3 locales), i18n section title corrections
- [ ] 04.2-02-PLAN.md -- Newsletter dark teal restyle, PartnerCarousel grayscale removal, visual verification checkpoint at 1440px and 375px

### Phase 04.1: Visual Fidelity (INSERTED)

**Goal:** Pixel-accurate visual replica of yapu.solutions — hero images, typography, spacing, color usage, and layout structure match the original at 1440px and 375px across all 7 pages
**Requirements**: VIS-03
**Depends on:** Phase 4
**Plans:** 2/2 plans complete

Plans:
- [x] 04.1-01-PLAN.md -- Global component visual fidelity: Navigation white bg + dark logo, Hero typography + bgClass prop + pill CTAs, ServiceModules card accents, Testimonial/Carousel backgrounds, Newsletter pill button
- [x] 04.1-02-PLAN.md -- Page-specific visual fixes: bg-muted/30 -> bg-gray-50 across all pages, Impact gold gradient hero, partner logo grayscale removal, Investor Services circle colors, About submit button, visual verification checkpoint

### Phase 5: Compliance + Integration
**Goal**: The site meets GDPR requirements, tracks visitors with explicit consent, accepts newsletter signups, and has complete SEO metadata on every page
**Depends on**: Phase 4
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06
**Success Criteria** (what must be TRUE):
  1. Cookie consent banner appears on first visit; no analytics scripts fire until the user explicitly accepts analytics cookies
  2. Cookie preference persists across navigation and browser restart — accepted consent is not re-requested
  3. Newsletter form accepts an email address and the submission reaches the configured email provider
  4. Every page has a correct `<title>`, meta description, and OpenGraph tags visible in browser dev tools
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md -- GDPR cookie consent banner with localStorage persistence, Google Analytics 4 with Consent Mode v2 (defaults denied), layout metadataBase + title template, CookieConsent i18n strings (3 locales)
- [ ] 05-02-PLAN.md -- Newsletter API route (Brevo integration with Zod validation), Newsletter.tsx wiring with loading/error states, per-page generateMetadata for all 7 pages, PageMeta i18n strings (3 locales), COMP-06 verification (Footer links)

### Phase 6: Ember Integration (Tier 1)
**Goal**: A non-technical person using Ember can change any text content on the YAPU site and see the change live on production within seconds — no code, no deploy
**Depends on**: Phase 2, Phase 4
**Requirements**: EDIT-02, EDIT-04, EDIT-05, EDIT-06
**Success Criteria** (what must be TRUE):
  1. Typing "change the hero headline to X" in Ember updates the EN homepage hero JSON; refreshing the production URL shows the change without a rebuild
  2. Ember shows a confirmation step before writing any change to disk
  3. A live preview link or iframe displays the current production state and updates after a confirmed content change
  4. Editing the homepage hero content does not affect Investor Services page content — Ember correctly scopes edits by page and section
**Plans**: 2 plans

Plans:
- [x] 06-01-PLAN.md -- Patch Ember context.js: dynamic locale detection (EN/FR/ES) + Tier 1 system prompt (confirm-before-write, production URL as preview, no preview_build)
- [x] 06-02-PLAN.md -- VPS deployment checkpoint: deploy Ember to VPS, configure .env/nginx/PM2/SSL, end-to-end content editing verification

### Phase 7: Ember Tier 2 + Deploy
**Goal**: Ember can edit component code, CSS, and colors on the dev server with instant HMR preview, and can trigger a production deploy when the changes are ready
**Depends on**: Phase 6
**Requirements**: EDIT-07, EDIT-08, EDIT-09, EDIT-10, EDIT-11
**Success Criteria** (what must be TRUE):
  1. Editing a `.tsx` component via Ember causes the dev server preview to update via HMR without a full page reload
  2. Changing the YAPU primary color via Ember updates `globals.css` CSS custom properties and the visual change is immediately visible in the dev preview iframe
  3. Typing "deploy to production" in Ember triggers `next build` + `pm2 restart yapu-prod` and the changes appear on the public URL
  4. Dev server preview is accessible via the nginx-proxied preview URL and its traffic is isolated from the production instance
**Plans**: 2/2 plans complete

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 4.1 → 4.2 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-02-26 |
| 2. Infrastructure | 3/3 | Complete   | 2026-02-26 |
| 3. UI Components | 4/4 | Complete   | 2026-02-26 |
| 4. Page Assembly | 4/4 | Complete   | 2026-02-27 |
| 4.1 Visual Fidelity | 2/2 | Complete   | 2026-02-27 |
| 4.2 Visual Pixel Match | 2/2 | Complete   | 2026-02-27 |
| 5. Compliance + Integration | 2/2 | Complete   | 2026-02-27 |
| 6. Ember Integration (Tier 1) | 2/2 | Complete   | 2026-02-27 |
| 7. Ember Tier 2 + Deploy | 2/2 | Complete   | 2026-02-27 |

---
*Roadmap created: 2026-02-26*
*Requirements coverage: 55/55 v1 requirements mapped*
