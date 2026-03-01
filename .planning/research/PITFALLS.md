# Pitfalls Research

**Domain:** Chatbot-editable corporate website rebuild (WordPress → Next.js 16, multilingual, two-instance architecture)
**Researched:** 2026-02-26
**Confidence:** MEDIUM-HIGH — Core framework pitfalls verified against official Next.js 16 and next-intl docs (current as of 2026-02-24). Chatbot-editing and two-instance architecture patterns are novel — those sections rely on first-principles reasoning from official docs.

---

## Critical Pitfalls

### Pitfall 1: Next.js Caching Silently Serves Stale Content After JSON Edits

**What goes wrong:**
Ember edits a content JSON file. The file on disk changes. But the page served to visitors still shows the old content — because Next.js has cached the Full Route Cache (static HTML + RSC payload) from the last build. The page does not re-render until the cache is explicitly invalidated via `revalidatePath` / `revalidateTag`, or until the next deployment.

**Why it happens:**
Next.js App Router has four distinct caching layers (Request Memoization, Data Cache, Full Route Cache, Router Cache). Developers assume "SSR = reads from disk on each request." But statically-rendered routes are cached persistently across all requests and deployments. A JSON file read at build time stays in the Full Route Cache until invalidated. Dynamic rendering (`force-dynamic`) forces a re-render on every request but adds latency.

**How to avoid:**
For Tier 1 (content editing), design the content-loading pipeline to use `revalidatePath` or `revalidateTag` as part of the Ember edit workflow. When Ember writes a JSON file, it must also call a Next.js Route Handler (or Server Action) that triggers cache invalidation for the affected pages. Alternatively, use `export const dynamic = 'force-dynamic'` on content-heavy pages to guarantee fresh reads — acceptable for a low-traffic sales demo, but understand the tradeoff (no static caching).

**Warning signs:**
- JSON file updated on disk, but refreshing the live URL shows old content
- `next build` was not run after a content change
- No `revalidatePath` / `revalidateTag` call in the Ember write flow
- Production server (`next start`) is running, not dev server

**Phase to address:** Phase delivering Tier 1 content editing. Must be designed into the Ember → JSON → revalidation pipeline from the start, not retrofitted.

---

### Pitfall 2: Two-Instance Port and Process Conflicts on the VPS

**What goes wrong:**
Running both a dev server (`next dev`, port 3001) and a production server (`next start`, port 3000) on the same VPS under PM2. They share the same codebase directory. When Ember modifies code files for Tier 2 editing, the dev server picks up changes via HMR — but so does the build process when triggered. Concurrent writes, competing file watchers, and PM2 restart loops create corrupt builds or both processes fighting over the same `.next/` output directory.

**Why it happens:**
`next dev` and `next build` / `next start` write to the same `.next/` directory by default. There is no built-in separation. Running `next build` while `next dev` is active on the same directory is undefined behavior. PM2 also restarts processes on file changes unless configured otherwise.

**How to avoid:**
Use separate working directories for the two instances. The dev instance should have its own copy of the codebase (or at minimum its own `.next/` directory via `NEXT_PRIVATE_OUTPUT_DIR` or a symlink strategy). The production instance should only read from a known-good `.next/` built output, never from the live source tree. PM2 config for production must set `watch: false` explicitly.

**Warning signs:**
- Both instances started from the same directory with default configs
- PM2 `watch` mode enabled on the production instance
- `next build` is invoked while `next dev` is running in the same directory
- `.next/` directory ownership conflicts in filesystem logs

**Phase to address:** Phase delivering the two-instance architecture. Must be designed before any Tier 2 editing work begins.

---

### Pitfall 3: next-intl Middleware Not Running — Pages Silently Use Default Locale

**What goes wrong:**
A page renders without localization errors, but all content is in the default locale regardless of the URL locale segment. The `useTranslations()` call works, but always returns EN strings even when the URL says `/fr/...`.

**Why it happens:**
The next-intl proxy (formerly middleware) is misconfigured. Common causes: the proxy file is in the wrong directory (must be `src/proxy.ts` or `proxy.ts` at root depending on project structure), the matcher excludes pathnames with dots (breaking routes like `/en/yapu.solutions`), or third-party rewrites (analytics endpoints) interfere with locale detection. The middleware silently falls back to the default locale instead of throwing.

