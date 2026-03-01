# Phase 1: Foundation - Research

**Researched:** 2026-02-26
**Domain:** Next.js 16 scaffold + Tailwind v4 design tokens + next-intl i18n routing + typed JSON content layer
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **Design tokens & theming:** Faithful 1:1 color mapping from yapu.solutions. Dark Teal (#1E5A64) = brand/nav/headers, Mint (#45B5B4) = hover states/accents, Orange-Red (#FF2A13) = CTA buttons/emphasis. Colors implemented as Tailwind v4 OKLCH CSS custom properties in globals.css. Dark mode included as a bonus demo feature.
- **Font:** Free Google Font alternative to Museo Sans Rounded (rounded, friendly sans-serif) — no licensing concerns.
- **Locale strategy:** Three locales: EN (default/fallback), FR, ES. Root URL auto-detects browser language via Accept-Language header, redirects to /en/, /fr/, or /es/. Cookie-based locale persistence. Language switcher shows native names: English, Francais, Espanol. Full hreflang SEO setup. Locale-aware date and number formatting.
- **Content JSON structure:** One JSON file per page (e.g., content/data/en/homepage.json). Nested by section: `{ "hero": { "title": "..." }, "services": { ... } }`. Shared folder (content/data/shared/) for reusable data. EN fallback when content key missing in FR or ES.
- **Placeholder pages:** All 7 pages get placeholder routes in all 3 locales (21 routes total). Design token preview style: show YAPU color palette, typography samples, styled elements. Basic navigation bar linking all 7 pages + language switcher (not the full Phase 3 mega-menu). Interactive light/dark theme toggle from day one.

### Claude's Discretion

- Dark mode color palette adjustments (maintain contrast ratios and brand recognition)
- Specific free font choice (best visual match for Museo's rounded style)
- Language switcher URL behavior (standard next-intl approach)
- Exact spacing, border radius, and shadow tokens
- TypeScript type generation approach for content JSON

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FOUND-01 | Project scaffolded with Next.js 16, Tailwind v4 (OKLCH), shadcn/ui, TypeScript | create-next-app@latest + shadcn init pattern documented; Next.js 16 stable since 2025-10-21 |
| FOUND-02 | YAPU color palette defined as CSS custom properties (Dark Teal #1E5A64, Mint #45B5B4, Orange-Red #FF2A13) | Tailwind v4 @theme directive with OKLCH values; computed values documented in Code Examples |
| FOUND-03 | next-intl routing configured for EN/FR/ES with locale prefix | next-intl v4 defineRouting + proxy.ts (Next.js 16 naming) + generateStaticParams pattern documented |
| FOUND-04 | Content JSON directory structure (content/data/{locale}/*.json) with typed readContent() helper | fs.readFileSync + TypeScript generics pattern; EN fallback logic straightforward |
| FOUND-05 | next-intl TypeScript type augmentation set up for compile-time translation key checking | AppConfig interface augmentation + createMessagesDeclaration plugin option documented |
| VIS-05 | System fonts approximate Museo Sans Rounded feel | Nunito or Nunito Sans via Google Fonts identified as closest match |
</phase_requirements>

---

## Summary

Phase 1 sets up a greenfield Next.js 16 project with four integrated systems: the Next.js App Router scaffold, the YAPU design token layer (Tailwind v4 OKLCH), the next-intl i18n routing for EN/FR/ES, and a typed JSON content loading layer. The project directory is currently empty (only `.git`, `.claude`, `.planning` present) — the entire scaffold must be created from scratch.

Next.js 16 (stable since 2025-10-21) introduces one critical naming change: `middleware.ts` is renamed to `proxy.ts`. The exported function is also renamed from `middleware` to `proxy`. next-intl v4 is aware of this change and its documentation references `proxy.ts`. Any tutorial or guide using `middleware.ts` for next-intl with Next.js 16 is using the deprecated form (still works but flagged as deprecated).

Tailwind v4 uses a CSS-first configuration model. There is no `tailwind.config.js` — all custom tokens live in `globals.css` via the `@theme` directive. shadcn/ui has fully adopted Tailwind v4: its CLI now outputs OKLCH colors and uses `@theme inline` for semantic color aliases. The YAPU brand colors in OKLCH are: Dark Teal `oklch(43.38% 0.0624 210.55)`, Mint `oklch(71.01% 0.1000 194.34)`, Orange-Red `oklch(64.15% 0.2447 30.41)`.

**Primary recommendation:** Scaffold with `create-next-app@latest`, run `npx shadcn@latest init`, configure next-intl with `proxy.ts` and `defineRouting`, then layer in YAPU tokens and the typed content helper. Build in this exact order to avoid configuration conflicts.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.x (latest) | App Router framework | Project requirement, stable since 2025-10-21 |
| react / react-dom | 19.2 | UI runtime (bundled with Next.js 16) | Ships with Next.js 16 |
| typescript | 5.x | Type safety | Project requirement; Next.js 16 requires TS 5.1+ |
| tailwindcss | 4.x | Utility CSS | Project requirement; CSS-first, no config file |
| @tailwindcss/postcss | 4.x | PostCSS integration for Tailwind v4 | Required by Tailwind v4 |
| next-intl | 4.x | i18n routing + translations | Project requirement; v4 is current major with Next.js 16 support |
| shadcn/ui (CLI) | latest | Component scaffolding | Project requirement; v4-compatible |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | latest | Light/dark toggle | Required per CONTEXT.md; wraps next-intl provider |
| lucide-react | latest | Icons | Project requirement (Navigation, theme toggle) |
| clsx | latest | Class merging | Ships with shadcn/ui setup via lib/utils.ts |
| tailwind-merge | latest | Tailwind class conflict resolution | Ships with shadcn/ui setup via lib/utils.ts |
| tw-animate-css | latest | CSS animations (replaces tailwindcss-animate) | shadcn/ui Tailwind v4 default; imported in globals.css |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Nunito / Nunito Sans | Poppins, Raleway, Mulish | Nunito has the most literal rounded terminals matching Museo's feel; Raleway is more geometric |
| next-intl v4 | next-i18next | next-intl is App Router native; next-i18next targets Pages Router |
| JSON files for content | MDX, Markdown | JSON required by project spec for chatbot-editing compatibility in later phases |

**Installation (new project from scratch):**
```bash
npx create-next-app@latest yapu2 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd yapu2
npx shadcn@latest init
npm install next-intl next-themes lucide-react
```

Note: `create-next-app@latest` in 2026 defaults to Tailwind v4 for new projects. Verify the version installed — if Tailwind v3 is installed, upgrade:
```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

---

## Architecture Patterns

### Recommended Project Structure

```
app/
  globals.css              -- Tailwind v4 imports, @theme inline, :root/.dark, shadcn tokens
  layout.tsx               -- Root layout (globals.css import only, no locale logic)
  [locale]/
    layout.tsx             -- Locale layout: validateLocale, setRequestLocale, NextIntlClientProvider, ThemeProvider, nav, footer
    page.tsx               -- Homepage placeholder
    about/page.tsx         -- About placeholder
    investor-services/page.tsx
    data-insights/page.tsx
    digital-tools/page.tsx
    impact/page.tsx
    news/page.tsx

components/
  Navigation.tsx           -- Basic nav bar (Phase 1 version: links + language switcher + theme toggle)
  ThemeProvider.tsx        -- next-themes wrapper ("use client")
  ui/                      -- shadcn/ui components (button, card, etc.)

content/
  data/
    en/
      homepage.json
      about.json
      investor-services.json
      data-insights.json
      digital-tools.json
      impact.json
      news.json
    fr/
      (same files)
    es/
      (same files)
    shared/
      company.json         -- addresses, social links (locale-independent)

messages/
  en.json                  -- next-intl UI strings (Navigation labels, placeholders)
  fr.json
  es.json

i18n/
  routing.ts               -- defineRouting({locales: ['en','fr','es'], defaultLocale: 'en'})
  navigation.ts            -- createNavigation(routing)
  request.ts               -- getRequestConfig with hasLocale guard

lib/
  content.ts               -- readContent<T>(page, locale) + readSharedContent<T>(file)
  utils.ts                 -- cn() helper (clsx + tailwind-merge)

proxy.ts                   -- next-intl createMiddleware(routing) [NOT middleware.ts in Next.js 16]
next.config.ts             -- createNextIntlPlugin wrapper
tsconfig.json              -- allowArbitraryExtensions: true (for .d.json.ts)
global.d.ts                -- AppConfig augmentation for next-intl type safety
```

### Pattern 1: next-intl Routing Setup (Next.js 16)

**What:** Configure i18n routing with locale detection, cookie persistence, and static generation.

**Critical gotcha:** In Next.js 16, the file is `proxy.ts` (not `middleware.ts`). The exported function must be named `proxy` (not `middleware`). Using `middleware.ts` still works (deprecated) but triggers a warning.

```typescript
// i18n/routing.ts
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'es'],
  defaultLocale: 'en'
  // localeCookie is enabled by default (NEXT_LOCALE cookie)
  // localeDetection is enabled by default (Accept-Language header)
});
```

```typescript
// proxy.ts  <-- NOT middleware.ts in Next.js 16
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

```typescript
// i18n/request.ts
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  return {locale};
});
```

```typescript
// i18n/navigation.ts
import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
```

```typescript
// next.config.ts
import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json'
  }
});
export default withNextIntl(nextConfig);
```

### Pattern 2: Static Rendering with Locales

**What:** `generateStaticParams` + `setRequestLocale` to keep all routes statically generated at build time.

**Critical gotcha:** `setRequestLocale(locale)` MUST be called at the top of every layout and page before any next-intl API calls. Without it, Next.js falls back to dynamic rendering (uses `headers()`).

```typescript
// app/[locale]/layout.tsx
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;  // params is async in Next.js 16
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Pattern 3: Tailwind v4 OKLCH Design Token Layer

**What:** Define YAPU brand colors in `globals.css` using `@theme` and `@theme inline`.

**Two-layer approach:**
1. `:root` / `.dark` define raw CSS custom properties (the actual OKLCH values)
2. `@theme inline` maps those properties to Tailwind utility names

```css
/* app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

/* Layer 1: Tailwind theme namespace */
@theme inline {
  /* YAPU brand tokens */
  --color-brand:   var(--yapu-teal);
  --color-accent:  var(--yapu-mint);
  --color-cta:     var(--yapu-orange);

  /* shadcn/ui semantic tokens (reference :root vars below) */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary:    var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  /* ... additional shadcn tokens ... */

  /* Font */
  --font-sans: var(--font-nunito);
}

/* Layer 2: Light mode values */
:root {
  /* YAPU palette */
  --yapu-teal:   oklch(43.38% 0.0624 210.55);  /* #1E5A64 Dark Teal */
  --yapu-mint:   oklch(71.01% 0.1000 194.34);  /* #45B5B4 Mint */
  --yapu-orange: oklch(64.15% 0.2447 30.41);   /* #FF2A13 Orange-Red */

  /* shadcn/ui semantic layer */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary:    oklch(43.38% 0.0624 210.55);   /* = Dark Teal */
  --primary-foreground: oklch(0.985 0 0);
  /* ... */
}

/* Layer 3: Dark mode overrides */
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary:    oklch(71.01% 0.1000 194.34);   /* Mint in dark mode */
  --primary-foreground: oklch(0.145 0 0);
  /* ... */
}
```

Usage: `bg-brand`, `text-accent`, `bg-cta` become valid Tailwind utilities.

### Pattern 4: Typed Content Helper

**What:** `readContent<T>()` loads locale-specific JSON with TypeScript types and EN fallback.

```typescript
// lib/content.ts
import fs from 'fs';
import path from 'path';

const contentDir = path.join(process.cwd(), 'content', 'data');

export function readContent<T>(page: string, locale: string): T {
  // Try requested locale first, fall back to EN
  const localePath = path.join(contentDir, locale, `${page}.json`);
  const fallbackPath = path.join(contentDir, 'en', `${page}.json`);
  const filePath = fs.existsSync(localePath) ? localePath : fallbackPath;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function readSharedContent<T>(file: string): T {
  const filePath = path.join(contentDir, 'shared', `${file}.json`);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}
```

Inline type usage in pages (no separate type file needed for Phase 1):
```typescript
// app/[locale]/page.tsx
interface HomepageContent {
  hero: { title: string; subtitle: string; ctaText: string; ctaHref: string };
}

const content = readContent<HomepageContent>('homepage', locale);
```

### Pattern 5: next-intl TypeScript Type Augmentation

**What:** Declare `AppConfig` to enable compile-time translation key checking.

```typescript
// global.d.ts (at project root)
import {routing} from '@/i18n/routing';
import messages from './messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];  // 'en' | 'fr' | 'es'
    Messages: typeof messages;
  }
}
```

```json
// tsconfig.json — add to compilerOptions
{
  "compilerOptions": {
    "allowArbitraryExtensions": true
  }
}
```

The `createMessagesDeclaration` option in `next.config.ts` auto-generates a `.d.json.ts` file for the messages, enabling argument-level type checking in addition to key checking.

After this setup: `t('nonExistent.key')` fails at compile time. `t('navigation.home')` autocompletes.

### Anti-Patterns to Avoid

- **Using `middleware.ts` in Next.js 16:** Rename to `proxy.ts` and export `proxy` function. `middleware.ts` is deprecated and will be removed.
- **Forgetting `setRequestLocale(locale)` in layouts/pages:** Without it, static generation breaks and pages render dynamically — all 21 routes will fail to SSG.
- **Forgetting `await params` in Next.js 16:** `params` is now a `Promise` in Next.js 16. `const {locale} = params` (sync) is a removed behavior — use `await params`.
- **Using `@theme {}` for YAPU tokens that reference other vars:** Use `@theme inline {}` when referencing CSS custom properties defined in `:root`, otherwise the `var()` resolves in wrong scope.
- **Putting shadcn CSS vars inside `@layer base`:** shadcn/ui Tailwind v4 moves `:root` and `.dark` out of `@layer base` — they go directly in the file.
- **Using `tailwindcss-animate`:** Deprecated in shadcn/ui Tailwind v4. Use `tw-animate-css` imported via `@import "tw-animate-css"`.
- **Hardcoding locale in metadata:** Always pass `locale` explicitly to `getTranslations({locale, namespace})` in `generateMetadata` — the locale param is required for static metadata generation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Locale detection + cookie persistence | Custom Accept-Language parser + cookie logic | next-intl createMiddleware | Edge cases: q-value parsing, cookie security attributes, redirect loops |
| i18n-aware Link component | Custom wrapper around next/link | `Link` from `@/i18n/navigation` (createNavigation) | Automatic locale prefix injection, avoids broken links when defaultLocale changes |
| Dark mode SSR hydration | Manual class toggling on `<html>` | next-themes | Handles flash-of-unstyled-content, SSR mismatch, system preference detection |
| TypeScript-safe translation access | Manual key lookup in JSON | next-intl AppConfig augmentation | Compile-time key validation, argument type safety, zero runtime cost |
| Tailwind class merging | String concatenation | `cn()` from `lib/utils.ts` (clsx + tailwind-merge) | Conflicting class resolution (e.g., `p-4` + `p-2` → `p-2`) |

---

## Common Pitfalls

### Pitfall 1: middleware.ts vs proxy.ts in Next.js 16

**What goes wrong:** Tutorials show `middleware.ts` for next-intl. In Next.js 16, this file is deprecated. The project compiles but logs deprecation warnings and middleware behavior may change.
**Why it happens:** Next.js 16 renamed the file to clarify "network boundary" semantics. The rename was announced at release (2025-10-21).
**How to avoid:** Create `proxy.ts` at project root, export `createMiddleware(routing)` as default, export as `proxy` (not `middleware`).
**Warning signs:** Console warning: "middleware.ts is deprecated, rename to proxy.ts"

### Pitfall 2: Async params in Next.js 16

**What goes wrong:** `const {locale} = params` in a layout or page throws a type error and may produce wrong locale at runtime.
**Why it happens:** Next.js 16 made `params` and `searchParams` async (Promise-based) as a breaking change from 15.
**How to avoid:** Always `const {locale} = await params;` in all layouts and pages.
**Warning signs:** TypeScript error "Property 'locale' does not exist on type 'Promise<...>'"

### Pitfall 3: Static Rendering Breaks Without setRequestLocale

**What goes wrong:** All 21 placeholder routes render dynamically instead of statically. `next build` shows `ƒ` (dynamic) instead of `○` (static) for every locale route.
**Why it happens:** next-intl reads locale from request headers by default. `setRequestLocale()` overrides this to use the static locale param instead.
**How to avoid:** Call `setRequestLocale(locale)` at the top of EVERY layout and page in `app/[locale]/`.
**Warning signs:** `next build` output shows all routes as dynamic; `next start` is slower than expected.

### Pitfall 4: Tailwind v4 @theme vs @theme inline Confusion

**What goes wrong:** Colors defined as `@theme { --color-primary: var(--yapu-teal); }` without `inline` may not resolve correctly when `--yapu-teal` is defined on `:root`.
**Why it happens:** Without `inline`, Tailwind embeds the CSS variable reference `var(--yapu-teal)` into the utility class, which resolves correctly at runtime. The `inline` keyword instead inlines the current VALUE of the referenced variable at theme-build time. For dynamic (runtime-switchable) themes like light/dark, you generally WANT the `var()` reference to stay, so use `@theme inline` only when the referenced variable is always defined in the same scope.
**How to avoid:** For YAPU's two-layer approach (`:root` vars + `@theme inline`), use `@theme inline` to map `:root` vars to Tailwind utilities. The runtime CSS variable lookup is what enables dark mode switching.
**Warning signs:** Colors don't change when toggling dark mode.

### Pitfall 5: shadcn/ui Component Installation Flag with React 19

**What goes wrong:** `npx shadcn@latest add button` fails with peer dependency errors when using npm.
**Why it happens:** Some shadcn/ui component dependencies have peer deps that don't yet declare React 19 support.
**How to avoid:** Use `npx shadcn@latest add button --legacy-peer-deps` with npm, or switch to pnpm/bun which handle peer deps more gracefully.
**Warning signs:** npm ERR! `ERESOLVE unable to resolve dependency tree`

### Pitfall 6: next-intl TypeScript Types Not Activating

**What goes wrong:** `t('nonExistent')` does not produce a TypeScript error even after adding `global.d.ts`.
**Why it happens:** `tsconfig.json` must include `"allowArbitraryExtensions": true` for the auto-generated `.d.json.ts` file to be picked up. Also, `createMessagesDeclaration` in `next.config.ts` must point to the correct messages file.
**How to avoid:** Verify `tsconfig.json` has `allowArbitraryExtensions: true`. Restart the TypeScript server after making changes. Confirm the `.d.json.ts` file is generated in the `messages/` directory after `next dev`.
**Warning signs:** No TypeScript errors on unknown keys; no autocomplete for translation keys.

---

## Code Examples

Verified patterns from official sources:

### Complete proxy.ts for next-intl (Next.js 16)

```typescript
// proxy.ts  (source: next-intl.dev/docs/routing/middleware)
import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
```

### defineRouting with all YAPU locales

```typescript
// i18n/routing.ts  (source: next-intl.dev/docs/routing/setup)
import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'es'],
  defaultLocale: 'en',
  // Cookie-based persistence is ON by default (NEXT_LOCALE cookie, session-scoped)
  // To make it persistent across sessions:
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365  // 1 year
  }
});
```

### Locale layout with static rendering

```typescript
// app/[locale]/layout.tsx
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale, getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {ThemeProvider} from '@/components/ThemeProvider';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Hreflang metadata for SEO (next-intl approach)

