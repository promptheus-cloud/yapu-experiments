---
phase: 05-compliance-integration
plan: 01
subsystem: compliance
tags: [gdpr, cookie-consent, google-analytics, ga4, consent-mode-v2, i18n]
dependency_graph:
  requires: []
  provides: [cookie-consent-banner, ga4-integration, consent-mode-v2]
  affects: [app/[locale]/layout.tsx, all-pages]
tech_stack:
  added: [next/script]
  patterns: [ga4-consent-mode-v2, localStorage-persistence, server-component-script-loading]
key_files:
  created:
    - components/CookieConsent.tsx
    - components/GoogleAnalytics.tsx
  modified:
    - app/[locale]/layout.tsx
    - messages/en.json
    - messages/fr.json
    - messages/es.json
    - messages/en.d.json.ts
decisions:
  - "STORAGE_KEY = 'yapu_cookie_consent' — namespaced key avoids conflicts with other projects sharing the same domain"
  - "showBanner initialized to false (not true) to avoid hydration mismatch — set to true only in useEffect after localStorage check"
  - "GoogleAnalytics placed before NextIntlClientProvider in body — Script components are hoisted by Next.js, placement is semantic preference"
  - "CookieConsent placed after Footer inside ThemeProvider — requires NextIntlClientProvider ancestor for useTranslations"
  - "consent defaults use beforeInteractive strategy — must execute before GA4 library loads to ensure correct initial state"
  - "metadataBase set to https://yapu.promptheus.cloud with title.template '%s | YAPU Solutions' for consistent SEO"
metrics:
  duration: 2 min
  completed: 2026-02-27
  tasks_completed: 2
  files_modified: 7
---

# Phase 05 Plan 01: Compliance Integration Summary

**One-liner:** GDPR cookie consent banner with localStorage persistence and GA4 Consent Mode v2 defaults-denied integration added to all pages.

## What Was Built

GA4 Consent Mode v2 integration with GDPR-compliant cookie banner:

1. **CookieConsent.tsx** — `'use client'` component with fixed bottom banner. Reads localStorage on mount; shows banner only when no stored preference. Accept calls `gtag('consent', 'update', { analytics_storage: 'granted' })`. Decline stores `'denied'` and hides banner. Styled with brand colors (dark teal background, mint accept button).

2. **GoogleAnalytics.tsx** — Server component with 3 Script tags. Consent defaults (beforeInteractive, all denied) load before the GA4 library. Gracefully returns null when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is not set.

3. **layout.tsx** — Updated with GoogleAnalytics before providers, CookieConsent after Footer inside ThemeProvider. generateMetadata updated with metadataBase, title template, and OpenGraph siteName.

4. **i18n strings** — CookieConsent namespace added to all 3 locales (EN, FR, ES) with message, privacyPolicy, accept, decline keys. Type declarations in en.d.json.ts updated to match.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create CookieConsent and GoogleAnalytics components | 8ab851b | components/CookieConsent.tsx, components/GoogleAnalytics.tsx |
| 2 | Wire components into layout and add CookieConsent i18n strings | 3dc5ad2 | app/[locale]/layout.tsx, messages/en.json, messages/fr.json, messages/es.json, messages/en.d.json.ts |

## Verification Results

- `npx tsc --noEmit` passes without errors
- CookieConsent.tsx contains localStorage (3 usages) and gtag consent update call
- GoogleAnalytics.tsx contains consent default initialization and googletagmanager script
- layout.tsx contains metadataBase, GoogleAnalytics, and CookieConsent references
- CookieConsent namespace present in all 3 locale message files

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| `showBanner` initialized false | Avoids server/client hydration mismatch — only set to true in useEffect |
| GoogleAnalytics before NextIntlClientProvider | Semantic placement; Next.js hoists Scripts regardless |
| CookieConsent inside ThemeProvider | Required ancestor for useTranslations hook |
| `beforeInteractive` for consent defaults | Must execute before GA4 library to set denied defaults |
| metadataBase = yapu.promptheus.cloud | Preview domain; can be updated to final domain at launch |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Sequencing] TypeScript verification moved to after Task 2**
- **Found during:** Task 1 verification
- **Issue:** CookieConsent.tsx references `useTranslations('CookieConsent')` but the `CookieConsent` namespace wasn't yet defined in `en.d.json.ts` — Task 2 adds it. Verifying TS after Task 1 alone would fail.
- **Fix:** Ran full TS verification after both tasks were complete. Task 1 commit was made after Task 2 resolved the type issue.
- **Files modified:** None (sequencing only)
- **Commit:** N/A

**Note:** The `en.d.json.ts` file was auto-updated by a linter/tool immediately after `en.json` was edited — confirming the project has automated type generation in place.

## User Setup Required

GA4 is not active until the environment variable is configured:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Source: Google Analytics Admin > Data Streams > Measurement ID.

When not set, GoogleAnalytics component returns null — no errors, no scripts loaded.
