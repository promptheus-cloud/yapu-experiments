# Stack Research

**Domain:** Chatbot-editable multilingual corporate website (Next.js)
**Researched:** 2026-02-26
**Confidence:** HIGH (core stack verified via official docs and Context7-equivalent sources)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.1 (latest stable) | App framework | Turbopack stable as default bundler, React Compiler stable, PPR caching. App Router is the only routing model to use — Pages Router is in maintenance. |
| React | 19.2 | UI runtime | React 19 is fully stable since Dec 2024. Server Components, `useActionState`, `use()` hook are production-ready. Required by Next.js 16. |
| TypeScript | 5.x (bundled by Next.js) | Type safety | Next.js provides a TypeScript plugin that catches route and directive errors at edit time. `typedRoutes: true` in next.config gives statically typed `<Link href>`. |
| Tailwind CSS | 4.1 | Utility-first styles | v4 is stable (Jan 2025, v4.1 April 2025). OKLCH color model, `@theme inline` for CSS variable theming, no tailwind.config.js needed. Single `@import "tailwindcss"` in CSS. PostCSS plugin `@tailwindcss/postcss` — not the Vite plugin — for Next.js. |
| shadcn/ui | latest (CLI-based, no version pinning) | Component library | Not a versioned npm package — components are copied into your repo. Init with `npx shadcn@latest init`. Supports Tailwind v4 and React 19 explicitly. Uses Radix UI primitives underneath. |
| next-intl | 4.8.3 | i18n / routing | v4 is the current major (ESM-only, TypeScript 5+). Supports Next.js 12–16 and React 16.8+. Provides `defineRouting`, middleware, and typed locale APIs. `[locale]` App Router segment pattern. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.575.0 | Icons | Default icon set for shadcn/ui. Tree-shakable. Use everywhere icons are needed. |
| @radix-ui (via shadcn) | individual 1.x/2.x | Headless UI primitives | Already included when you add shadcn components. React 19 + RSC compatible as of June 2024. Use directly for primitives not exposed by shadcn. |
| react-hook-form | 7.71.2 | Form state management | Best for the newsletter form if complex validation is needed. Works with `useActionState` for Server Action-backed forms. |
| zod | 4.x (stable, recently released) | Schema validation | v4 is now stable. 6.5x faster than v3, 57% smaller bundle. Use for newsletter form field validation in Server Actions. Official Next.js docs show Zod + Server Actions pattern. |
| embla-carousel-react | 8.6.0 (stable) | Logo carousels | Lightest carousel with full touch and auto-scroll support. React 19 officially added to peer deps in v8.3.1. v9 is still RC — do not use. Used by shadcn/ui's Carousel component. |
| vanilla-cookieconsent | 3.1.0 | GDPR cookie consent | Lightweight, zero-dependency, GDPR/CCPA compliant. Wrap in a Client Component with `useEffect` for Next.js. No React-specific package needed. |
| @next/third-parties | latest (experimental, tied to Next.js) | Google Analytics | Official Next.js package. `<GoogleAnalytics gaId="G-XYZ" />` in root layout. Deferred script loading after hydration. Use over manual gtag.js script injection. |
| server-only | latest | Prevent server code leaking to client | Import in any server-only module. Next.js provides clearer build-time errors. Optional but recommended for content-layer files. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev bundler (replaces webpack) | Stable in Next.js 16, default for `next dev`. File system caching in 16.1 makes cold starts fast. No separate config needed. |
| PM2 | Process manager for VPS | Run two instances: production (`next start`) on port 3000, dev server (`next dev`) on port 3001. Use ecosystem.config.js for both. nginx proxies accordingly. |
| nginx | Reverse proxy | Required in front of Next.js for streaming (set `X-Accel-Buffering: no`), port routing, and SSL termination. One vhost per instance or path-based split. |
| ESLint | Linting | `next lint` runs the built-in Next.js ESLint config. Catches common App Router mistakes. |
| `@next/bundle-analyzer` | Bundle inspection | Experimental in Next.js 16.1. Enable via `ANALYZE=true next build`. Use when optimizing client JS size. |

---

## Installation

```bash
# Bootstrap
npx create-next-app@latest yapu2 --typescript --eslint --app --turbopack

# Tailwind v4 for Next.js (PostCSS plugin, not Vite plugin)
npm install tailwindcss @tailwindcss/postcss postcss

# shadcn/ui init (interactive — choose tailwind v4 when prompted)
npx shadcn@latest init

# i18n
npm install next-intl

# Icons (already added by shadcn, explicit pin)
npm install lucide-react

# Carousel (shadcn Carousel component uses this)
npm install embla-carousel-react

# Forms + validation
npm install react-hook-form zod

# Analytics
npm install @next/third-parties

# Cookie consent (vanilla JS, no npm install needed for basic use, but published)
npm install vanilla-cookieconsent

# Dev safety utility
npm install server-only
```

