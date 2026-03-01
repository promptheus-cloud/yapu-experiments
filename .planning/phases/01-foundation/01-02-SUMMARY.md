---
phase: 01-foundation
plan: 02
subsystem: ui
tags: [nextjs, tailwind, oklch, next-themes, next-intl, typescript, json-content]

# Dependency graph
requires:
  - phase: 01-01
    provides: Next.js 16 scaffold with Tailwind v4, shadcn/ui, next-intl i18n routing (EN/FR/ES), and baseline TypeScript config

provides:
  - YAPU OKLCH color tokens (Dark Teal, Mint, Orange-Red) as CSS custom properties and Tailwind utilities (bg-brand, bg-accent, bg-cta)
  - Nunito font loaded via next/font/google and mapped to --font-sans
  - Light/dark theme switching via next-themes ThemeProvider
  - readContent<T>(page, locale) with EN fallback and readSharedContent<T>(file) helpers
  - 21 placeholder pages (7 pages x 3 locales: EN/FR/ES) with typed JSON content loading
  - Basic navigation bar with page links, language switcher, and theme toggle

affects:
  - 01-03 (chatbot-foundation uses Navigation, ThemeProvider, content layer)
  - 02-infra (deploy verifies all 21 routes render)
  - 03-ui (replaces placeholder pages with full component implementations)
  - 04-content (replaces placeholder JSON content with real YAPU copy)

# Tech tracking
tech-stack:
  added:
    - next-themes (ThemeProvider for light/dark mode)
    - Nunito via next/font/google
  patterns:
    - OKLCH color tokens in globals.css :root / .dark with @theme inline mapping to Tailwind utilities
    - readContent<T>(page, locale) with locale-fallback to EN for missing translations
    - All placeholder pages follow same server component pattern: params → setRequestLocale → readContent → render