**How to avoid:**
Verify the proxy matcher explicitly covers all route patterns including dynamic segments. Exclude known internal paths (analytics endpoints, `/_next/`, `/api/`) explicitly. Test locale detection in isolation before building any page content. Use the next-intl `setRequestLocale()` call correctly in every page and layout that needs static rendering.

**Warning signs:**
- All three locales render identical content
- `useTranslations()` returns no errors but only EN strings
- No 404 on `/fr/` routes but no French content either
- `proxy.ts` matcher uses default config without checking dotted paths

**Phase to address:** Phase 1 (project setup and routing). Catch before any content extraction work.

---

### Pitfall 4: `setRequestLocale()` Missing on Pages — Forces Dynamic Rendering Everywhere

**What goes wrong:**
`next-intl` requires `setRequestLocale(locale)` to be called in every page and layout that uses translations and needs to be statically rendered. Developers apply it only to the root layout, forgetting that Next.js renders layouts and pages independently. Pages that omit this call fall back to dynamic rendering. The result: all pages are dynamically rendered (SSR on every request), adding latency and breaking static optimization.

**Why it happens:**
The Next.js App Router renders each route segment independently. A `setRequestLocale()` in `layout.tsx` does not automatically propagate to `page.tsx`. Next.js docs note this is an unintuitive behavior. Developers coming from Pages Router expect parent setup to cascade.

**How to avoid:**
Add `setRequestLocale(locale)` to every `page.tsx` and `layout.tsx` that uses `useTranslations()`, not just the root layout. Add `generateStaticParams()` returning all supported locales (`['en', 'fr', 'es']`) to every dynamic `[locale]` segment. Verify static rendering by running `next build` and checking the build output — static pages show `○` (static), not `λ` (dynamic).

**Warning signs:**
- Build output shows `λ` (Server) for pages that should be `○` (Static)
- Only the root layout has `setRequestLocale()`
- `generateStaticParams` missing from `[locale]` page files
- Dev server works fine but production is slow (SSR on every request)

**Phase to address:** Content extraction and page-building phase. Enforce as a build-output check at phase completion.

---

### Pitfall 5: Tailwind v4 Utility Name Changes Break Visual Recreation

**What goes wrong:**
The project uses Tailwind v4. But YAPU's existing site was presumably styled with v3 conventions or CSS. When recreating the visual design, developers use Tailwind class names from v3 documentation, tutorials, or memory — and the visual output silently differs because v4 changed the defaults for shadows, rings, borders, and roundedness.

**Why it happens:**
Tailwind v4 has a cascade of renamed/shifted utilities. The most dangerous are: `shadow-sm` is now `shadow-xs`, `ring` now defaults to 1px (was 3px), `border` now uses `currentColor` (was `gray-200`), and `rounded` scale names shifted. The codebase compiles without errors — the classes are valid, they just apply different values than expected.

The specific v4 changes that affect corporate UI:
- All shadow utilities shifted down one step (`shadow` → `shadow-xs`, etc.)
- Ring default width: 3px in v3, 1px in v4 — focus rings look wrong
- Border color: now `currentColor` instead of gray — invisible borders
- Variant stacking order reversed: `first:*:pt-0` (v3) vs `*:first:pt-0` (v4)

**How to avoid:**
Keep the [Tailwind v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide) open during all styling work. For any shadow, ring, or border utility, explicitly state the value rather than relying on defaults. Use the explicit color version for borders (`border border-gray-200` not just `border`). Use `ring-3` explicitly if a 3px ring is intended. Run the upgrade tool (`npx @tailwindcss/upgrade`) as a lint check, not migration tool.

**Warning signs:**
- Borders appear to have disappeared or are the wrong color
- Focus rings on buttons look thinner than expected
- Card shadows seem too subtle compared to the reference site
- Variant chains like `hover:first:child` not working

**Phase to address:** Phase 1 design system setup. Document the YAPU color/spacing tokens explicitly in CSS variables before building any components.

---

### Pitfall 6: Visual Recreation Drift — "Looks Right at 1440px, Broken Everywhere Else"

**What goes wrong:**
The recreation of yapu.solutions matches the desktop view at the developer's screen resolution but breaks at other breakpoints. WordPress/Cornerstone uses its own responsive system. The original site's breakpoints may not map cleanly to Tailwind's `sm/md/lg/xl/2xl` breakpoints. The demo is shown at one resolution and approved, then later revealed to be broken on mobile or tablet.