```bash
# postcss.config.mjs
# (create this file — Next.js does not auto-create it for v4)
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| next-intl v4 | next-international, Lingui | Never for this project — next-intl is the de facto standard for Next.js App Router i18n, has the best Server Component support, and is the only library with typed locales |
| vanilla-cookieconsent | react-cookie-consent, Osano | react-cookie-consent is simpler but has fewer GDPR features. Use only if you want a one-liner consent bar with no preference modal |
| @next/third-parties | Manual gtag.js script | Manual gtag gives more control but requires a Client Component wrapper. `@next/third-parties` is the Vercel-recommended approach for App Router |
| embla-carousel-react | Swiper, react-slick, keen-slider | Swiper is heavier. react-slick is jQuery-era. keen-slider is lighter but has less ecosystem. embla is shadcn's choice and plays well with Server Components |
| react-hook-form | Native Server Actions only | For simple one-field newsletter form, native `useActionState` + Zod without react-hook-form is sufficient and preferred. Use react-hook-form only if forms get complex. |
| Zod v4 | Zod v3 | Zod v3 is in maintenance. v4 is stable, dramatically faster, smaller. No reason to use v3 in a greenfield project |
| shadcn/ui | Radix Themes, Chakra UI, MUI | shadcn is Tailwind-native and copies source code into your repo — Ember can edit those component files directly. This is a core requirement. Other libraries are black-box npm packages |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Pages Router | Maintenance mode. No RSC, no Server Actions, no layout colocation. Ember editing tier 2 (code editing) assumes App Router conventions | App Router only |
| `@tailwindcss/vite` | Wrong plugin for Next.js. Next.js uses PostCSS, not Vite. Using the Vite plugin causes silent failures | `@tailwindcss/postcss` |
| `tailwind.config.js` | v4 does not use a config file. All theming is in CSS via `@theme`. Trying to use a JS config will do nothing | CSS `@theme inline { }` in globals.css |
| embla-carousel v9 RC | Still in release candidate. Has breaking changes vs v8 | embla-carousel-react@8.x |
| react-i18next / i18next | Not designed for Next.js App Router. Server/Client component split is awkward. No native routing | next-intl |
| next-themes | Unnecessary for this project — YAPU uses a fixed color scheme, no dark mode requirement. Adds bundle and complexity for no benefit | Hardcode the YAPU theme in CSS |
| WordPress/Cornerstone APIs | This is a full rebuild — no YAPU WordPress backend integration | JSON files in `/content/` served by SSR |
| `@prisma/client`, any DB | No database needed. Content lives in JSON files, editable by Ember directly | Plain TypeScript/JSON content layer |
| Vercel-specific features | Project deploys to Hostinger VPS. ISR edge caching, Edge Functions, and Vercel Analytics won't work | `next start` on Node.js, PM2, nginx |

---

## Stack Patterns by Variant

**For Tier 1 editing (content-only, SSR):**
- Content lives in `content/[locale]/[page].json` files
- Next.js Server Components read JSON at request time (no caching for these routes)
- Ember edits JSON files on the server → next request serves updated content
- No rebuild needed, no HMR needed
- Use `force-dynamic` route segment config or avoid `fetch` caching on content reads

**For Tier 2 editing (code/design, HMR):**
- `next dev --turbopack` runs on port 3001
- Ember edits `.tsx`, `.css` component files → Turbopack HMR updates the preview
- Production instance on port 3000 is unaffected during editing
- After editing session ends: `git commit` + PM2 restart on production instance
- Do NOT run `next dev` as the production server

**For the two-instance PM2 setup:**
```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'yapu-prod',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: '/var/www/yapu2',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'yapu-dev',
      script: 'node_modules/.bin/next',
      args: 'dev --turbopack -p 3001',
      cwd: '/var/www/yapu2',
      env: { NODE_ENV: 'development' },
    },
  ],
}
```

**For next-intl three-language routing (EN/FR/ES):**
```ts
// src/i18n/routing.ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fr', 'es'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // /en/... omitted, /fr/... and /es/... shown
})
```

**For Google Analytics (GDPR: only fire after consent):**
- Initialize CookieConsent first (Client Component, `useEffect`)
- Conditionally render `<GoogleAnalytics />` from `@next/third-parties` only after analytics category accepted
- GTM approach is cleaner if multiple tracking scripts are anticipated

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| next@16.1 | react@19.2, react-dom@19.2 | React 19 is required for Next.js 16 |
| next-intl@4.8.3 | next@^16, react@^19, TypeScript@^5 | ESM-only. CommonJS not supported (except plugin) |
| tailwindcss@4.1 + @tailwindcss/postcss | next@16, postcss@8 | PostCSS 8 is bundled with Next.js — no separate install needed |
| shadcn/ui (latest) | tailwind@4, react@19, next@16 | shadcn explicitly supports Tailwind v4 upgrade path. Requires removing `forwardRef` wrappers — new components use `data-slot` |
| embla-carousel-react@8.6.0 | react@^16 \|\| ^17 \|\| ^18 \|\| ^19 | React 19 added to peer deps in v8.3.1 |
| zod@4.x | TypeScript@5+ | v4 requires modern TypeScript for inference improvements |
| @next/third-parties@latest | next@latest | Always install paired with `next@latest` — they track the same version |
| vanilla-cookieconsent@3.1.0 | Any framework (vanilla JS) | No React peer dependency. Wrap in a Client Component `useEffect` |

---

## Content Layer Pattern (no CMS needed)

This project uses JSON files as its content layer, edited directly by Ember. The pattern:

```
content/
  en/
    home.json
    investor-services.json
    data-insights.json
    ...
  fr/
    home.json
    ...
  es/
    home.json
    ...
