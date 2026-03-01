---
phase: 04-page-assembly
plan: 01
subsystem: ui
tags: [next/image, i18n, logos, carousel, next-intl, assets]

# Dependency graph
requires:
  - phase: 03-ui-components
    provides: PartnerCarousel and ClientCarousel components with placeholder divs; Navigation and Footer components with text branding
provides:
  - 12 real partner logos from yapu.solutions CDN in public/logos/partners/
  - 15 real client logos from yapu.solutions CDN in public/logos/clients/
  - YAPU brand SVG logo in public/logos/yapu-logo.svg
  - PartnerCarousel upgraded to next/image rendering (grayscale+hover transition)
  - ClientCarousel upgraded to next/image rendering (grayscale+hover transition)
  - Navigation header with YAPU SVG logo (priority loading)
  - Footer with YAPU SVG logo
  - 6 subpage i18n namespaces in en.json, fr.json, es.json (InvestorServices, DataInsights, DigitalTools, Impact, News, About)
affects: [04-02, 04-03, 04-04, 04-05, 04-06, 04-07, subpage assembly plans]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "next/image for all logo rendering with grayscale hover transition"
    - "YAPU SVG logo (white fill) works on both dark nav background and dark footer"
    - "Subpage i18n namespaces in messages/*.json enable typed access via useTranslations()"

key-files:
  created:
    - public/logos/yapu-logo.svg
    - public/logos/partners/ (12 PNG files from CDN JPGs)
    - public/logos/clients/ (15 PNG files from CDN JPGs)
  modified:
    - components/PartnerCarousel.tsx
    - components/ClientCarousel.tsx
    - components/Navigation.tsx
    - components/Footer.tsx
    - messages/en.json
    - messages/fr.json
    - messages/es.json
    - content/data/en/homepage.json
    - content/data/fr/homepage.json
    - content/data/es/homepage.json

key-decisions:
  - "CDN logos are JPGs not PNGs — saved as .png extension (valid, browsers handle it)"
  - "Live site partner carousel uses different organizations than Phase 3 JSON — updated JSON to match actual CDN logos (UN, IDB Invest, IDB Lab, BNP Paribas, FMO, Fondation Grameen, SIDI, CAF, Enclude, European Microfinance, Rice Exchange, IFAD)"
  - "Live site client carousel has 15 logos not 24 — JSON updated to match 15 actually available logos"
  - "YAPU logo SVG has white fill (st0 class) — works correctly on accent nav background and dark brand footer"
  - "Mobile sheet header SheetTitle wraps next/image logo — valid HTML nesting"

patterns-established:
  - "Pattern 1: Logo files stored as .png regardless of source format for consistency"
  - "Pattern 2: Subpage i18n namespaces match page route names (InvestorServices, DataInsights, DigitalTools, Impact, News, About)"

requirements-completed: [CONT-01, CONT-03, CONT-04, CONT-05, CONT-06]

# Metrics
duration: 9min
completed: 2026-02-26
---

# Phase 4 Plan 01: Logo Assets & i18n Foundation Summary

**Real logos from yapu.solutions CDN wired into carousels via next/image, YAPU SVG logo in Nav+Footer, and 6 subpage i18n namespaces added to all 3 locales**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-26T20:21:23Z
- **Completed:** 2026-02-26T20:30:43Z
- **Tasks:** 2
- **Files modified:** 13 (+ 28 new logo files)

## Accomplishments
- Downloaded 28 real logo files from yapu.solutions WordPress CDN (1 SVG brand logo + 12 partner + 15 client)
- Upgraded PartnerCarousel and ClientCarousel from placeholder div boxes to next/image with grayscale + hover-color transition
- Added YAPU SVG logo to Navigation header (with priority loading) and Footer — replacing text placeholders
- Added 6 subpage i18n namespaces (InvestorServices, DataInsights, DigitalTools, Impact, News, About) to en.json, fr.json, es.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Download all logo assets from yapu.solutions** - `d0634a6` (feat)
2. **Task 2: Upgrade carousels, Nav/Footer logo, subpage i18n** - `21818a0` (feat)

