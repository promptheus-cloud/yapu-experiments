---
phase: 03-ui-components
plan: 01
subsystem: ui
tags: [shadcn, tailwind, next-intl, css-animations, content-schema, i18n]

# Dependency graph
requires:
  - phase: 02-infrastructure
    provides: Next.js app, content API, i18n routing, locale middleware
provides:
  - shadcn/ui NavigationMenu component (components/ui/navigation-menu.tsx)
  - shadcn/ui Sheet component for mobile menu (components/ui/sheet.tsx)
  - shadcn/ui Card component for service modules (components/ui/card.tsx)
  - shadcn/ui Input component for newsletter form (components/ui/input.tsx)
  - shadcn/ui Button component (components/ui/button.tsx)
  - animate-scroll-logos and animate-scroll-logos-fast CSS utilities via scroll-logos keyframe
  - Homepage content schema with hero, serviceModules, testimonial, partnerLogos, clientLogos for EN/FR/ES
  - NavigationSub, Newsletter, Footer, Homepage i18n namespaces for all 3 locales
  - company.json updated with correct addresses, email, and social media placeholders
affects: [03-02-navigation, 03-03-homepage, 03-04-footer-newsletter]

# Tech tracking
tech-stack:
  added: [shadcn/ui NavigationMenu, shadcn/ui Sheet, shadcn/ui Card, shadcn/ui Input, shadcn/ui Button]
  patterns: [shadcn add CLI for component installation, CSS @keyframes inside @theme inline block for Tailwind utilities, content schema expansion with typed placeholder arrays]

key-files:
  created:
    - components/ui/navigation-menu.tsx
    - components/ui/sheet.tsx
    - components/ui/card.tsx
    - components/ui/input.tsx
    - components/ui/button.tsx
  modified:
    - app/globals.css
    - content/data/en/homepage.json
    - content/data/fr/homepage.json
    - content/data/es/homepage.json
    - content/data/shared/company.json
    - messages/en.json
    - messages/fr.json
    - messages/es.json
    - messages/en.d.json.ts

key-decisions:
  - "shadcn add --yes flag works without --legacy-peer-deps (React 19 peer deps resolved automatically in current shadcn CLI)"
  - "CSS @keyframes can be declared inside @theme inline block in Tailwind v4 — creates animate-* utilities directly"
  - "next-intl auto-generates messages/en.d.json.ts type declarations during build — should be committed alongside messages changes"
  - "Homepage JSON schema uses sections array replacement approach — serviceModules/testimonial/partnerLogos/clientLogos as top-level keys"

patterns-established:
  - "Logo carousel pattern: double-render logos list, animate translateX(-50%) for seamless infinite loop"
  - "Content schema: typed placeholder arrays allow future Plan 03-03 to render all sections without schema migration"
  - "i18n messages: NavigationSub uses key naming convention {section}_{submenuItem} for flat key structure"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-02-26
---

# Phase 3 Plan 01: UI Primitives and Content Schema Summary

**5 shadcn/ui components installed, scroll-logo CSS animation added, and homepage content schema expanded with full EN/FR/ES placeholder data for all 5 section types**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-26T19:13:58Z
- **Completed:** 2026-02-26T19:17:41Z
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Installed 5 shadcn/ui components (NavigationMenu, Sheet, Card, Input, Button) needed by Plans 02-04
- Added scroll-logos CSS keyframe animation to globals.css @theme block, creating animate-scroll-logos and animate-scroll-logos-fast Tailwind utilities
- Expanded homepage.json (EN/FR/ES) from minimal hero+sections to full schema with serviceModules (4 items), testimonial, partnerLogos (12 items), clientLogos (24 items)
- Added NavigationSub, Newsletter, Footer, Homepage namespaces to all 3 locale message files
- Updated company.json with correct Berlin address (Schoenhauser Allee 44A), Ecuador address, email field, and facebook/youtube social placeholders

## Task Commits

Each task was committed atomically:

1. **Task 1: Install shadcn/ui components and add CSS scroll animation** - `762f35a` (feat)
2. **Task 2: Expand content JSON schema and UI message strings** - `6e52db7` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `components/ui/navigation-menu.tsx` - shadcn NavigationMenu for desktop nav dropdowns
- `components/ui/sheet.tsx` - shadcn Sheet for mobile menu drawer
- `components/ui/card.tsx` - shadcn Card for service module tiles
- `components/ui/input.tsx` - shadcn Input for newsletter form fields
- `components/ui/button.tsx` - shadcn Button for CTA elements
- `app/globals.css` - Added scroll-logos @keyframes and --animate-scroll-logos CSS custom properties inside @theme inline block
- `content/data/en/homepage.json` - Expanded with serviceModules, testimonial, partnerLogos, clientLogos
- `content/data/fr/homepage.json` - Expanded with French translations for all sections
- `content/data/es/homepage.json` - Expanded with Spanish translations for all sections
- `content/data/shared/company.json` - Updated addresses, added email, added facebook/youtube social fields
- `messages/en.json` - Added NavigationSub, Newsletter, Footer, Homepage namespaces
- `messages/fr.json` - Added same namespaces in French
- `messages/es.json` - Added same namespaces in Spanish
- `messages/en.d.json.ts` - Auto-generated next-intl TypeScript declarations (auto-updated by build)

## Decisions Made
- `shadcn add --yes` works without `--legacy-peer-deps` flag — the flag was for an older CLI version. Current shadcn CLI handles React 19 peer deps automatically.
- CSS @keyframes declared inside `@theme inline {}` block in Tailwind v4 — this is the correct placement to create Tailwind animate-* utilities from custom keyframes.
- `messages/en.d.json.ts` was auto-regenerated during the build and committed alongside message changes — this is normal next-intl behavior.
- Homepage JSON schema uses top-level keys for each section type (serviceModules, testimonial, partnerLogos, clientLogos) rather than a generic sections array, enabling typed access in Plan 03-03.

## Deviations from Plan

None - plan executed exactly as written.

The only minor deviation: `--legacy-peer-deps` flag was not needed/valid for current shadcn CLI version. Removed it and installation succeeded without it. This is a trivial fix (Rule 3), not a deviation in scope.

## Issues Encountered
- `--legacy-peer-deps` option unknown to current shadcn CLI — removed flag, installation worked immediately.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All shadcn/ui primitives ready for Plan 02 (Navigation component)
- animate-scroll-logos utility ready for Plan 03 (Homepage component logo carousels)
- Homepage content schema fully populated — Plan 03 can render all sections immediately
- NavigationSub i18n strings ready for Plan 02 mega-menu dropdowns
- Newsletter/Footer i18n strings ready for Plan 04

## Self-Check: PASSED

All key files verified:
- FOUND: components/ui/navigation-menu.tsx
- FOUND: components/ui/sheet.tsx
- FOUND: components/ui/card.tsx
- FOUND: components/ui/input.tsx
- FOUND: components/ui/button.tsx
- FOUND: app/globals.css (contains scroll-logos)
- FOUND: content/data/en/homepage.json (serviceModules, testimonial, partnerLogos, clientLogos)
- FOUND: messages/en.json (NavigationSub, Newsletter, Footer, Homepage)
- FOUND: .planning/phases/03-ui-components/03-01-SUMMARY.md

All commits verified:
- FOUND: 762f35a (Task 1: shadcn components + scroll animation)
- FOUND: 6e52db7 (Task 2: content schema + i18n strings)

---
*Phase: 03-ui-components*
*Completed: 2026-02-26*