key-files:
  created:
    - app/globals.css (YAPU design tokens, replaced shadcn defaults)
    - components/ThemeProvider.tsx (next-themes wrapper)
    - components/Navigation.tsx (page links, language switcher, theme toggle)
    - lib/content.ts (readContent, readSharedContent)
    - content/data/en/*.json (7 EN content files)
    - content/data/fr/*.json (7 FR content files)
    - content/data/es/*.json (7 ES content files)
    - content/data/shared/company.json (YAPU addresses, social links)
    - app/[locale]/investor-services/page.tsx
    - app/[locale]/data-insights/page.tsx
    - app/[locale]/digital-tools/page.tsx
    - app/[locale]/impact/page.tsx
    - app/[locale]/news/page.tsx
    - app/[locale]/about/page.tsx
  modified:
    - app/[locale]/layout.tsx (added Nunito font, ThemeProvider, Navigation)
    - app/[locale]/page.tsx (enhanced with readContent and design token preview)

key-decisions:
  - "OKLCH color tokens declared as CSS custom properties (not hard-coded values) so dark mode can override them independently"
  - "readContent falls back to EN when locale file is missing — avoids 404 on partially-translated pages"
  - "hasLocale guard used in Navigation switchLocale to narrow string param to typed Locale union (next-intl v4 requirement)"
  - "Placeholder JSON files use minimal hero structure — real content schema designed in Phase 4 after locale audit"

patterns-established:
  - "YAPU brand colors: --yapu-teal, --yapu-mint, --yapu-orange as root source of truth; @theme inline maps to bg-brand, bg-accent, bg-cta"
  - "Content loading: readContent<TypedInterface>('page-name', locale) in server components, never inline JSON imports"
  - "Locale layout pattern: Nunito font variable on <html>, ThemeProvider + NextIntlClientProvider wrapping, Navigation above {children}"

requirements-completed: [FOUND-02, FOUND-04, VIS-05]

# Metrics
duration: ~10min
completed: 2026-02-26
---

# Phase 1 Plan 02: Design Tokens, Content Layer, and Placeholder Pages Summary

**YAPU OKLCH brand tokens (Dark Teal, Mint, Orange-Red) wired into Tailwind v4 via @theme inline, Nunito font loaded, typed readContent<T>() helper with EN fallback, and 21 placeholder pages across EN/FR/ES**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-02-26T08:55:46Z
- **Completed:** 2026-02-26T09:00:17Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify)
- **Files modified:** 35

## Accomplishments

- YAPU's three brand colors (Dark Teal #1E5A64, Mint #45B5B4, Orange-Red #FF2A13) visible as OKLCH tokens with light/dark mode overrides
- Typed content JSON layer (`readContent<T>`) with locale fallback to EN, enabling all subsequent phases to load structured data
- All 21 routes (7 pages x 3 locales) building and rendering with locale-specific placeholder content
- Basic navigation bar with working language switcher and theme toggle verified by human

## Task Commits

Each task was committed atomically:

1. **Task 1: YAPU design tokens, Nunito font, and dark mode theming** - `5ddb376` (feat)
2. **Task 2: Content JSON layer, placeholder pages, and basic navigation** - `b47df7d` (feat)
3. **Task 3: Visual verification of foundation** - checkpoint:human-verify (approved by user, no code commit)

## Files Created/Modified

- `app/globals.css` - YAPU OKLCH tokens, @theme inline mappings, :root light and .dark overrides (replaced shadcn defaults)
- `components/ThemeProvider.tsx` - next-themes wrapper with "use client" directive
- `components/Navigation.tsx` - Sticky nav with page links, language switcher (useRouter locale replacement), Sun/Moon theme toggle
- `lib/content.ts` - readContent<T>(page, locale) with EN fallback; readSharedContent<T>(file)
- `content/data/en/*.json` - 7 English content files with hero section structure
- `content/data/fr/*.json` - 7 French content files with translated hero text
- `content/data/es/*.json` - 7 Spanish content files with translated hero text
- `content/data/shared/company.json` - YAPU Solutions GmbH addresses (Berlin, Quito) and social links
- `app/[locale]/layout.tsx` - Added Nunito font variable, ThemeProvider wrapping, Navigation component
- `app/[locale]/page.tsx` - Homepage with readContent call and YAPU design token preview grid
- `app/[locale]/investor-services/page.tsx` - Placeholder with readContent('investor-services', locale)
- `app/[locale]/data-insights/page.tsx` - Placeholder with readContent('data-insights', locale)
- `app/[locale]/digital-tools/page.tsx` - Placeholder with readContent('digital-tools', locale)
- `app/[locale]/impact/page.tsx` - Placeholder with readContent('impact', locale)
- `app/[locale]/news/page.tsx` - Placeholder with readContent('news', locale)
- `app/[locale]/about/page.tsx` - Placeholder with readContent('about', locale)

## Decisions Made

- OKLCH custom properties declared at `:root` level (not hard-coded in Tailwind config) so `.dark` can override each token independently without utility duplication
- `readContent` falls back to EN when a locale file is missing — avoids 404 errors on partially-translated content in future phases
- `hasLocale` guard applied in Navigation's `switchLocale` to narrow the string locale parameter to next-intl's typed `Locale` union (required pattern for next-intl v4)
- Placeholder JSON files use a minimal `{ hero, sections: [] }` structure — real content schema will be designed in Phase 4 after auditing locale structural mismatches on live yapu.solutions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added hasLocale guard in Navigation switchLocale**
- **Found during:** Task 2 (Navigation.tsx implementation)
- **Issue:** `router.replace(pathname, { locale: newLocale })` expects a typed `Locale` value, but `newLocale` arrives as `string` from the dropdown — TypeScript error without narrowing
- **Fix:** Wrapped locale assignment with `hasLocale(routing.locales, newLocale)` check before calling router.replace
- **Files modified:** `components/Navigation.tsx`
- **Verification:** Build passed without TypeScript errors
- **Committed in:** b47df7d (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Required fix for TypeScript correctness and next-intl v4 compatibility. No scope creep.

## Issues Encountered

None — the plan executed cleanly after the hasLocale fix. All 21 routes built successfully and passed human visual verification.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Design token foundation complete: all subsequent phases can use `bg-brand`, `bg-accent`, `bg-cta`, `text-foreground` without redeclaring colors
- Content layer ready: `readContent<T>('page-name', locale)` usable in any server component immediately
- All 7 page routes exist and are routable — Phase 3 (UI components) can replace placeholder content without restructuring
- Navigation bar is intentionally minimal — Phase 3 adds mega-menu, mobile hamburger, search

**Concern carried forward:** Phase 4 must audit locale structural mismatches between EN/FR/ES on live yapu.solutions before designing final JSON schema. Current placeholder structure (`{ hero, sections: [] }`) will likely be replaced entirely.

## Self-Check: PASSED

- FOUND: app/globals.css
- FOUND: components/ThemeProvider.tsx
- FOUND: components/Navigation.tsx
- FOUND: lib/content.ts
- FOUND: content/data/en/homepage.json
- FOUND: content/data/fr/homepage.json
- FOUND: content/data/es/homepage.json
- FOUND: content/data/shared/company.json
- FOUND: app/[locale]/about/page.tsx
- FOUND: app/[locale]/investor-services/page.tsx
- FOUND commit 5ddb376 (Task 1)
- FOUND commit b47df7d (Task 2)

---
*Phase: 01-foundation*
*Completed: 2026-02-26*
