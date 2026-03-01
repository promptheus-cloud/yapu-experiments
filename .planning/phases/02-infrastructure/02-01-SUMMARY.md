---
phase: 02-infrastructure
plan: 01
subsystem: infra
tags: [next.js, zod, api, content-api, force-dynamic, distDir]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Content JSON layer, placeholder pages, routing setup
provides:
  - Content API POST handler at /api/content with bearer auth, Zod validation, write and patch modes
  - Build output isolated to .next-prod/ via distDir
  - All content pages force-dynamic (SSR on every request)
  - deepMerge utility for nested JSON patch operations
affects: [03-preview, 06-ember-integration, any phase serving or building the Next.js app]

# Tech tracking
tech-stack:
  added: [zod@4.3.6]
  patterns:
    - distDir in next.config.ts separates prod build from dev .next/ directory
    - force-dynamic on all content pages ensures fresh JSON reads on every request
    - Content API uses file existence check as guard against creating arbitrary files
    - Zod v4 z.record() requires two arguments (keyType, valueType) — not single-arg like v3

key-files:
  created:
    - app/api/content/route.ts
    - lib/deep-merge.ts
  modified:
    - next.config.ts
    - .gitignore
    - app/[locale]/page.tsx
    - app/[locale]/layout.tsx
    - app/[locale]/investor-services/page.tsx
    - app/[locale]/data-insights/page.tsx
    - app/[locale]/digital-tools/page.tsx
    - app/[locale]/impact/page.tsx
    - app/[locale]/news/page.tsx
    - app/[locale]/about/page.tsx

key-decisions:
  - "Zod v4 installed (latest) — z.record() requires two args, fixed during execution"
  - "File existence check prevents Content API from creating arbitrary new content files"
  - "Arrays are replaced entirely in deepMerge, not merged element-by-element (correct for content editing)"
  - "API route does NOT have force-dynamic export — Next.js App Router auto-detects dynamic routes that read request headers"

patterns-established:
  - "Content API pattern: bearer auth -> Zod validate -> file exists check -> write/patch -> return ok"
  - "deepMerge: recursive for objects, replace for arrays and primitives"

requirements-completed: [EDIT-01, EDIT-03]

# Metrics
duration: 4min
completed: 2026-02-26
---

# Phase 02 Plan 01: Infrastructure Summary

**Content API at POST /api/content with bearer auth + Zod validation, all pages force-dynamic, build output isolated to .next-prod/**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-26T11:22:25Z
- **Completed:** 2026-02-26T11:26:55Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Build output now writes to `.next-prod/` via `distDir` — dev server uses `.next/` so no conflict
- All 7 content pages use `export const dynamic = 'force-dynamic'` — SSR on every request ensures immediate content edit visibility
- `generateStaticParams` removed from layout.tsx and all 6 subpages (incompatible with force-dynamic)
- Content API POST handler at `/api/content` with bearer token auth, Zod body validation, full-replace and patch modes
- `lib/deep-merge.ts` recursive deep-merge utility (arrays replaced, objects merged)
- TypeScript compiles cleanly after fixing Zod v4 API difference

## Task Commits

Each task was committed atomically:

1. **Task 1: Build separation and force-dynamic on all content pages** - `dbd1f68` (feat)
2. **Task 2: Content API route handler with bearer auth and Zod validation** - `aa236ea` (feat)

## Files Created/Modified

- `app/api/content/route.ts` - POST and OPTIONS handlers, bearer auth, Zod validation, write/patch logic
- `lib/deep-merge.ts` - Recursive deep-merge for patch operations
- `next.config.ts` - Added `distDir: '.next-prod'`
- `.gitignore` - Added `/.next-prod/`
- `app/[locale]/page.tsx` - Added `export const dynamic = 'force-dynamic'`
- `app/[locale]/layout.tsx` - Removed `generateStaticParams`
- `app/[locale]/investor-services/page.tsx` - Added force-dynamic, removed generateStaticParams
- `app/[locale]/data-insights/page.tsx` - Added force-dynamic, removed generateStaticParams
- `app/[locale]/digital-tools/page.tsx` - Added force-dynamic, removed generateStaticParams
- `app/[locale]/impact/page.tsx` - Added force-dynamic, removed generateStaticParams
- `app/[locale]/news/page.tsx` - Added force-dynamic, removed generateStaticParams
- `app/[locale]/about/page.tsx` - Added force-dynamic, removed generateStaticParams
- `package.json` / `package-lock.json` - zod@4.3.6 added

## Decisions Made

- Used Zod v4 (latest available) — `z.record()` signature differs from v3, requires `(keyType, valueType)` two args
- File existence check added to Content API — prevents creating arbitrary new content files via POST
- Arrays replaced entirely in deepMerge — correct behavior for content editing (replacing a list of sections, not appending)
- API route handler reads `Authorization` header so Next.js App Router auto-marks it dynamic — no explicit `export const dynamic` needed

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod v4 z.record() two-arg API**
- **Found during:** Task 2 (Content API route handler)
- **Issue:** `z.record(z.unknown())` is Zod v3 API. Zod v4 requires `z.record(z.string(), z.unknown())` — TypeScript errors on lines 22-23
- **Fix:** Changed both `z.record(z.unknown())` calls to `z.record(z.string(), z.unknown())`
- **Files modified:** `app/api/content/route.ts`
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** aa236ea (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in API usage due to Zod v4 breaking change)
**Impact on plan:** Necessary fix, no scope creep, behavior identical to plan intent.

## Issues Encountered

- Zod v4.3.6 installed (latest) which changed `z.record()` signature from single-arg to two-arg. Fixed inline per deviation Rule 1.

## User Setup Required

**One environment variable required before Content API is functional:**

Add to `.env.local` (dev) and server environment (prod):
```
CONTENT_API_SECRET=<strong-random-secret>
```

Without this variable, `process.env.CONTENT_API_SECRET` is `undefined`, so `Bearer undefined` becomes the expected token — any request with `Authorization: Bearer undefined` would succeed. Set this before exposing the server to Ember.

## Next Phase Readiness

- Build infrastructure complete — two-instance `.next/` vs `.next-prod/` separation validated
- Content API is ready for Ember to write content — needs `CONTENT_API_SECRET` env var set
- All content pages are SSR with force-dynamic — content edits will be visible on next page load
- TypeScript compiles cleanly, build succeeds

## Self-Check: PASSED

- FOUND: `app/api/content/route.ts`
- FOUND: `lib/deep-merge.ts`
- FOUND: `next.config.ts`
- FOUND: `.next-prod/` directory
- FOUND: commit `dbd1f68` (Task 1)
- FOUND: commit `aa236ea` (Task 2)

---
*Phase: 02-infrastructure*
*Completed: 2026-02-26*
