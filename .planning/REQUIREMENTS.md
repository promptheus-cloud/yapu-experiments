# Requirements: YAPU Solutions Website Rebuild

**Defined:** 2026-02-26
**Core Value:** YAPU sees their own site running on Promptheus technology with chatbot-editing as the key differentiator

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Project scaffolded with Next.js 16, Tailwind v4 (OKLCH), shadcn/ui, TypeScript
- [x] **FOUND-02**: YAPU color palette defined as CSS custom properties (Dark Teal #1E5A64, Mint #45B5B4, Orange-Red #FF2A13)
- [x] **FOUND-03**: next-intl routing configured for EN/FR/ES with locale prefix
- [x] **FOUND-04**: Content JSON directory structure (`content/[section]/[locale].json`) with typed `readContent()` helper
- [x] **FOUND-05**: next-intl TypeScript type augmentation set up for compile-time translation key checking

### Navigation

- [x] **NAV-01**: Desktop mega-menu with dropdown submenus matching YAPU's 6 top-level sections
- [x] **NAV-02**: Mobile hamburger menu with collapsible sections
- [x] **NAV-03**: Language switcher (EN/FR/ES) in header
- [x] **NAV-04**: "YAPU App" CTA button in header linking to YAPU's existing app
- [x] **NAV-05**: Sticky header with scroll behavior

### Homepage

- [x] **HOME-01**: Hero section with headline, subtext, and CTA button
- [x] **HOME-02**: Four service module cards (Investor Services, Data Insights, Digital Tools, Impact) with icons and descriptions
- [x] **HOME-03**: Testimonial section with quote and attribution
- [x] **HOME-04**: Partner logo carousel (~12 organizations: UN, IDB Invest, BNP Paribas, etc.)
- [x] **HOME-05**: Client logo carousel (24+ organizations)
- [x] **HOME-06**: Newsletter subscription section with email input and submit button

### Subpages

- [x] **PAGE-01**: Investor Services page with service details, features, and CTAs
- [x] **PAGE-02**: Data Insights page with product descriptions and feature lists
- [x] **PAGE-03**: Digital Tools page with tool descriptions and use cases
- [x] **PAGE-04**: Impact page with project cards, SDG alignment, and partner logos
- [x] **PAGE-05**: News page with article list, category filtering, and pagination
- [x] **PAGE-06**: About page with team roster, SDG cards, company history, and contact form

### Content

- [x] **CONT-01**: All homepage content extracted from live yapu.solutions in EN, FR, and ES
- [x] **CONT-02**: All subpage content extracted from live yapu.solutions in EN, FR, and ES
- [x] **CONT-03**: Real YAPU logo and brand assets integrated
- [x] **CONT-04**: Real partner logos extracted and displayed (UN, IDB Invest, BNP Paribas, etc.)
- [x] **CONT-05**: Real client logos extracted and displayed
- [x] **CONT-06**: Content JSON schema handles optional sections per locale (structural differences between EN/FR/ES)

### Visual Fidelity

- [x] **VIS-01**: Homepage visually equivalent to yapu.solutions at desktop (1440px)
- [x] **VIS-02**: Homepage visually equivalent to yapu.solutions at mobile (375px)
- [x] **VIS-03**: All subpages visually equivalent at desktop and mobile viewpoints
- [x] **VIS-04**: Footer matches YAPU's current footer (Berlin + Ecuador addresses, legal links, social links)
- [x] **VIS-05**: System fonts approximate Museo Sans Rounded feel

### Compliance & Integration

- [x] **COMP-01**: GDPR cookie consent banner with granular category consent (analytics, marketing)
- [x] **COMP-02**: Cookie preference persists across page navigation and browser refresh
- [x] **COMP-03**: Google Analytics integration, gated by cookie consent acceptance
- [x] **COMP-04**: Functional newsletter subscription form connected to email provider
- [x] **COMP-05**: SEO meta tags and OpenGraph data for all pages
- [x] **COMP-06**: Privacy Policy and Legal Notice pages (or links to YAPU's existing ones)

### Infrastructure

- [x] **INFRA-01**: Two-instance PM2 setup — production (port 3001) + dev (port 3000) on Promptheus VPS
- [x] **INFRA-02**: nginx reverse proxy routing public traffic to production, preview subdomain to dev
- [x] **INFRA-03**: Dev server access restricted to Ember only (not publicly accessible)
- [x] **INFRA-04**: SSL/TLS configured via certbot
- [x] **INFRA-05**: Deploy script: `next build` + `pm2 restart yapu-prod`

### Chatbot Editing — Tier 1

- [x] **EDIT-01**: Protected Content API Route Handler (POST /api/content) with auth token validation
- [x] **EDIT-02**: Ember can update any content JSON file via natural language instruction
- [x] **EDIT-03**: Content changes visible on production site within one page reload (SSR with force-dynamic)
- [x] **EDIT-04**: Live preview via iframe or tab link showing current production state
- [x] **EDIT-05**: Change confirmation in Ember before writing to files
- [x] **EDIT-06**: Scoped edits — Ember understands which page/section is being edited

### Chatbot Editing — Tier 2

- [x] **EDIT-07**: Ember can edit component code (.tsx), styles (.css), and layout files on the dev server
- [x] **EDIT-08**: Changes visible instantly via HMR on the dev server preview
- [x] **EDIT-09**: Deploy from dev to production triggered via Ember (build + restart)
- [x] **EDIT-10**: Color scheme changes editable via Ember (CSS custom properties in globals.css)
- [x] **EDIT-11**: Preview iframe routing for Tier 2 edits (dev server URL proxied via nginx)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Editing

- **ADV-01**: Batch multi-language editing ("update hero headline in all languages")
- **ADV-02**: Image replacement via Ember (file upload to public/ + JSON reference update)
- **ADV-03**: Component scaffolding via Ember ("add a new testimonial card")
- **ADV-04**: Structured diff view in Ember chat (JSON diff before applying)
- **ADV-05**: Undo/revert UI in Ember (git-backed rollback)

### Performance

- **PERF-01**: Replace `force-dynamic` with `revalidateTag` for production-grade caching
- **PERF-02**: CDN for static assets
- **PERF-03**: Image optimization via `next/image` with proper dimensions

## Out of Scope

| Feature | Reason |
|---------|--------|
| CMS admin panel | Ember IS the CMS — building a traditional panel undermines the Promptheus pitch |
| WYSIWYG visual editor | Breaks content-as-code model; Ember + live preview achieves same outcome |
| Dark mode | YAPU has a fixed brand identity; dark mode adds design complexity for no demo value |
| User accounts / authentication | "YAPU App" button links to their existing app; no auth integration needed |
| E-commerce / payments | Marketing website only, no transactional features |
| Real-time collaborative editing | Sequential editing via Ember sufficient for YAPU's team size |
| Paid fonts (Museo Sans Rounded) | Licensing cost; system fonts acceptable for demo stage |
| WordPress/Cornerstone integration | Full rebuild, no backward compatibility with old CMS |
| Client-side full-text search | Google handles search for marketing sites; pagination + filters sufficient for news |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Complete |
| FOUND-03 | Phase 1 | Complete |
| FOUND-04 | Phase 1 | Complete |
| FOUND-05 | Phase 1 | Complete |
| VIS-05 | Phase 1 | Complete |
| INFRA-01 | Phase 2 | Complete |
| INFRA-02 | Phase 2 | Complete |
| INFRA-03 | Phase 2 | Complete |
| INFRA-04 | Phase 2 | Complete |
| INFRA-05 | Phase 2 | Complete |
| EDIT-01 | Phase 2 | Complete |
| EDIT-03 | Phase 2 | Complete |
| NAV-01 | Phase 3 | Complete |
| NAV-02 | Phase 3 | Complete |
| NAV-03 | Phase 3 | Complete |
| NAV-04 | Phase 3 | Complete |
| NAV-05 | Phase 3 | Complete |
| HOME-01 | Phase 3 | Complete |
| HOME-02 | Phase 3 | Complete |
| HOME-03 | Phase 3 | Complete |
| HOME-04 | Phase 3 | Complete |
| HOME-05 | Phase 3 | Complete |
| HOME-06 | Phase 3 | Complete |
| VIS-01 | Phase 3 | Complete |
| VIS-02 | Phase 3 | Complete |
| VIS-04 | Phase 3 | Complete |
| CONT-01 | Phase 4 | Complete |
| CONT-02 | Phase 4 | Complete |
| CONT-03 | Phase 4 | Complete |
| CONT-04 | Phase 4 | Complete |
| CONT-05 | Phase 4 | Complete |
| CONT-06 | Phase 4 | Complete |
| PAGE-01 | Phase 4 | Complete |
| PAGE-02 | Phase 4 | Complete |
| PAGE-03 | Phase 4 | Complete |
| PAGE-04 | Phase 4 | Complete |
| PAGE-05 | Phase 4 | Complete |
| PAGE-06 | Phase 4 | Complete |
| VIS-03 | Phase 4 | Complete |
| COMP-01 | Phase 5 | Complete |
| COMP-02 | Phase 5 | Complete |
| COMP-03 | Phase 5 | Complete |
| COMP-04 | Phase 5 | Complete |
| COMP-05 | Phase 5 | Complete |
| COMP-06 | Phase 5 | Complete |
| EDIT-02 | Phase 6 | Complete |
| EDIT-04 | Phase 6 | Complete |
| EDIT-05 | Phase 6 | Complete |
| EDIT-06 | Phase 6 | Complete |
| EDIT-07 | Phase 7 | Complete |
| EDIT-08 | Phase 7 | Complete |
| EDIT-09 | Phase 7 | Complete |
| EDIT-10 | Phase 7 | Complete |
| EDIT-11 | Phase 7 | Complete |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-26*
*Last updated: 2026-02-26 — traceability updated after roadmap creation*
