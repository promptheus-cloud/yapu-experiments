---
phase: 01-foundation
plan: 01
subsystem: infra
tags: [next.js, tailwind, shadcn, next-intl, typescript, i18n, en, fr, es]

# Dependency graph
requires: []
provides:
  - "Next.js 16.1.6 App Router project scaffold with TypeScript and Tailwind v4"
  - "shadcn/ui initialized with new-york style and CSS variables"
  - "next-intl i18n routing for EN/FR/ES with cookie persistence"
  - "proxy.ts middleware for locale detection and redirect"
  - "Compile-time translation key type checking via AppConfig augmentation"
  - "Static generation of /en, /fr, /es routes"
affects: [02-design-system, 03-navigation, 04-content, 05-pages, 06-ember-integration, 07-deployment]

# Tech tracking
tech-stack:
  added:
    - "next@16.1.6 (App Router, SSG)"
    - "tailwindcss@4.2.1 (CSS-first, no config file)"
    - "shadcn/ui (new-york style, radix-ui, data-slot attributes)"
    - "next-intl@4.8.3 (i18n routing + type safety)"
    - "next-themes@0.4.6"
    - "lucide-react@0.575.0"
    - "clsx + tailwind-merge (via lib/utils.ts cn())"
  patterns:
    - "Tailwind v4 CSS-first: all config in app/globals.css via @theme inline {}"
    - "next-intl: i18n/request.ts loads messages dynamically by locale"
    - "next-intl: hasLocale guard narrows string to Locale type in every component"
    - "Locale layout pattern: app/[locale]/layout.tsx owns html/body, root layout is pass-through"
    - "Static generation: generateStaticParams in locale layout produces /en /fr /es"
    - "proxy.ts (not middleware.ts) for Next.js 16 middleware naming"

key-files:
  created:
    - "proxy.ts - next-intl middleware with locale detection matcher"
    - "i18n/routing.ts - defineRouting with en/fr/es locales and 1yr cookie"
    - "i18n/request.ts - getRequestConfig loading messages dynamically"
    - "i18n/navigation.ts - typed Link, redirect, usePathname, useRouter, getPathname"
    - "global.d.ts - AppConfig augmentation for compile-time translation key checking"
    - "messages/en.json - English UI strings (Metadata, Navigation, Common, Theme, Placeholder)"
    - "messages/fr.json - French translations"
    - "messages/es.json - Spanish translations"
    - "app/[locale]/layout.tsx - locale layout with NextIntlClientProvider and generateStaticParams"
    - "app/[locale]/page.tsx - locale-aware placeholder homepage"
    - "lib/utils.ts - cn() helper (clsx + tailwind-merge)"
    - "components.json - shadcn/ui configuration"
  modified:
    - "app/layout.tsx - reduced to pass-through (no html/body)"
    - "next.config.ts - wrapped with createNextIntlPlugin, createMessagesDeclaration, turbopack.root"
    - "tsconfig.json - added allowArbitraryExtensions: true"
    - "package.json - added next-intl, next-themes, lucide-react, shadcn dependencies"

key-decisions:
  - "proxy.ts instead of middleware.ts for Next.js 16 middleware (plan spec)"
  - "i18n/request.ts dynamically imports messages by locale (not static top-level import)"
  - "hasLocale guard required in every component to narrow string to typed Locale union"
  - "turbopack.root set to suppress workspace root warning from parent package-lock.json"
  - "Root layout is pass-through (no html/body) — locale layout owns document structure"

patterns-established:
  - "Locale guard pattern: always use hasLocale before setRequestLocale or getTranslations"
  - "Message loading: dynamic import('../messages/${locale}.json') in getRequestConfig"
  - "Type safety: global.d.ts AppConfig augmentation enables autocomplete and compile-time errors"

requirements-completed: [FOUND-01, FOUND-03, FOUND-05]

# Metrics
duration: 8min
completed: 2026-02-26
---

# Phase 1 Plan 01: Foundation Scaffold Summary

**Next.js 16 + Tailwind v4 + shadcn/ui scaffold with next-intl i18n routing for EN/FR/ES, TypeScript type-safe translation keys, and static generation of locale-prefixed routes**

## Performance

- **Duration:** 8 min
- **Started:** 2026-02-26T08:40:31Z
- **Completed:** 2026-02-26T08:48:58Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments

- Next.js 16.1.6 App Router project scaffolded with Tailwind v4 (CSS-first, no config file), ESLint, TypeScript
- shadcn/ui initialized with new-york style, CSS variables, lucide icons, cn() helper in lib/utils.ts
- next-intl i18n routing configured: /en, /fr, /es routes statically generated with locale auto-detection middleware
- AppConfig augmentation in global.d.ts enables compile-time translation key checking and IDE autocomplete
- All three locale routes (en/fr/es) render translated placeholder content and build passes cleanly

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 16 with Tailwind v4 and shadcn/ui** - `996ee06` (chore)
2. **Task 2: Configure next-intl i18n routing for EN/FR/ES** - `6f9a10b` (feat)

## Files Created/Modified

