# Phase 1: Foundation - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Next.js 16 scaffold with YAPU's design tokens (Dark Teal, Mint, Orange-Red), EN/FR/ES i18n routing via next-intl, and a typed content JSON layer. This phase delivers the base project that all other phases build on — no real content, no final components, just the working foundation.

</domain>

<decisions>
## Implementation Decisions

### Design tokens & theming
- Faithful 1:1 color mapping from yapu.solutions: Dark Teal (#1E5A64) = brand/nav/headers, Mint (#45B5B4) = hover states/accents, Orange-Red (#FF2A13) = CTA buttons/emphasis
- Colors implemented as Tailwind v4 OKLCH CSS custom properties in globals.css
- Dark mode included as a bonus demo feature (yapu.solutions is light-only)
- Free Google Font alternative to Museo (rounded, friendly sans-serif) — no licensing concerns

### Locale strategy
- Three locales: EN (default/fallback), FR, ES
- Root URL auto-detects browser language via Accept-Language header, redirects to /en/, /fr/, or /es/
- Cookie-based locale persistence — user's language choice remembered across visits
- Language switcher shows native names: English, Francais, Espanol
- Full hreflang SEO setup — each locale has canonical URLs with cross-references
- Locale-aware date and number formatting (e.g., 26/02/2026 for FR, 02/26/2026 for EN)

### Content JSON structure
- One JSON file per page (e.g., content/data/en/homepage.json, content/data/en/about.json)
- Nested by section within each file: { "hero": { "title": "..." }, "services": { ... } }
- Shared folder (content/data/shared/) for reusable data: company addresses, social links, partner logos
- EN fallback when content key missing in FR or ES — show English rather than blank

### Placeholder pages
- All 7 pages get placeholder routes in all 3 locales (21 routes total)
- Design token preview style: show YAPU color palette, typography samples, styled elements
- Basic navigation bar linking all 7 pages + language switcher (not the full Phase 3 mega-menu)
- Interactive light/dark theme toggle included from day one

### Claude's Discretion
- Dark mode color palette adjustments (maintain contrast ratios and brand recognition)
- Specific free font choice (best visual match for Museo's rounded style)
- Language switcher URL behavior (standard next-intl approach)
- Exact spacing, border radius, and shadow tokens
- TypeScript type generation approach for content JSON

</decisions>

<specifics>
## Specific Ideas

- Color roles sourced directly from yapu.solutions: Teal dominates headers/backgrounds, Mint for interactive hover states, Orange-Red exclusively for CTAs
- Navigation on yapu.solutions has a two-tone header: Mint top bar + Dark Teal main nav
- Placeholder pages should double as a design system showcase — proves the stack works visually before real content arrives

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-26*