**Why it happens:**
Cornerstone page builder uses custom breakpoints and percentage-based layouts. The rebuild uses Tailwind's fixed breakpoints. Without a systematic comparison at every breakpoint, gaps emerge. Component-level recreation tends to focus on the "happy path" desktop view. The `max-w-*` behavior in Tailwind v4 also changed (no default max width constraint).

**How to avoid:**
Before building any component, document YAPU's actual breakpoints by inspecting the live site at each viewport width. Take screenshots at 375px, 768px, 1024px, 1280px, 1440px. Build each component mobile-first against those screenshots. Run visual comparison side-by-side at each breakpoint before marking a component done.

**Warning signs:**
- All development done at a single viewport width
- No mobile screenshots of the reference site taken
- Components built with hardcoded pixel widths instead of responsive utilities
- Logo carousels and mega-menus not tested at tablet size

**Phase to address:** Every component-building phase. Establish comparison protocol in Phase 1.

---

### Pitfall 7: Multilingual Content Extraction Creates Structural Mismatches

**What goes wrong:**
EN/FR/ES content is extracted from the live yapu.solutions site and stored in JSON. But the three language versions of the site have structural differences — a section that exists in EN may have different content density in FR, a CTA in ES may be significantly longer, and some sections may be absent in certain locales. The JSON schema assumes structural symmetry across locales, breaking layout when language-specific content doesn't fit.

**Why it happens:**
WordPress/Cornerstone multilingual sites (often using WPML or Polylang) allow per-locale layout variations, not just text substitution. Translators expand or condense sections. When the rebuild treats all locales as structurally identical (same components, different strings), locale-specific layout breaks emerge at demo time.

**How to avoid:**
Before extracting content, audit the live site in all three locales and document structural differences explicitly. Design the JSON schema to handle optional sections (absent sections are simply not rendered, not erroring). Test all three locales at every component milestone, not just EN. Allow for longer text in FR/ES in button and heading elements.

**Warning signs:**
- JSON schema has all keys required across all locales
- Content only reviewed in EN during development
- Button text overflows container in FR/ES
- A section visible in EN is not present in FR but the component still renders an empty section

**Phase to address:** Content extraction phase. Schema design must account for optional fields before any extraction work.

---

### Pitfall 8: Environment Variables Baked Into Build vs. Runtime

**What goes wrong:**
Analytics credentials, form endpoint URLs, or API keys are set in `.env` during build. On the VPS, these values differ between dev and production instances. After `next build`, the production instance uses stale baked-in values from the build environment, not from the running PM2 environment.

**Why it happens:**
In Next.js, environment variables without `NEXT_PUBLIC_` prefix are server-only and can be read at runtime during dynamic rendering. But `NEXT_PUBLIC_` variables are inlined at build time — they cannot be changed after the build without rebuilding. Developers use `NEXT_PUBLIC_` for everything for convenience and then discover the values are frozen. The opposite error is using non-public variables in Client Components where they resolve to empty strings.

**How to avoid:**
Use `NEXT_PUBLIC_` prefix only for values that are truly the same across all environments (e.g., a public GA measurement ID). Use non-prefixed variables for server-side secrets. For the two-instance architecture, ensure both PM2 ecosystem files explicitly set all needed env vars. Test with `next build && next start` locally before deploying, not only `next dev`.

**Warning signs:**
- `NEXT_PUBLIC_ANALYTICS_ID` is different between dev and prod but was set once before build
- GA not firing in production but firing in dev
- Forms submitting to dev endpoint from production instance
- Client component receiving `undefined` for a needed value

**Phase to address:** Phase delivering analytics and forms. Establish env var convention in Phase 1 before any feature work.

---

## Moderate Pitfalls

### Pitfall 9: nginx Buffering Breaks SSR Streaming

**What goes wrong:**
When nginx is configured as a reverse proxy in front of Next.js (PM2 + nginx on Hostinger), the default buffering behavior prevents SSR streaming from working. Pages that use React Suspense and streaming responses appear to hang until the full page is rendered server-side, losing the streaming benefit.

**How to avoid:**
Set `X-Accel-Buffering: no` in the Next.js response headers config, or configure nginx with `proxy_buffering off` for the Next.js upstream. This is documented in the Next.js self-hosting guide. Do this at initial nginx config time, not when debugging slow page loads later.

**Source:** Official Next.js self-hosting docs — MEDIUM confidence.

---

### Pitfall 10: Missing `generateStaticParams` for `[locale]` Segment