```typescript
// app/[locale]/page.tsx (generateMetadata)
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {getPathname} from '@/i18n/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Metadata'});
  const baseUrl = 'https://yapu.solutions';  // replace with actual domain in later phases

  const languages = Object.fromEntries(
    routing.locales.map((l) => [l, `${baseUrl}/${l}`])
  );

  return {
    title: t('title'),
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages,
    },
  };
}
```

### OKLCH color values for YAPU palette (computed)

```css
/* Verified by OKLCH conversion formula (sRGB → XYZ D65 → OKLab → OKLCH) */
/* Dark Teal  #1E5A64 → */ oklch(43.38% 0.0624 210.55)
/* Mint       #45B5B4 → */ oklch(71.01% 0.1000 194.34)
/* Orange-Red #FF2A13 → */ oklch(64.15% 0.2447 30.41)
```

### Font recommendation for VIS-05

Nunito (or Nunito Sans) is the closest free Google Font match for Museo Sans Rounded:
- Rounded terminals on lowercase letters (key characteristic of Museo)
- Available in weights 200–900 (Museo offers similar range)
- Multiple sources confirm it as the top recommendation for Museo alternatives

```typescript
// app/[locale]/layout.tsx — Google Fonts via next/font
import {Nunito} from 'next/font/google';

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

// Apply: <html className={nunito.variable}>
```

