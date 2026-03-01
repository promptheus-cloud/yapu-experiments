---
phase: 05-compliance-integration
plan: 02
subsystem: compliance
tags: [newsletter, brevo, seo, metadata, opengraph, i18n, comp-04, comp-05, comp-06]
dependency_graph:
  requires: [05-01]
  provides: [newsletter-api, brevo-integration, per-page-seo-metadata]
  affects: [app/api/newsletter/route.ts, components/Newsletter.tsx, all-7-pages, messages]
tech_stack:
  added: []
  patterns: [brevo-contacts-api, next-generateMetadata, per-page-meta-namespaces, zod-api-validation]
key_files:
  created:
    - app/api/newsletter/route.ts
  modified:
    - components/Newsletter.tsx
    - app/[locale]/page.tsx
    - app/[locale]/investor-services/page.tsx
    - app/[locale]/data-insights/page.tsx
    - app/[locale]/digital-tools/page.tsx
    - app/[locale]/impact/page.tsx
    - app/[locale]/news/page.tsx
    - app/[locale]/about/page.tsx
    - messages/en.json
    - messages/fr.json
    - messages/es.json
    - messages/en.d.json.ts
decisions:
  - "Newsletter API returns 200 with mock:true when BREVO_API_KEY not configured — graceful degradation avoids UX breakage during development"
  - "Error message placed after submit button (not above it) — closer to the action that triggered the error"
  - "Per-page Meta namespaces follow pattern '{PageName}Meta' — consistent with project i18n namespace naming convention"
  - "Homepage generateMetadata returns descriptive title not brand name — layout template appends '| YAPU Solutions' automatically"
  - "COMP-06 satisfied via existing Footer external links to yapu.solutions/legal-notice and /privacy-policy — no new pages needed"
metrics:
  duration: 2 min
  completed: 2026-02-27
  tasks_completed: 2
  files_modified: 12
---

# Phase 05 Plan 02: Newsletter API + Per-Page SEO Metadata Summary

**One-liner:** Brevo newsletter API route with Zod validation + generateMetadata on all 7 pages with locale-aware titles, descriptions, and OpenGraph tags in EN/FR/ES.

## What Was Built

Two compliance requirements completed:

1. **app/api/newsletter/route.ts** — POST handler with Zod validation (`email: z.string().email()`, optional firstName/lastName). Calls Brevo `POST /v3/contacts` with `api-key` header, maps attributes to `FIRSTNAME`/`LASTNAME`, adds contact to configured list. Returns `200 { ok: true }` on 201/204 from Brevo. Graceful degradation: returns `200 { ok: true, mock: true }` when `BREVO_API_KEY` or `BREVO_LIST_ID` not set (does not break UX). Returns `400` on invalid email, `500` on Brevo errors.

2. **components/Newsletter.tsx** — Replaced mock `handleSubmit` with async function calling `fetch('/api/newsletter', ...)`. Added `loading` state (button disabled + "Subscribing..." text during request). Added `error` state (red text below form on non-ok response). Success state unchanged. All new text from i18n (`errorMessage`, `loadingMessage` added to Newsletter namespace in EN/FR/ES).

3. **generateMetadata on all 7 pages** — Each page exports `generateMetadata({ params })` reading from a `{PageName}Meta` namespace. Uses `getTranslations({ locale, namespace })` pattern. Returns `title`, `description`, and `openGraph.title`/`openGraph.description`. Combined with the layout's `title.template: '%s | YAPU Solutions'`, all 7 pages get unique `<title>` tags.

4. **7 PageMeta i18n namespaces** — Added HomepageMeta, InvestorServicesMeta, DataInsightsMeta, DigitalToolsMeta, ImpactMeta, NewsMeta, AboutMeta to EN, FR, and ES locale files (21 new namespace entries total). en.d.json.ts auto-updated by linter.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create Newsletter API route and wire Newsletter component | de5e78a | app/api/newsletter/route.ts, components/Newsletter.tsx, messages/en.json, messages/fr.json, messages/es.json, messages/en.d.json.ts |
| 2 | Add generateMetadata to all 7 pages with PageMeta i18n strings | 20cea0b | app/[locale]/page.tsx (all 7 pages), messages/en.json, messages/fr.json, messages/es.json, messages/en.d.json.ts |

## Verification Results

- `npx tsc --noEmit` passes without errors (verified after both tasks)
- app/api/newsletter/route.ts exists with Zod validation and `api.brevo.com/v3/contacts` call
- Newsletter.tsx contains `fetch('/api/newsletter'` with loading, error, and success states
- Submit button shows `loadingMessage` text when loading=true and has `disabled={loading}`
- Error paragraph renders below form with `text-red-300` class
- Graceful degradation: when BREVO env vars absent, returns 200 with mock:true
- All 7 pages export generateMetadata with HomepageMeta, InvestorServicesMeta, etc.
- All 7 PageMeta namespaces present in en.json, fr.json, es.json
- COMP-06: Footer.tsx lines 71 and 79 link to yapu.solutions/legal-notice and yapu.solutions/privacy-policy

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Graceful degradation returns 200 mock:true | Development without Brevo credentials should not break the newsletter form UX |
| Error placed after button not before | Closer to the submission action, matches common form UX patterns |
| `{PageName}Meta` namespace pattern | Consistent with existing project namespaces (InvestorServices, DataInsights, etc.) |
| Homepage uses descriptive title not brand name | Layout template appends `| YAPU Solutions` — both homepage and subpages get unique, meaningful titles |
| COMP-06 verified as already complete | Footer already had the required legal links added in Phase 03; no new pages needed |

## Deviations from Plan

None — plan executed exactly as written.

Note: `en.d.json.ts` was auto-updated by the project's linter immediately after `en.json` was edited (consistent with behavior observed in Plan 01). No manual edits to the type file were needed.

## User Setup Required

Newsletter API is inactive until Brevo credentials are configured in `.env.local`:

```
BREVO_API_KEY=your-api-key-here
BREVO_LIST_ID=12345
```

Source:
- `BREVO_API_KEY`: Brevo Dashboard → SMTP & API → API Keys → Generate a new API key
- `BREVO_LIST_ID`: Brevo Dashboard → Contacts → Lists → select list → ID visible in URL (numeric)

When not set, the API returns `{ ok: true, mock: true }` — form shows success message, no Brevo call is made.