**What goes wrong:**
The `[locale]` dynamic segment is not pre-rendered at build time because `generateStaticParams` is missing or returns an empty array. At runtime, every locale is generated on the first request (slow, visible to demo audience) rather than being pre-built. Or worse, locales 404 until first hit.

**How to avoid:**
Every `[locale]/page.tsx` and `[locale]/layout.tsx` must export `generateStaticParams` returning `[{ locale: 'en' }, { locale: 'fr' }, { locale: 'es' }]`. Verify in the `next build` output that all locale variants appear as static pages (the `○` indicator, not `λ`).

---

### Pitfall 11: next-intl Message Keys with Dots or Dashes Fail Silently

**What goes wrong:**
A translation key like `hero.cta-button` works in JS but fails silently in next-intl. The dot creates unexpected nesting (interpreted as namespace separator). The dash in value names used in interpolation breaks without error.

**How to avoid:**
Use only alphanumeric characters and underscores in all next-intl message keys and value names. Use camelCase (`heroCta`, `ctaButton`) not kebab-case or dot notation for flat keys. Use explicit nesting with objects if namespacing is needed.

---

### Pitfall 12: next-intl TypeScript Augmentation Not Set Up — Silent Missing Key Errors

**What goes wrong:**
Without TypeScript type augmentation (`Messages` interface in `global.d.ts`), invalid translation keys compile without error and only fail at runtime (rendering empty string or throwing). In a sales demo context, missing translation text during a live demo is catastrophic.

**How to avoid:**
Set up the `Messages` type augmentation in Phase 1 during project setup. The ~0.6s TypeScript compilation overhead is acceptable. Run type checks as part of the build to catch missing keys before deployment.

---

### Pitfall 13: Ember File Writes Race With Next.js File Watching

**What goes wrong:**
Ember writes a JSON content file. Next.js dev server (Tier 2) detects the file change and starts HMR. If Ember writes multiple files in sequence, the dev server triggers multiple HMR cycles, potentially leaving the preview in an intermediate state. With large JSON files, partial writes can be read by Next.js mid-write.

**How to avoid:**
Design Ember's write operations as atomic: write to a temporary file first, then rename/move to the target path. File rename on Unix is atomic at the OS level. Use a debounce or lock mechanism if Ember writes multiple files in one edit operation. Test multi-file edits explicitly.

---

### Pitfall 14: Cornerstone/WordPress CSS Specificity Cannot Be Reproduced Exactly

**What goes wrong:**
The YAPU reference site uses Cornerstone page builder which generates inline styles and deeply-scoped CSS. When recreating visually in Tailwind, some layout behaviors stem from Cornerstone's internal CSS that is not visible in DevTools as author styles. The rebuilt site "looks almost right" but has subtle spacing, font metric, or layout differences that are attributed to the rebuild rather than Cornerstone quirks.