Then in globals.css:
```css
@theme inline {
  --font-sans: var(--font-nunito);
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` | `proxy.ts` (Next.js 16 App Router) | Next.js 16 (2025-10-21) | All next-intl tutorials using `middleware.ts` are outdated for Next.js 16 |
| `tailwind.config.js` | `globals.css` via `@theme {}` | Tailwind v4 (2025) | No config file; all tokens in CSS |
| HSL colors in shadcn/ui | OKLCH colors | shadcn/ui Tailwind v4 update (2025) | Better color accuracy; dark mode colors also updated March 2025 |
| `tailwindcss-animate` | `tw-animate-css` | shadcn/ui Tailwind v4 (2025) | Old package deprecated; new one imported via `@import` |
| Sync `params` access | `await params` | Next.js 16 | Breaking change — all layouts/pages must use `await params` |
| `experimental.turbopack` | `turbopack` (top-level) | Next.js 16 | Config location changed |
| `next lint` command | Use ESLint/Biome directly | Next.js 16 | `next build` no longer runs linting |

**Deprecated/outdated:**
- `middleware.ts`: Deprecated in Next.js 16, will be removed in a future version. Use `proxy.ts`.
- `tailwindcss-animate`: Replaced by `tw-animate-css` in shadcn/ui Tailwind v4.
- HSL in shadcn/ui CSS vars: Converted to OKLCH in the Tailwind v4 migration.

