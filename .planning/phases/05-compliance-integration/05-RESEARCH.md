# Phase 5: Compliance + Integration — Research

**Researched:** 2026-02-27
**Domain:** GDPR cookie consent, Google Analytics 4 consent gating, newsletter API integration, Next.js SEO metadata
**Confidence:** HIGH (metadata, newsletter), MEDIUM (cookie consent implementation pattern)

---

## Summary

Phase 5 adds four independent compliance and integration concerns to an already-complete Next.js 16 App Router site: (1) GDPR cookie consent banner with granular categories and localStorage persistence, (2) Google Analytics 4 gated behind user consent, (3) a functional newsletter signup form connected to an email provider, and (4) per-page SEO metadata (title, description, OpenGraph) for all 7 pages in 3 locales.

The metadata work is the lowest-risk path: Next.js 16 has a native `generateMetadata` / `metadata` export API (since 13.2) that integrates directly with next-intl's `getTranslations`. The layout already has a minimal `Metadata` namespace — it just needs to be extended per page. Cookie consent and GA4 integration are best done with a lightweight custom implementation (no heavy CMP library) using `next/script`, `localStorage`, and the Google Consent Mode v2 `gtag('consent', 'update', {...})` API. The newsletter form already exists as a UI-only component; the only work is wiring it to an API route that calls Brevo's `POST /v3/contacts` endpoint. The legal pages (COMP-06) are already satisfied by links in Footer.tsx pointing to the live yapu.solutions pages — no new pages need to be built.