**How to avoid:**
Accept that pixel-perfect recreation is not achievable without knowing Cornerstone's internal CSS. Aim for "visually equivalent" not "pixel-identical." Document deliberate deviations from the reference site. Focus visual fidelity efforts on the Hero, Module Cards, and logo carousels — the sections most likely to be scrutinized in the demo. Avoid spending excessive time hunting 2px discrepancies in footer padding.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| `export const dynamic = 'force-dynamic'` on all pages | Guarantees fresh content without cache setup | Every page request hits the Node.js server, no static caching benefit | Acceptable for demo/sales stage; must be replaced before high-traffic production use |
| Hardcoding all content in TSX components instead of JSON | Faster initial build, no content loading layer | Ember cannot edit content without full Tier 2 code edits; blocks Tier 1 entirely | Never — defeats the entire Promptheus value proposition |
| Single instance (dev server serving both editing and visitors) | Simpler setup, one PM2 process | Editing activity (HMR, compilation) directly impacts visitor experience | Never for production; acceptable during development-only phase |
| Inline color values instead of CSS custom properties | Faster component development | Color scheme changes require find-and-replace across codebase; Ember cannot change colors programmatically | Never — OKLCH CSS variables in Tailwind v4 are the correct approach from the start |
| Copy content directly from live site without translation namespace structure | Fast first extraction | Namespace restructuring mid-project breaks all existing translation calls | Never — design JSON structure before extraction |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| next-intl + Next.js proxy | Proxy matcher uses default config, accidentally rewrites analytics/CDN paths | Explicitly exclude `/_next/`, `/api/`, analytics domains in matcher |
| PM2 + Next.js | Setting `watch: true` in PM2 config for production instance | Production: `watch: false` always; dev instance may use PM2 watch selectively |
| nginx + Next.js SSR streaming | Default buffering enabled, streaming stalls | Set `X-Accel-Buffering: no` header in `next.config.js` response headers |
| Google Analytics + Next.js | Using `NEXT_PUBLIC_GA_ID` baked into build, can't change per environment | Set GA ID as public env var once per environment build; consider using server-side GA hits for privacy |
| Ember + JSON content files | Ember writes JSON, no revalidation triggered, visitors see stale content | Ember write workflow must call a revalidation Route Handler after every file write |
| Ember + dev server HMR | Large JSON writes trigger multiple HMR cycles, intermediate states visible | Atomic writes (write temp file, rename to target) |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `react-icons` full package import | Dev server compile time exceeds 30s; initial page load large | Import from specific subpath: `@phosphor-icons/react/dist/csr/Triangle` | At first lucide-react barrel import; lucide-react is better but still verify imports |
| Tailwind content glob too broad | Build scanning `node_modules`, taking 60+ seconds | Content glob must only cover `./src/**/*.{ts,tsx}` | Any project; antivirus on Windows compounds this |
| ISR with different revalidate times on same route | The lowest revalidate time wins for the whole route | Set consistent revalidate times per route or use on-demand revalidation | When mixing ISR fetch calls at 60s and 3600s on same page |
| Unoptimized image assets (logos) | LCP score poor, layout shift on logo carousels | Use `next/image` with explicit `width`/`height` for all extracted logo assets | With YAPU's partner/client logo carousels — many images loading simultaneously |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Ember's revalidation Route Handler publicly accessible | Anyone can trigger cache revalidation, causing unnecessary server load or timing attacks | Protect the revalidation endpoint with a secret token validated in the Route Handler |
| `NEXT_PUBLIC_` prefix on sensitive keys | Keys exposed in client JS bundle, visible in browser DevTools | Only use `NEXT_PUBLIC_` for truly public values (analytics IDs, public URLs); use server-only env vars for secrets |
| Dev server accessible on public VPS port | Development mode exposes stack traces, source maps, unminified code | Bind dev server to `localhost` only; access via SSH tunnel or nginx with auth; never expose port 3001 publicly |
| JSON content files writable by Node.js process running as root | A compromised Ember session can write arbitrary files to server | Run PM2 processes as non-root user; restrict file write permissions to content directory only |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Cookie consent banner overlaps hero content on mobile | YAPU's demo is disrupted before the value proposition is visible | Implement consent banner as bottom-fixed overlay, test on 375px viewport before demo |
| Newsletter form submits but shows no feedback | User doesn't know if subscription worked; in demo context, "it broke" perception | Always show inline success/error state; disable submit button during pending state |
| Language switcher changes URL but previous language content flashes | Multilingual demo looks broken when switching locales | Use locale-aware `<Link>` from next-intl for all language switcher links, not router.push |
| Mega-menu dropdown not keyboard accessible | Accessibility gap visible during demo if demo person uses keyboard | Use Radix UI or shadcn/ui NavigationMenu which handles keyboard focus and ARIA automatically |

---

## "Looks Done But Isn't" Checklist