---

## Open Questions

1. **Exact Tailwind v4 version installed by `create-next-app@latest`**
   - What we know: Next.js 16 supports Tailwind v4; `create-next-app` defaults have been updated
   - What's unclear: Whether `create-next-app@latest` in Feb 2026 installs Tailwind v4 or v3 by default
   - Recommendation: After scaffolding, check `package.json` and upgrade to `tailwindcss@next @tailwindcss/postcss@next` if v3 is installed

2. **shadcn/ui version compatibility with Next.js 16 + Tailwind v4**
   - What we know: shadcn/ui has Tailwind v4 support; `npx shadcn@latest init` should detect v4
   - What's unclear: Whether the `--legacy-peer-deps` flag is needed with npm on this exact combo
   - Recommendation: Use pnpm or bun to avoid peer dependency issues during component installation

3. **OKLCH value precision for YAPU colors**
   - What we know: Computed values via standard OKLCH formula (L: 43.38% 0.0624 210.55, etc.)
   - What's unclear: Whether there's slight rounding difference vs browser rendering of the original hex
   - Recommendation: Values are mathematically correct; visually verify against original `#1E5A64` in browser and adjust if any perceived difference exists

---

## Sources

### Primary (HIGH confidence)

- [next-intl.dev/docs/getting-started/app-router/with-i18n-routing](https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing) — proxy.ts setup, routing.ts, request.ts, generateStaticParams, setRequestLocale
- [next-intl.dev/docs/routing/middleware](https://next-intl.dev/docs/routing/middleware) — createMiddleware, cookie persistence, Accept-Language detection
- [next-intl.dev/docs/routing/configuration](https://next-intl.dev/docs/routing/configuration) — localeCookie, localeDetection, localePrefix options
- [next-intl.dev/docs/workflows/typescript](https://next-intl.dev/docs/workflows/typescript) — AppConfig augmentation, createMessagesDeclaration, allowArbitraryExtensions
- [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16) — Breaking changes (async params, proxy.ts, separate dev/build dirs), Turbopack default, Node.js 20.9+ requirement
- [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) — @theme inline pattern for CSS variable references
- [tailwindcss.com/docs/colors](https://tailwindcss.com/docs/colors) — Custom OKLCH color definition with @theme directive
- [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4) — OKLCH migration, @theme inline, tw-animate-css, data-slot attributes
- OKLCH conversion: computed via standard sRGB→XYZ D65→OKLab→OKLCH formula (Node.js verification)

### Secondary (MEDIUM confidence)

- [next-intl.dev/docs/getting-started/app-router](https://next-intl.dev/docs/getting-started/app-router) — createNextIntlPlugin setup in next.config.ts
- WebSearch: Nunito as top Google Fonts alternative to Museo Sans Rounded — corroborated by multiple community sources (similarfont.io, typewolf.com, maxibestof.one)
- WebSearch: `create-next-app@latest` installs App Router + Tailwind by default — consistent across multiple sources

### Tertiary (LOW confidence)

- Next.js 16 `isolatedDevBuild` feature (separate `.next/dev` directory for concurrent dev+build) — from community blog post, not verified against official docs; relevant for Phase 2 only

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js 16 stable, all versions confirmed from official release notes and documentation
- Architecture: HIGH — Patterns sourced directly from official next-intl docs and Next.js 16 blog
- Pitfalls: HIGH — Breaking changes documented in official Next.js 16 release notes; next-intl static rendering requirement from official docs
- OKLCH values: MEDIUM — Computed via verified mathematical formula; not cross-checked against an online tool interactively

**Research date:** 2026-02-26
**Valid until:** 2026-05-26 (stable stack — 90 days; next-intl and Next.js minor updates may add APIs but breaking changes unlikely before Next.js 17)