**Primary recommendation:** Custom consent banner + localStorage persistence + GA4 Consent Mode v2 + Brevo newsletter API route + per-page `generateMetadata` using next-intl `getTranslations`. No third-party CMP libraries needed.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| COMP-01 | GDPR cookie consent banner with granular category consent (analytics, marketing) | Custom banner component with `'use client'`, category checkboxes, localStorage state — standard Next.js App Router pattern |
| COMP-02 | Cookie preference persists across page navigation and browser refresh | `localStorage` read in `useEffect` on mount; state set before render — no hydration errors if guarded by `useEffect` |
| COMP-03 | Google Analytics integration, gated by cookie consent acceptance | `next/script` with `strategy="afterInteractive"`, GA4 Consent Mode v2 defaulting to `'denied'`, updated to `'granted'` on user accept |
| COMP-04 | Functional newsletter subscription form connected to email provider | New `app/api/newsletter/route.ts` POST handler calling Brevo `POST https://api.brevo.com/v3/contacts`; Newsletter.tsx updated to call this route |
| COMP-05 | SEO meta tags and OpenGraph data for all pages | `generateMetadata` in each `page.tsx` using `getTranslations({locale, namespace: 'PageMeta'})`; `metadataBase` set in root layout |
| COMP-06 | Privacy Policy and Legal Notice pages (or links to YAPU's existing ones) | Already satisfied — Footer.tsx links to `https://yapu.solutions/legal-notice` and `https://yapu.solutions/privacy-policy`. No new pages needed. |
</phase_requirements>

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next/script` | (bundled with Next.js 16) | Load GA4 script with consent mode | Built-in, `strategy="afterInteractive"` defers load, `dangerouslySetInnerHTML` sets consent defaults |
| Next.js `Metadata` API | Next.js 16 native | Per-page title, description, OpenGraph | Native, no dependency, TypeScript-typed, merges across layout/page hierarchy |
| `next-intl` `getTranslations` | 4.8.3 (already installed) | Locale-aware metadata strings | Already used in layout.tsx for the `Metadata` namespace |
| Brevo API v3 | REST, no SDK needed | Newsletter subscription | Free tier, already known to client (YAPU uses Brevo), native `fetch` is sufficient |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `localStorage` (browser API) | n/a | Persist consent preference across sessions | Required for COMP-02; already used in other Next.js projects |
| `js-cookie` or `cookies-next` | optional | Cookie-based alternative to localStorage for consent storage | Only if SSR consent-check is required — not needed for this project since analytics consent is client-only |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom banner | `react-cookie-consent` npm package | Package adds ~20KB, custom gives full control over YAPU styling with existing Tailwind/shadcn; prefer custom |
| Custom banner | Termly/CookieYes CMP | Managed SaaS; external dependency; overkill for a demo site with only analytics cookies |
| Brevo native `fetch` | `@getbrevo/brevo` SDK | SDK is ~300KB; raw `fetch` call with api-key header achieves same result in <20 lines |
| `generateMetadata` per-page | Shared metadata object in layout | Layout-level only metadata is already present; per-page override needed for COMP-05 |

**Installation:**
```bash
# No new packages needed — all work uses existing Next.js APIs + Brevo REST
# Environment variable additions to .env.local:
# BREVO_API_KEY=your-brevo-api-key
# BREVO_LIST_ID=your-list-id (numeric)
# NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Architecture Patterns

### Recommended Project Structure

```
app/
  [locale]/
    layout.tsx           — add metadataBase + title template
    page.tsx             — add generateMetadata (Homepage)
    investor-services/page.tsx  — add generateMetadata
    data-insights/page.tsx      — add generateMetadata
    digital-tools/page.tsx      — add generateMetadata
    impact/page.tsx             — add generateMetadata
    news/page.tsx               — add generateMetadata
    about/page.tsx              — add generateMetadata
  api/
    newsletter/
      route.ts           — NEW: POST handler calling Brevo API

components/
  CookieConsent.tsx      — NEW: banner with accept/decline/customise, localStorage persistence
  GoogleAnalytics.tsx    — NEW: next/script GA4 with Consent Mode v2 defaults

messages/
  en.json                — extend with PageMeta.* namespaces per page, CookieConsent.* strings
  fr.json                — same
  es.json                — same
```

### Pattern 1: Cookie Consent Banner with localStorage

**What:** A `'use client'` component that reads consent state from localStorage on mount, shows the banner only if no decision is stored, and updates both localStorage and `window.gtag` consent when the user interacts.

**When to use:** First visit only. Subsequent visits should not show the banner — the `useEffect` checks localStorage before rendering.

**Example:**
```typescript
// components/CookieConsent.tsx
'use client';
import { useState, useEffect } from 'react';

type ConsentState = 'granted' | 'denied' | null;

const STORAGE_KEY = 'yapu_cookie_consent';

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null); // null = not yet loaded
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // MUST be in useEffect — localStorage is not available on server
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
    setConsent(stored);
    setShowBanner(stored === null); // show only if no decision stored
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'granted');
    setConsent('granted');
    setShowBanner(false);
    // Update GA4 consent mode
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied', // only analytics, not ads
      });
    }
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'denied');
    setConsent('denied');
    setShowBanner(false);
    // Leave GA4 consent as denied (default)
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brand text-white p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-sm">
        We use cookies to improve your experience. Analytics cookies are only placed with your consent.
        <a href="https://yapu.solutions/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline ml-1">
          Privacy Policy
        </a>
      </p>
      <div className="flex gap-3">
        <button onClick={decline} className="px-4 py-2 rounded-full border border-white/40 text-sm hover:bg-white/10">
          Decline
        </button>
        <button onClick={accept} className="px-4 py-2 rounded-full bg-accent text-brand text-sm font-semibold">
          Accept
        </button>
      </div>
    </div>
  );
}
```

**Placement:** Add `<CookieConsent />` to `app/[locale]/layout.tsx` (inside `ThemeProvider`, after `Footer`).

### Pattern 2: Google Analytics 4 with Consent Mode v2

**What:** Two `<Script>` tags in a `GoogleAnalytics` component: first sets consent defaults to `'denied'`, second loads the GA4 tag. Analytics fires only after the user has accepted.

**When to use:** Always rendered (consent default ensures no tracking until consent is given).

**Example:**
```typescript
// components/GoogleAnalytics.tsx
import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* Step 1: Set consent defaults BEFORE gtag loads */}
      <Script
        id="consent-defaults"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'wait_for_update': 500
            });
          `,
        }}
      />
      {/* Step 2: Load GA4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
    </>
  );
}
```

**Placement:** Add `<GoogleAnalytics />` inside `<head>` via `app/[locale]/layout.tsx`. In Next.js App Router, Script components placed anywhere in the component tree are hoisted to `<head>` based on strategy.

### Pattern 3: Newsletter API Route (Brevo)

**What:** A Next.js API Route Handler that receives `{email, firstName, lastName}`, validates with Zod, and POSTs to Brevo's contacts endpoint. Returns success/error JSON consumed by the Newsletter client component.

**Example:**
```typescript
// app/api/newsletter/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  email: z.email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const { email, firstName, lastName } = parsed.data;

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      attributes: {
        FIRSTNAME: firstName ?? '',
        LASTNAME: lastName ?? '',
      },
      listIds: [Number(process.env.BREVO_LIST_ID)],
      updateEnabled: true, // update if contact already exists
    }),
  });

  // 201 = created, 204 = already exists (no content)
  if (response.status === 201 || response.status === 204) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const error = await response.json().catch(() => ({}));
  return NextResponse.json({ error: 'Provider error', details: error }, { status: 500 });
}
```

**Newsletter component update:** Replace the `handleSubmit` mock in `components/Newsletter.tsx` with a real `fetch('/api/newsletter', ...)` call.

### Pattern 4: Per-Page generateMetadata with next-intl

**What:** Each `page.tsx` exports a `generateMetadata` async function that calls `getTranslations({locale, namespace: 'PageMeta'})` and returns the page-specific `Metadata` object.

**When to use:** All 7 `[locale]` pages — only the layout has metadata now.

**Layout-level (set once in app/[locale]/layout.tsx):**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  return {
    metadataBase: new URL('https://yapu.promptheus.cloud'),
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,  // → "Investor Services | YAPU Solutions"
    },
    description: t('description'),
    openGraph: {
      siteName: t('title'),
      type: 'website',
    },
  };
}
```

**Per-page (example for Investor Services):**
```typescript
// app/[locale]/investor-services/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'InvestorServicesMeta' });
  return {
    title: t('title'),          // → "Investor Services | YAPU Solutions" via template
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}
```

**messages/en.json additions needed:**
```json
{
  "InvestorServicesMeta": {
    "title": "Investor Services",
    "description": "Comprehensive investor reporting and impact measurement tools for sustainable finance."
  },
  "DataInsightsMeta": { "title": "Data Insights", "description": "..." },
  "DigitalToolsMeta": { "title": "Digital Tools", "description": "..." },
  "ImpactMeta": { "title": "Impact", "description": "..." },
  "NewsMeta": { "title": "News", "description": "..." },
  "AboutMeta": { "title": "About", "description": "..." },
  "HomepageMeta": { "title": "Digital Tools for Sustainable Finance", "description": "..." }
}
```

### Anti-Patterns to Avoid

- **Checking localStorage outside useEffect:** Will cause SSR hydration mismatch errors. Always gate `localStorage` access inside `useEffect`.
- **Loading GA4 script before consent defaults are set:** Consent defaults MUST be initialized with `'denied'` before the `gtag/js` script loads. Use a `strategy="beforeInteractive"` script for the consent default block.
- **Hardcoding GA4 IDs or Brevo API keys:** Use `NEXT_PUBLIC_GA_MEASUREMENT_ID` (client-visible) for GA4 ID, `BREVO_API_KEY` (server-only, never expose to client) for the newsletter API route.
- **Adding `export const dynamic = 'force-dynamic'` to layout.tsx:** The layout already lacks this — adding it would invalidate static rendering for all pages. Per-page dynamic is set per-page where needed.
- **Re-showing the consent banner on every navigation:** Next.js App Router navigations do not re-mount the layout — the CookieConsent component persists. The `showBanner` state survives navigation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| GA4 script loading | Custom `<script>` tag in `_document` | `next/script` with `strategy="afterInteractive"` | Next.js handles deduplication, strategy, and `<head>` placement automatically |
| Brevo contact creation | Custom email sending infrastructure | Brevo REST API `POST /v3/contacts` | Free tier, immediate, already has SMTP/list management |
| i18n metadata strings | Hardcoding titles in `generateMetadata` | `getTranslations` from `next-intl/server` | Already installed, type-safe, consistent with existing pattern in layout |
| Privacy/legal pages | Building new `/privacy-policy` and `/legal-notice` pages | Links to `https://yapu.solutions/privacy-policy` etc. | Already implemented in Footer.tsx — YAPU's existing pages are authoritative |

**Key insight:** COMP-06 (legal pages) is already done. Footer.tsx links directly to `https://yapu.solutions/legal-notice` and `https://yapu.solutions/privacy-policy` as external links. No new pages need to be created.

---

## Common Pitfalls

### Pitfall 1: Hydration Mismatch from localStorage Access

**What goes wrong:** The CookieConsent component renders `null` on server but conditionally renders a banner on client — React detects the mismatch and throws a warning or error.
**Why it happens:** `localStorage` does not exist on the server. Any direct access outside `useEffect` causes SSR/client differences.
**How to avoid:** Initialize `showBanner` to `false` (server-safe default), then set it in `useEffect` after reading localStorage. The component starts as `null` on both server and client, then updates on client only.
**Warning signs:** Console warning "Text content did not match" or "Hydration failed".

### Pitfall 2: GA4 Script Fires Before Consent Default

**What goes wrong:** GA4 sets cookies immediately on page load before the user sees the banner.
**Why it happens:** If the GA4 script loads before the consent default initialization, the gtag library uses its own default (which may be `'granted'`).
**How to avoid:** Always initialize `gtag('consent', 'default', {...})` with `strategy="beforeInteractive"` — this runs before any other scripts. The GA4 tag with `strategy="afterInteractive"` loads after but inherits the denied defaults.
**Warning signs:** Network inspector shows `_ga` cookies being set on first visit before banner interaction.

### Pitfall 3: Brevo 204 Response Treated as Error

**What goes wrong:** Newsletter form shows an error after a user who already subscribed tries again.
**Why it happens:** Brevo returns HTTP 204 (No Content) when a contact already exists (when `updateEnabled` is not set or the contact is on the list). HTTP 204 is a success response but has no body — calling `.json()` on it throws.
**How to avoid:** Check `response.status === 201 || response.status === 204` for success. Use `response.json().catch(() => ({}))` to safely handle empty body on errors.
**Warning signs:** "SyntaxError: Unexpected end of JSON input" in API route logs.

### Pitfall 4: `generateMetadata` Title Template Not Inheriting

**What goes wrong:** Page titles show just "YAPU Solutions" instead of "Investor Services | YAPU Solutions".
**Why it happens:** `title.template` in layout only applies to pages that set `title` as a string. If a page doesn't export `generateMetadata`, it inherits the layout's `title.default`, not the template.
**How to avoid:** Every page that needs a custom title MUST export its own `generateMetadata` with `title: t('title')`. The template `%s | YAPU Solutions` will then expand `%s`.
**Warning signs:** Browser tab shows "YAPU Solutions" on all pages.

### Pitfall 5: openGraph Images Require Absolute URLs

**What goes wrong:** Build fails with "relative path used in openGraph.images without metadataBase".
**Why it happens:** OG image URLs must be absolute. Relative paths require `metadataBase` to be set.
**How to avoid:** Set `metadataBase: new URL('https://yapu.promptheus.cloud')` in the layout's `generateMetadata`. Relative image paths then resolve correctly.
**Warning signs:** Build-time error mentioning `metadataBase`.

### Pitfall 6: Zod v4 `.email()` API Change

**What goes wrong:** `z.string().email()` still works but Zod v4 also exposes `z.email()` directly. The project uses `zod@^4.3.6` — use `z.string().email()` for compatibility (this is the validated pattern already used in the content API route).
**Why it happens:** Zod v4 changed some APIs vs v3; the project's existing route.ts uses `z.record(z.string(), z.unknown())` with two args (Zod v4 pattern per STATE.md).
**How to avoid:** Use the same Zod patterns as `app/api/content/route.ts`.

---

## Code Examples

Verified patterns from official sources:

### generateMetadata with next-intl (official next-intl docs)
```typescript
// Source: https://next-intl.dev/docs/environments/actions-metadata-route-handlers
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'InvestorServicesMeta' });
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
    },
  };
}
```

### title.template in layout (official Next.js docs)
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
// In app/[locale]/layout.tsx generateMetadata:
return {
  metadataBase: new URL('https://yapu.promptheus.cloud'),
  title: {
    default: 'YAPU Solutions',
    template: '%s | YAPU Solutions',
  },
  description: t('description'),
};
```

### alternates for hreflang (SEO best practice for i18n sites)
```typescript
// Add to layout generateMetadata for international SEO
alternates: {
  languages: {
    'en': '/en',
    'es': '/es',
    'fr': '/fr',
  },
},
```

### Brevo contact creation (verified from Brevo API docs)
```typescript
// POST https://api.brevo.com/v3/contacts
// Header: api-key: YOUR_API_KEY
// Body:
{
  "email": "user@example.com",
  "attributes": { "FIRSTNAME": "John", "LASTNAME": "Doe" },
  "listIds": [42],
  "updateEnabled": true
}
// Response 201: { "id": 12345 }
// Response 204: contact already exists (no content body)
```

### GA4 Consent Mode v2 defaults (verified pattern)
```javascript
// Must run BEFORE GA4 script loads
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 500
});

// After user accepts analytics:
gtag('consent', 'update', {
  'analytics_storage': 'granted'
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pages/_document.js` Script tags | `next/script` with strategy | Next.js 13 (App Router) | No `_document.js` in App Router; use Script component |
| `<title>` tags in `<Head>` | `metadata` export or `generateMetadata` | Next.js 13.2 | Native API, TypeScript typed, layout inheritance |
| localStorage for everything | Cookies alternative for SSR-detected consent | 2024+ | Cookies allow server-side consent detection; localStorage still simpler for client-only consent |
| Single GA script tag | GA4 Consent Mode v2 (4 consent categories) | March 2024 (Google deadline) | Non-compliant sites may see data loss in GA4; 4 categories required |

**Deprecated/outdated:**
- `themeColor` in metadata: deprecated since Next.js 14, use `generateViewport` instead
- `viewport` in metadata: deprecated since Next.js 14

---

## Open Questions

1. **Does YAPU have a GA4 Measurement ID to connect?**
   - What we know: COMP-03 requires GA integration. No GA ID found in existing codebase or env.
   - What's unclear: Whether YAPU has an existing GA4 property or needs a new one created.
   - Recommendation: Implement the full consent + GA4 infrastructure; use `NEXT_PUBLIC_GA_MEASUREMENT_ID` env variable. If no ID is provided, `GoogleAnalytics` component returns `null` gracefully — the banner still works.

2. **Does YAPU have a Brevo account and which list ID to subscribe to?**
   - What we know: Brevo is the recommended provider; the newsletter form collects first name, last name, email.
   - What's unclear: Whether YAPU has a Brevo account; if so, which list ID to use.
   - Recommendation: Implement the API route with `BREVO_API_KEY` and `BREVO_LIST_ID` env vars. Test with a dummy list ID in dev. Document the env vars clearly.

3. **OpenGraph images — does YAPU have an OG image asset?**
   - What we know: OG images should be 1200x630px. There's a YAPU logo in `public/logos/`.
   - What's unclear: Whether a dedicated OG image exists or needs to be created.
   - Recommendation: Use the YAPU logo as the OG image for all pages at minimum (`/logos/yapu-logo.svg` as fallback). A properly sized PNG would be better but is optional for Phase 5.

---

## Validation Architecture

> Skipped — `workflow.nyquist_validation` is not set to `true` in `.planning/config.json`.

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/api-reference/functions/generate-metadata — Full `generateMetadata` API, `openGraph`, `twitter`, `title.template`, `metadataBase`, verified against Next.js 16.1.6
- https://next-intl.dev/docs/environments/actions-metadata-route-handlers — `getTranslations` inside `generateMetadata` pattern, official next-intl docs

### Secondary (MEDIUM confidence)
- https://gaudion.dev/blog/setup-google-analytics-with-gdpr-compliant-cookie-consent-in-nextjs13 — GA4 Consent Mode v2 + cookie banner pattern for Next.js; pattern verified against Google's own Consent Mode v2 documentation
- https://developers.brevo.com/reference/create-contact — Brevo API endpoint, headers, body schema (URL confirmed, content verified via Endgrate secondary source)
- https://endgrate.com/blog/using-the-brevo-api-to-create-or-update-contacts-in-javascript — JavaScript fetch example for Brevo contact creation with `listIds` and `updateEnabled`

### Tertiary (LOW confidence)
- Multiple WebSearch results about `react-cookie-consent` and `consent-nextjs` packages — not recommended for this project based on custom implementation preference

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All core libraries are already installed (next-intl, next/script via Next.js, Zod); Brevo is standard REST
- Architecture: HIGH — Metadata patterns are from official Next.js 16 docs; GA4 consent pattern is well-documented
- Pitfalls: MEDIUM — localStorage/hydration pitfall is well-known; Brevo 204 response pitfall identified from API docs

**Research date:** 2026-02-27
**Valid until:** 2026-05-27 (90 days — stable APIs)