- [ ] **Three-language support:** EN renders correctly, but FR and ES content was never extracted or is placeholder — verify all three locales have real content and render correctly
- [ ] **Cookie consent:** Banner appears but consent preference is not persisted in a cookie — verify preference survives page navigation and browser refresh
- [ ] **Analytics:** GA tag fires in dev but not in production (wrong env var baked into build) — verify in network tab on production URL
- [ ] **Newsletter form:** Form submits but no actual endpoint processes it — verify form POST reaches intended endpoint and returns appropriate response
- [ ] **Chatbot Tier 1 preview:** JSON file changed by Ember, but cache not invalidated — verify revalidation call is wired into Ember write flow and page shows new content within expected time
- [ ] **Mobile navigation:** Desktop mega-menu works, but mobile hamburger menu was never implemented — verify mobile nav at 375px viewport
- [ ] **Static rendering:** `next build` output shows `○` for all content pages — verify no unintended `λ` (dynamic) pages except where intentional
- [ ] **Logo assets:** Logos extracted from live site, displayed at wrong dimensions or aspect ratio — verify all logo images have correct `width`/`height` attributes and no layout shift
- [ ] **Two-instance isolation:** Dev server edits visible on production URL — verify production instance is not watching source files and rebuilds are manual/intentional

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Stale cache serving wrong content | LOW | Call `revalidatePath('/')` programmatically or trigger a `next build` and PM2 restart |
| Two-instance `.next/` directory conflict | MEDIUM | Stop both instances, `rm -rf .next/`, rebuild production, restart both with separate working dirs |
| Broken locale routing across all pages | HIGH | Stop feature work, fix proxy configuration, verify each locale individually, re-test all pages |
| TypeScript translation key errors found late | MEDIUM | Set up type augmentation immediately, run `tsc --noEmit` to surface all key mismatches at once |
| Tailwind v4 utility regressions found late | MEDIUM | Run `npx @tailwindcss/upgrade --dry` to identify all affected classes, fix systematically by category (shadows, rings, borders) |
| Production serving dev build (wrong instance) | LOW | Verify PM2 process names and ports; `pm2 list` to confirm which process owns which port |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Caching serves stale content after JSON edits | Tier 1 editing phase | Write a content value, verify it appears on the live URL within expected window without manual rebuild |
| Two-instance `.next/` conflict | Two-instance architecture setup | Both PM2 processes running simultaneously; edit in dev instance does not affect production URL |
| next-intl middleware not running | Phase 1 routing setup | Navigate to `/fr/` and `/es/` — content renders in correct language; check proxy is executing via Next.js dev logs |
| `setRequestLocale()` missing | Content pages build phase | Run `next build`; all locale page variants show `○` in build output |
| Tailwind v4 utility name regressions | Phase 1 design system setup | Visual comparison at each breakpoint; shadow and ring utilities explicitly tested against reference screenshots |
| Visual recreation drift at breakpoints | Every component phase | Side-by-side screenshot comparison at 375, 768, 1024, 1440px before marking component done |
| Multilingual JSON structural mismatch | Content extraction phase | All three locales tested with real extracted content before any component is marked complete |
| Env vars baked into wrong instance | Phase 1 infrastructure | `next build && next start` locally with both env files; verify analytics and form endpoints are correct per environment |
| nginx buffering blocks streaming | Infrastructure setup phase | Test a Suspense-wrapped async component in production; verify response streams progressively in DevTools Network tab |
| Missing `generateStaticParams` | Page-building phase | `next build` output shows all locale variants as `○` static |
| Missing TypeScript type augmentation | Phase 1 project setup | `tsc --noEmit` produces errors for invalid translation keys |
| Ember file write race condition | Tier 2 editing phase | Ember makes 3 rapid successive edits; verify dev server settles to correct final state |
| Publicly exposed revalidation endpoint | Tier 1 editing phase | Try calling revalidation endpoint without auth token; verify 401/403 response |
| Dev server publicly accessible | Infrastructure setup phase | Attempt to reach port 3001 from external IP; verify no response or nginx auth required |

---

## Sources

- Next.js 16 official caching documentation (nextjs.org/docs/app/guides/caching) — HIGH confidence, current as of 2026-02-24
- Next.js 16 self-hosting guide (nextjs.org/docs/app/guides/self-hosting) — HIGH confidence
- Next.js 16 Server and Client Components guide (nextjs.org/docs/app/getting-started/server-and-client-components) — HIGH confidence
- Next.js 16 ISR guide (nextjs.org/docs/app/guides/incremental-static-regeneration) — HIGH confidence
- Next.js 16 local development guide (nextjs.org/docs/app/guides/local-development) — HIGH confidence
- Tailwind CSS v4 upgrade guide (tailwindcss.com/docs/upgrade-guide) — HIGH confidence
- next-intl routing middleware docs (next-intl.dev/docs/routing/middleware) — MEDIUM confidence (official but summarized)
- next-intl App Router setup docs (next-intl.dev/docs/getting-started/app-router) — MEDIUM confidence
- next-intl TypeScript docs (next-intl.dev/docs/usage/typescript) — MEDIUM confidence
- next-intl message usage docs (next-intl.dev/docs/usage/messages) — MEDIUM confidence
- Two-instance architecture and Ember integration patterns — LOW confidence (first-principles reasoning from official docs; no prior art found for this exact pattern)

---
*Pitfalls research for: Chatbot-editable corporate website rebuild (WordPress → Next.js 16, yapu.solutions)*
*Researched: 2026-02-26*
