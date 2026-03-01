# Architecture Research

**Domain:** Chatbot-editable corporate website (two-instance architecture)
**Researched:** 2026-02-26
**Confidence:** HIGH (Next.js 16 official docs verified)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          EMBER CHATBOT                               │
│                   (ember.promptheus.cloud)                           │
│           Tier 1: JSON edits    Tier 2: Code edits                  │
└──────────────┬──────────────────────────┬───────────────────────────┘
               │ POST /api/content        │ direct file writes
               │ (HTTP to prod server)    │ (SSH/filesystem on VPS)
               ▼                          ▼
┌──────────────────────────┐  ┌──────────────────────────────────────┐
│   PRODUCTION SERVER      │  │          DEV SERVER                  │
│   next start             │  │          next dev (HMR)              │
│   Port 3001              │  │          Port 3000                   │
│   SSR, serves visitors   │  │   Ember edits code/CSS/components    │
│                          │  │   Live preview via iframe/proxy      │
│   nginx :443 → :3001     │  │   nginx /preview → :3000             │
└──────────┬───────────────┘  └───────────┬──────────────────────────┘
           │                              │
           │  shared filesystem           │  deploy: `next build` then
           │  /content/*.json             │  PM2 restart prod process
           ▼                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FILE SYSTEM (VPS)                             │
│  /content/                                                           │
│    en.json   fr.json   es.json     ← Tier 1: chatbot edits these    │
│  /messages/                                                          │
│    en.json   fr.json   es.json     ← next-intl translation files    │
│  /src/                             ← Tier 2: chatbot edits these    │
│    app/  components/  styles/                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Production Next.js | Serve visitors via SSR, reads JSON on every request | `next start` on port 3001, PM2 process |
| Dev Next.js | Live preview for Ember, accepts file edits, HMR | `next dev` on port 3000, PM2 process |
| nginx | TLS termination, routing visitors to prod, /preview to dev | `/etc/nginx/sites-available/yapu` |
| Ember chatbot | AI chatbot interface for editing content/code | External service at ember.promptheus.cloud |
| Content API (Route Handler) | Accept Tier 1 edits, write JSON, revalidate cache | `app/api/content/route.ts` |
| JSON content files | Source of truth for all page content, all locales | `/content/[section]/[locale].json` |
| next-intl messages | UI string translations (labels, nav, CTAs) | `/messages/[locale].json` |
| PM2 | Process management for both server instances | `ecosystem.config.js` |

## Recommended Project Structure

```
/
├── content/                     # Tier 1 editable content (chatbot writes these)
│   ├── homepage/
│   │   ├── en.json              # Hero, modules, testimonials content (EN)
│   │   ├── fr.json              # Same structure, French
│   │   └── es.json              # Same structure, Spanish
│   ├── investor-services/
│   │   ├── en.json
│   │   ├── fr.json
│   │   └── es.json
│   ├── data-insights/
│   ├── digital-tools/
│   ├── impact/
│   ├── news/
│   ├── about/
│   └── shared/                  # Navigation, footer (used across pages)
│       ├── en.json
│       ├── fr.json
│       └── es.json
├── messages/                    # next-intl UI string translations
│   ├── en.json                  # Button labels, aria-labels, form text
│   ├── fr.json
│   └── es.json
├── public/                      # Static assets
│   ├── logos/
│   ├── partners/
│   └── clients/
├── src/
│   ├── app/
│   │   ├── [locale]/            # next-intl locale segment
│   │   │   ├── layout.tsx       # Root layout with locale provider
│   │   │   ├── page.tsx         # Homepage
│   │   │   ├── investor-services/
│   │   │   │   └── page.tsx
│   │   │   ├── data-insights/
│   │   │   ├── digital-tools/
│   │   │   ├── impact/
│   │   │   ├── news/
│   │   │   └── about/
│   │   └── api/
│   │       └── content/
│   │           └── route.ts     # POST endpoint for Tier 1 edits
│   ├── components/
│   │   ├── sections/            # Page sections (Hero, ModuleCards, etc.)
│   │   ├── layout/              # Header, Footer, Navigation
│   │   └── ui/                  # shadcn/ui primitives
│   ├── lib/
│   │   ├── content.ts           # readContent(section, locale) helper
│   │   └── types.ts             # Content type definitions
│   └── i18n/
│       ├── routing.ts           # next-intl locale config
│       ├── request.ts           # Message loader
│       └── navigation.ts        # Typed Link/redirect
├── middleware.ts                # next-intl locale detection
├── next.config.ts
├── ecosystem.config.js          # PM2 config (prod + dev processes)
└── .env.local                   # CONTENT_API_SECRET, ports
```

### Structure Rationale

- **`content/` at root (not `src/`):** Ember writes directly to filesystem. Placing content outside `src/` makes the edit target clear and separates code from data. No import path issues with `outputFileTracingIncludes` needed.
- **`messages/` separate from `content/`:** next-intl messages are UI chrome (labels, aria, form placeholders). Page content (body copy, headlines, CTAs) goes in `content/`. Different edit surfaces, different ownership.
- **`[locale]/` route segment:** next-intl App Router pattern requires all pages under a dynamic `[locale]` segment. Middleware handles locale detection and redirects.
- **`api/content/route.ts`:** Tier 1 edits go through this endpoint, which writes JSON and calls `revalidatePath('/', 'layout')` to invalidate production cache.

## Architectural Patterns

### Pattern 1: Dynamic SSR for Tier 1 Content

**What:** All pages use `export const dynamic = 'force-dynamic'` or read JSON via a function that opts out of caching. On every request, server reads content JSON from disk, renders HTML, and returns it. No build step required for content changes.

**When to use:** All content-bearing pages. Makes Tier 1 edits (JSON file changes) immediately visible on the next page load without rebuilding.

**Trade-offs:** Slightly slower than static (no cached HTML), but for a corporate site with low traffic the difference is negligible. SSR is the right default here.

**Example:**
```typescript
// src/lib/content.ts
import { readFileSync } from 'fs'
import { join } from 'path'

export function readContent<T>(section: string, locale: string): T {
  const filePath = join(process.cwd(), 'content', section, `${locale}.json`)
  const raw = readFileSync(filePath, 'utf-8')
  return JSON.parse(raw) as T
}

// src/app/[locale]/page.tsx
export const dynamic = 'force-dynamic'  // never cache this route

export default async function HomePage({ params }) {
  const { locale } = await params
  const content = readContent<HomepageContent>('homepage', locale)
  return <HomepageView content={content} />
}
```

### Pattern 2: Content API Route for Tier 1 Edits

**What:** A protected POST endpoint that Ember calls to update content. Writes the new JSON to disk, then calls `revalidatePath('/', 'layout')` to purge Next.js cache (relevant for any cached routes).

**When to use:** Every Tier 1 edit from Ember. Single entry point for all content mutations.

**Trade-offs:** Simple, no database required. File locking not a concern for single-writer scenario (Ember is the only writer). Needs auth token to prevent unauthorized writes.

**Example:**
```typescript
// src/app/api/content/route.ts
import { writeFileSync } from 'fs'
import { join } from 'path'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  if (authHeader !== `Bearer ${process.env.CONTENT_API_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { section, locale, content } = await request.json()
  const filePath = join(process.cwd(), 'content', section, `${locale}.json`)
  writeFileSync(filePath, JSON.stringify(content, null, 2))

  revalidatePath('/', 'layout')  // purge all cached pages
  return Response.json({ ok: true })
}
```

### Pattern 3: Two-Instance PM2 Setup

**What:** Two separate PM2 processes run from the same codebase directory. Production runs `next start` (compiled build), dev runs `next dev` (HMR). They share the filesystem, so content JSON edits are visible to both immediately.

**When to use:** This is the core architecture. Production instance serves real visitors. Dev instance is Ember's editing canvas.

**Trade-offs:** Slightly higher memory usage than single instance. Ports must not conflict. Dev server must not be publicly accessible (nginx must block it except from Ember).

**Example:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'yapu-prod',
      script: 'node_modules/.bin/next',
      args: 'start',
      env: { PORT: 3001, NODE_ENV: 'production' }
    },
    {
      name: 'yapu-dev',
      script: 'node_modules/.bin/next',
      args: 'dev --port 3000',
      env: { PORT: 3000, NODE_ENV: 'development' }
    }
  ]
}
```

### Pattern 4: nginx Routing for Two Instances

**What:** nginx routes public traffic to prod (port 3001), and routes `/preview/*` or a subdomain to dev (port 3000). The dev server is only accessible through authenticated routes, not the public internet.

**When to use:** Required for two-instance setup. nginx handles TLS and acts as a security boundary.

**Trade-offs:** Adds nginx config complexity. Streaming responses require `X-Accel-Buffering: no` header (documented in Next.js self-hosting guide).

**Example:**
```nginx
# /etc/nginx/sites-available/yapu
server {
  listen 443 ssl;
  server_name yapu.promptheus.cloud;

  # Public traffic → production
  location / {
    proxy_pass http://localhost:3001;
    add_header X-Accel-Buffering no;
  }
}

server {
  listen 443 ssl;
  server_name yapu-preview.promptheus.cloud;

  # Preview (dev server) — Ember-only access
  location / {
    proxy_pass http://localhost:3000;
    add_header X-Accel-Buffering no;
    # Optional: restrict to Ember's IP or add basic auth
  }
}
```

### Pattern 5: Deploy from Dev to Production (Tier 2)

**What:** When Ember finishes a Tier 2 code edit, the deploy sequence is: (1) `next build` on the server, (2) `pm2 restart yapu-prod`. The dev server continues running during the build. Visitors keep getting served by prod until the restart completes.

**When to use:** After any Tier 2 edit (component, CSS, layout changes).

**Trade-offs:** Brief restart interruption (~1-2s) when PM2 restarts the prod process. `pm2 reload` (zero-downtime restart) is better but requires `cluster` mode in PM2, which adds complexity. For a demo project, `pm2 restart` is sufficient.

**Example:**
```bash
# Deploy script (called by Ember after Tier 2 edits)
#!/bin/bash
cd /path/to/yapu2
npm run build && pm2 restart yapu-prod
```

## Data Flow

### Tier 1 Edit Flow (Content-only, no rebuild)

```
Ember chatbot
    │
    │  POST /api/content
    │  { section: "homepage", locale: "en", content: {...} }
    │  Authorization: Bearer $SECRET
    ▼
Production Server (port 3001)
app/api/content/route.ts
    │
    ├─ Validate auth token
    ├─ writeFileSync('content/homepage/en.json', newContent)
    └─ revalidatePath('/', 'layout')
         │
         ▼
    Next.js cache invalidated

Next visitor request → GET /en
    │
    ├─ dynamic = 'force-dynamic' → no cache hit
    ├─ readContent('homepage', 'en')  ← reads updated JSON
    ├─ Renders HTML with new content
    └─ Returns fresh HTML to visitor
```

### Tier 2 Edit Flow (Code/design change, requires rebuild)

```
Ember chatbot
    │
    │  Writes files directly to VPS filesystem
    │  (src/components/sections/Hero.tsx, etc.)
    │
    ▼
Dev Server (port 3000)
    │
    ├─ HMR detects file change
    ├─ Recompiles affected modules
    └─ Pushes update to Ember's preview iframe
         │
         ▼
    Ember sees live preview of change

Ember approves → triggers deploy
    │
    ├─ npm run build  (builds production bundle)
    ├─ pm2 restart yapu-prod
    └─ Production now serves new code
```

### Visitor Request Flow (Normal SSR)

```
Visitor browser
    │
    │  GET https://yapu.promptheus.cloud/fr/investor-services
    ▼
nginx (port 443)
    │
    │  proxy_pass localhost:3001
    ▼
Next.js Production Server
    │
    ├─ middleware.ts: detect locale 'fr', validate route
    │
    ├─ app/[locale]/investor-services/page.tsx
    │   ├─ readContent('investor-services', 'fr')  ← disk read
    │   ├─ getTranslations('InvestorServices')     ← next-intl
    │   └─ render HTML
    │
    └─ Stream HTML back through nginx to visitor
```

### Content/Translation File Relationship

```
content/homepage/en.json          ← body copy, headlines, CTAs
    │
    ▼                              read by
app/[locale]/page.tsx             ← Server Component
    │
    ▼                              passes as props to
components/sections/Hero.tsx      ← renders with content props
    │
    ▼
HTML output

messages/en.json                  ← UI labels, aria, form text
    │
    ▼                              loaded by next-intl
i18n/request.ts                   ← on each request
    │
    ▼                              accessed via
useTranslations('Nav')            ← in any Server or Client Component
```

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Ember chatbot | HTTP POST to `/api/content` for Tier 1; SSH/file writes for Tier 2 | Auth token required for content API; Ember needs VPS SSH key for Tier 2 |
| Google Analytics | Client-side `<Script>` tag in root layout | GDPR consent check before loading |
| CalDAV / Newsletter | External form POST to newsletter service endpoint | No backend needed on this project |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Production ↔ Dev | Shared filesystem only | No HTTP communication between instances |
| Ember ↔ Production | HTTP (content API) | Protected by `CONTENT_API_SECRET` |
| Ember ↔ Dev | Filesystem + preview iframe | Dev server proxied via nginx subdomain |
| Next.js ↔ Content JSON | `fs.readFileSync` in Server Components | Node.js filesystem access, server-only |
| next-intl ↔ Messages | Dynamic `import()` in `i18n/request.ts` | One JSON file loaded per request |

## Suggested Build Order (Dependencies)

This architecture has clear dependency layers that dictate build order:

1. **Foundation first: Project scaffold + routing**
   - Next.js 16 + Tailwind v4 + shadcn/ui setup
   - next-intl with `[locale]` routing + middleware
   - `content/` and `messages/` directory structure with placeholder JSON
   - `readContent()` helper + TypeScript types
   - *Reason: Every subsequent component depends on these working*

2. **Infrastructure second: Two-instance setup**
   - PM2 `ecosystem.config.js` with prod (port 3001) + dev (port 3000)
   - nginx config for both instances
   - `dynamic = 'force-dynamic'` confirmed working on placeholder pages
   - *Reason: Must validate two-instance works before building content features*

3. **Content API third: Tier 1 editing pipeline**
   - `/api/content` route handler (POST, auth, write, revalidate)
   - Validate Ember can write and page reflects changes
   - *Reason: Validates the core chatbot-editing value proposition early*

4. **UI components fourth: Page sections**
   - shadcn/ui base components
   - Section components: Hero, ModuleCards, Testimonials, PartnerLogos, Newsletter, Footer
   - Navigation with mega-menu, responsive
   - *Reason: Can be built in parallel once routing works, no infra dependency*

5. **Pages fifth: Assemble sections into routes**
   - Homepage + all 6 subpages
   - Extract real YAPU content into JSON files (EN/FR/ES)
   - *Reason: Depends on both content structure and section components*

6. **Deploy flow last: Tier 2 editing pipeline**
   - Deploy script triggered by Ember
   - `next build` → `pm2 restart` sequence
   - Preview iframe routing
   - *Reason: Requires everything else to be working first*

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Demo / sales pitch | Current two-instance setup is sufficient. Single VPS, no CDN needed |
| Live client site (low traffic) | Add CDN for static assets (`assetPrefix`). Keep SSR for content-bearing pages |
| Live client site (high traffic) | Add Redis cache handler for Next.js data cache. Consider ISR for pages that don't need instant content updates |

### Scaling Priorities

1. **First bottleneck:** `fs.readFileSync` on every request at high concurrency. Fix: use `unstable_cache` with short TTL + `revalidateTag` on write, or switch to Redis.
2. **Second bottleneck:** Single VPS process for prod. Fix: PM2 cluster mode (multiple workers), or containerize and add load balancer.

## Anti-Patterns

### Anti-Pattern 1: Using Static Rendering for Content Pages

**What people do:** Let Next.js statically render pages at build time (the default behavior).
**Why it's wrong:** Tier 1 edits (JSON file changes) won't be visible until the next build. The entire value proposition of chatbot editing breaks.
**Do this instead:** Use `export const dynamic = 'force-dynamic'` on all content-bearing pages, or use `unstable_cache` with `revalidateTag` and call `revalidateTag` in the content API.

### Anti-Pattern 2: Combining `next-intl` Messages and Content JSON

**What people do:** Put all text in `messages/` and use `useTranslations()` for everything, including page body copy.
**Why it's wrong:** next-intl messages are loaded via dynamic `import()` and cached for the request. Updating them requires a rebuild. They're not suitable as a Tier 1 edit target.
**Do this instead:** Use `messages/` only for UI chrome (labels, aria-labels, form text). Keep page body copy in `content/*.json` which is read via `readFileSync` on each request.

### Anti-Pattern 3: Running Dev Server on Public Port

**What people do:** Expose `next dev` directly to the internet or fail to restrict it.
**Why it's wrong:** Dev server has no production security hardening. Anyone could access unfinished Tier 2 edits in progress. HMR websocket is not for public consumption.
**Do this instead:** nginx must restrict dev server access. Either IP whitelist Ember's server, or use a shared secret header check, or put it on an obscure subdomain with basic auth.

### Anti-Pattern 4: Restarting Both Instances for Tier 1 Edits

**What people do:** After a JSON content change, restart both PM2 processes to "be sure."
**Why it's wrong:** Unnecessarily interrupts the dev server's HMR state, forces visitors through a restart gap, and is slow. SSR with `force-dynamic` makes this completely unnecessary.
**Do this instead:** For Tier 1 edits, only call `revalidatePath` via the content API. No restarts needed. For Tier 2 edits, only restart the production process after build.

### Anti-Pattern 5: Storing Content in Next.js Data Cache Without Control

**What people do:** Use `fetch()` with cache headers to load JSON content, relying on Next.js's built-in caching.
**Why it's wrong:** Cache invalidation via `revalidatePath` after Route Handler calls does not immediately invalidate the cache — it marks for revalidation on next visit. For a content editor, this delayed invalidation is confusing.
**Do this instead:** Use `fs.readFileSync` directly in Server Components with `force-dynamic`. This guarantees fresh data on every request, zero cache confusion, correct mental model.

## Sources

- Next.js 16 official docs — Server Components, SSR, Caching: https://nextjs.org/docs/app (verified 2026-02-24, version 16.1.6)
- Next.js Self-hosting Guide: https://nextjs.org/docs/app/guides/self-hosting (confirmed nginx + PM2 pattern)
- Next.js Route Segment Config (`dynamic = 'force-dynamic'`): https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
- Next.js Caching Guide: https://nextjs.org/docs/app/guides/caching (confirmed `fs.readFileSync` bypasses data cache)
- revalidatePath API: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
- Next.js Standalone Output: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- Next.js Incremental Static Regeneration: https://nextjs.org/docs/app/guides/incremental-static-regeneration
- next-intl App Router setup: https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing
- next-intl message file structure: https://next-intl.dev/docs/getting-started/app-router/without-i18n-routing

---
*Architecture research for: chatbot-editable corporate website (two-instance)*
*Researched: 2026-02-26*