## Files Created/Modified
- `public/logos/yapu-logo.svg` - YAPU brand logo SVG (white fill, works on dark backgrounds)
- `public/logos/partners/` - 12 partner logos (bnp-paribas, caf, enclude, european-microfinance, fmo, fondation-grameen, idb-invest, idb-lab, ifad, rice-exchange, sidi, un)
- `public/logos/clients/` - 15 client logos (banco-adopem, banco-de-loja, banque-agricole, bfa, caurie, codesarrollo, comuba, coomultagro, delamujer, fundecooperacion, genesis, guaranda, nitlapan, rfd, tulcan)
- `components/PartnerCarousel.tsx` - next/image with grayscale + hover-color transition
- `components/ClientCarousel.tsx` - next/image with grayscale + hover-color transition
- `components/Navigation.tsx` - YAPU SVG logo with priority loading (desktop + mobile sheet)
- `components/Footer.tsx` - YAPU SVG logo replacing text
- `messages/en.json` - Added 6 subpage namespaces
- `messages/fr.json` - Added 6 subpage namespaces (French)
- `messages/es.json` - Added 6 subpage namespaces (Spanish)
- `content/data/en/homepage.json` - Updated logo src paths to match actual CDN filenames
- `content/data/fr/homepage.json` - Same logo update
- `content/data/es/homepage.json` - Same logo update

## Decisions Made
- CDN logos are JPGs — saved as .png extension (valid, browsers ignore extension for MIME type detection)
- Live site partner carousel uses different organizations than Phase 3 JSON spec — updated JSON to match what CDN actually has (12 logos confirmed working)
- Live site client carousel has 15 logos, not 24 as planned — JSON reduced to 15 to match actual available assets
- YAPU SVG logo has white fill via CSS class `.st0{fill:#FFFFFF}` which works correctly on both the mint accent nav and the dark brand footer

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Partner logo filenames in JSON did not match CDN — updated JSON and downloaded actual logos**
- **Found during:** Task 1 (Download all logo assets)
- **Issue:** Phase 3 JSON specified 12 partner logos (GIZ, KfW, Swiss Re, responsAbility, etc.) but the CDN at yapu.solutions/wp-content/uploads/ has different organization logos (IDB Lab, FMO, Fondation Grameen, SIDI, CAF, Enclude, European Microfinance, Rice Exchange, IFAD)
- **Fix:** Downloaded all 12 logos actually available on the CDN; updated content/data/{en,fr,es}/homepage.json partnerLogos array to match actual CDN filenames
- **Files modified:** content/data/en/homepage.json, content/data/fr/homepage.json, content/data/es/homepage.json
- **Verification:** 12 valid logo files in public/logos/partners/ (all 3-10KB, not 404 HTML pages)
- **Committed in:** d0634a6 (Task 1 commit)

**2. [Rule 1 - Bug] Client logo count 24 vs 15 — JSON updated to match actually available logos**
- **Found during:** Task 1 (Download all logo assets)
- **Issue:** Phase 3 JSON specified 24 client logos but the live site carousel only has 15 unique client logos available on the CDN (genesis, banco-de-loja, rfd, codesarrollo, fundecooperacion, bfa, banco-adopem, delamujer, banque-agricole, coomultagro, tulcan, guaranda, caurie, comuba, nitlapan)
- **Fix:** Downloaded the 15 available logos; updated homepage.json clientLogos to 15 entries matching actual CDN files
- **Files modified:** content/data/en/homepage.json, content/data/fr/homepage.json, content/data/es/homepage.json
- **Verification:** 15 valid logo files in public/logos/clients/ (all 3-9KB)
- **Committed in:** d0634a6 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 x Rule 1 - data mismatch between Phase 3 JSON spec and actual CDN contents)
**Impact on plan:** Both fixes necessary to have real logos instead of broken images. Logo organizations are authentic from yapu.solutions live site. No scope creep.

## Issues Encountered
- WordPress CDN uses JPG format for all logos, not PNG as planned — saved as .png extension which browsers handle correctly

## Next Phase Readiness
- All logo assets are in place for use across all page assembly plans
- i18n namespaces for all 6 subpages are ready for use in Phase 4 plans 02-07
- PartnerCarousel and ClientCarousel ready to render real logos on homepage
- YAPU brand identity visible in Navigation and Footer

## Self-Check: PASSED

- FOUND: public/logos/yapu-logo.svg
- FOUND: public/logos/partners/ (12 files)
- FOUND: public/logos/clients/ (15 files)
- FOUND: components/PartnerCarousel.tsx
- FOUND: components/ClientCarousel.tsx
- FOUND: .planning/phases/04-page-assembly/04-01-SUMMARY.md
- FOUND: commit d0634a6
- FOUND: commit 21818a0

---
*Phase: 04-page-assembly*
*Completed: 2026-02-26*