- `proxy.ts` - next-intl middleware with locale detection and routing (matches /((?!api|trpc|_next|_vercel|.*\\..*).*)
- `i18n/routing.ts` - defineRouting config with en/fr/es locales, 1yr cookie persistence
- `i18n/request.ts` - getRequestConfig with hasLocale guard and dynamic message loading
- `i18n/navigation.ts` - typed navigation helpers (Link, redirect, usePathname, useRouter, getPathname)
- `global.d.ts` - AppConfig augmentation for compile-time translation type safety
- `messages/en.json` - English UI strings (Navigation, Common, Theme, Placeholder, Metadata namespaces)
- `messages/fr.json` - French translations (all namespaces)
- `messages/es.json` - Spanish translations (all namespaces)
- `app/layout.tsx` - Reduced to pass-through (html/body owned by locale layout)
- `app/[locale]/layout.tsx` - Locale layout with generateStaticParams, hasLocale guard, NextIntlClientProvider
- `app/[locale]/page.tsx` - Placeholder homepage using Placeholder.title/description translations
- `next.config.ts` - createNextIntlPlugin with createMessagesDeclaration, turbopack.root
- `tsconfig.json` - Added allowArbitraryExtensions: true
- `lib/utils.ts` - cn() helper (clsx + tailwind-merge) from shadcn/ui init
- `components.json` - shadcn/ui configuration (new-york, CSS variables, lucide)
- `package.json` - next@16.1.6, tailwindcss@^4, next-intl, next-themes, lucide-react, shadcn deps

## Decisions Made

- **proxy.ts not middleware.ts**: Plan specifies this naming for Next.js 16 middleware
- **Dynamic message loading**: i18n/request.ts uses `await import('../messages/${locale}.json')` instead of static imports — avoids bundle bloat when there are many locales
- **hasLocale guard pattern**: Every component receiving locale as `string` from params must call hasLocale to narrow the type to the typed Locale union before using next-intl APIs
- **turbopack.root**: Set to suppress workspace root warning caused by a parent-level package-lock.json in the monorepo parent directory

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in generateMetadata**
- **Found during:** Task 2 (Configure next-intl i18n routing)
- **Issue:** Plan template passes `locale: string` to `getTranslations({locale, namespace})` but next-intl v4 requires typed `Locale` ("en" | "fr" | "es"). TypeScript compile error.
- **Fix:** Added `if (!hasLocale(routing.locales, locale)) return {}` guard before the getTranslations call in generateMetadata, which narrows type correctly
- **Files modified:** app/[locale]/layout.tsx
- **Verification:** `npx next build` passes TypeScript check
- **Committed in:** 6f9a10b (Task 2 commit)

**2. [Rule 1 - Bug] Fixed TypeScript type error in page.tsx setRequestLocale**
- **Found during:** Task 2 (Configure next-intl i18n routing)
- **Issue:** `setRequestLocale(locale)` with `locale: string` fails TS since it requires typed Locale
- **Fix:** Added hasLocale guard + notFound() in page.tsx before setRequestLocale call
- **Files modified:** app/[locale]/page.tsx
- **Verification:** `npx next build` passes TypeScript check
- **Committed in:** 6f9a10b (Task 2 commit)

**3. [Rule 1 - Bug] Added messages loading to i18n/request.ts**
- **Found during:** Task 2 verification (next build)
- **Issue:** Plan template for request.ts only returns `{locale}` but next-intl v4 requires `messages` to be returned too. Build error: "No messages found."
- **Fix:** Added `messages: (await import('../messages/${locale}.json')).default` to the return object
- **Files modified:** i18n/request.ts
- **Verification:** `npx next build` generates /en, /fr, /es pages successfully
- **Committed in:** 6f9a10b (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (3 Rule 1 bugs)
**Impact on plan:** All three auto-fixes were necessary for correct TypeScript compilation and runtime message loading. No scope creep. Changes are minimal patches to plan templates to match next-intl v4 API.

## Issues Encountered

- `create-next-app` refuses to scaffold into a non-empty directory (even with `--yes`). Scaffolded into a temp directory and copied files into the project. This is the expected behavior and not a blocker.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Project foundation complete: Next.js 16 + Tailwind v4 + shadcn/ui + next-intl all working
- `/en`, `/fr`, `/es` routes statically generated and building cleanly
- TypeScript type safety for translation keys active via AppConfig augmentation
- Ready for Phase 1 Plan 02: Design system tokens, ThemeProvider, font setup, and navigation scaffold
- No blockers.

---
*Phase: 01-foundation*
*Completed: 2026-02-26*

## Self-Check: PASSED

All files confirmed present:
- proxy.ts: FOUND
- i18n/routing.ts: FOUND
- i18n/request.ts: FOUND
- i18n/navigation.ts: FOUND
- next.config.ts: FOUND
- global.d.ts: FOUND
- messages/en.json: FOUND
- messages/fr.json: FOUND
- messages/es.json: FOUND
- app/[locale]/layout.tsx: FOUND
- app/[locale]/page.tsx: FOUND
- lib/utils.ts: FOUND
- tsconfig.json: FOUND
- .planning/phases/01-foundation/01-01-SUMMARY.md: FOUND

All commits confirmed:
- 996ee06: chore(01-01): scaffold Next.js 16 with Tailwind v4 and shadcn/ui
- 6f9a10b: feat(01-01): configure next-intl i18n routing for EN/FR/ES
- c37cb6e: docs(01-01): complete foundation scaffold plan