```

Server Components import JSON directly:
```ts
// In a Server Component
import content from '@/content/en/home.json'
```

For Tier 1 (SSR on demand), disable caching on these reads:
```ts
// page.tsx
export const dynamic = 'force-dynamic'
```

For Tier 2 (dev server), Turbopack HMR picks up JSON changes automatically in development.

This approach is simpler than any CMS, fully Git-versionable, and directly editable by Ember via filesystem writes.

---

## Sources

- https://nextjs.org/blog — Next.js 16.1 (Dec 18, 2025) confirmed latest stable. Next.js 16 (Oct 21, 2025) confirmed Turbopack stable + React Compiler stable. (HIGH confidence — official blog)
- https://nextjs.org/docs/app — version field `16.1.6`, lastUpdated `2026-02-24` confirmed in multiple doc pages. (HIGH confidence — official docs)
- https://react.dev/versions — React 19.2 confirmed stable, React 19.0.0 released Dec 5, 2024. (HIGH confidence — official React site)
- https://github.com/amannn/next-intl/releases — next-intl v4.8.3 released Feb 16, 2026. (HIGH confidence — GitHub releases)
- https://next-intl.dev/docs/routing/setup — defineRouting API and middleware setup confirmed for v4. (HIGH confidence — official docs)
- https://next-intl.dev/blog/next-intl-4-0 — v4 breaking changes confirmed: ESM-only, TypeScript 5+, AppConfig type, `hasLocale`. (HIGH confidence — official blog)
- https://tailwindcss.com/blog — v4.0 released Jan 22 2025, v4.1 released Apr 3 2025. @tailwindcss/postcss confirmed for Next.js. (HIGH confidence — official blog)
- https://tailwindcss.com/docs/installation/framework-guides/nextjs — PostCSS plugin confirmed for Next.js. (HIGH confidence — official docs)
- https://ui.shadcn.com/docs/tailwind-v4 — shadcn Tailwind v4 upgrade path confirmed. forwardRef → data-slot migration documented. (HIGH confidence — official docs)
- https://ui.shadcn.com/docs/installation/next — `npx shadcn@latest init` confirmed current init command. (HIGH confidence — official docs)
- https://www.radix-ui.com/primitives/docs/overview/releases — Full React 19 + RSC compatibility confirmed Jun 19, 2024. `radix-ui` unified package released Jan 22, 2025. (HIGH confidence — official changelog)
- https://github.com/lucide-icons/lucide/releases — lucide-react v0.575.0 confirmed latest (Feb 19, 2026). (HIGH confidence — GitHub releases)
- https://github.com/davidjerleke/embla-carousel/releases — embla-carousel v8.6.0 confirmed latest stable. v9 still RC. React 19 in peer deps since v8.3.1. (HIGH confidence — GitHub releases)
- https://github.com/react-hook-form/react-hook-form/releases — react-hook-form v7.71.2 confirmed latest (Feb 20, 2026). (HIGH confidence — GitHub releases)
- https://zod.dev/v4 — Zod 4 confirmed stable. 6.5x faster object parsing, 57% smaller bundle. v3 in maintenance. (HIGH confidence — official site)
- https://github.com/orestbida/cookieconsent/releases — vanilla-cookieconsent v3.1.0 released Feb 4, 2025. (HIGH confidence — GitHub releases)
- https://nextjs.org/docs/app/guides/third-party-libraries — `@next/third-parties` GoogleAnalytics/GoogleTagManager confirmed for App Router. (HIGH confidence — official docs)
- https://nextjs.org/docs/app/guides/self-hosting — nginx X-Accel-Buffering for streaming confirmed, PM2 ecosystem pattern documented. (HIGH confidence — official docs)
- https://nextjs.org/docs/app/guides/forms — Server Actions + Zod + useActionState pattern confirmed as recommended form approach. (HIGH confidence — official docs)

---

*Stack research for: chatbot-editable multilingual corporate website (YAPU Solutions rebuild)*
*Researched: 2026-02-26*
