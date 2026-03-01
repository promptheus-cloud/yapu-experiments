# Phase 2: Infrastructure - Research

**Researched:** 2026-02-26
**Domain:** VPS deployment, PM2, nginx, SSL, Next.js Route Handlers, Content API
**Confidence:** HIGH (core patterns), MEDIUM (two-instance build separation)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Domains & naming
- Claude chooses subdomains (production and preview) on the Promptheus domain — consistent naming convention
- Claude chooses PM2 app names consistent with subdomain choice
- Deploy script supports independent targets: `--prod`, `--dev`, `--all` flags to deploy instances separately

#### Content API design
- Claude decides auth mechanism (bearer token or API key) — simplest secure approach for single-client (Ember) access
- Claude decides request body format — map cleanly to `content/data/{locale}/{file}.json` structure
- Validate JSON structure before writing — API checks content matches expected schema, prevents broken pages from bad writes
- Support partial merge updates — Ember can patch specific fields (e.g., `{ "patch": { "hero.title": "New Title" } }`) rather than replacing entire files

#### Dev server access
- Bearer token check in nginx — preview subdomain requires Authorization header; Ember includes it, browsers without it get 403
- Build for cross-origin access — Ember's hosting location TBD, include CORS headers and cross-origin iframe permissions to be safe
- Claude decides 403 response style (generic or branded)
- Claude decides Content API host placement (production-only vs both instances)

#### VPS & existing state
- Shared VPS — other Promptheus apps already running with their own nginx configs and PM2 processes
- Ports need verification — 3000/3001 from requirements may be taken; researcher must check during planning
- Tooling needs verification — nginx and certbot may already be installed from other projects; researcher should confirm
- User manages DNS — can create A/CNAME records; wants documentation of exactly which DNS records to create (subdomains → VPS IP)

### Claude's Discretion
- Production and preview subdomain names
- PM2 app names
- Auth mechanism (bearer token vs API key)
- Content API request/response body format
- 403 page style for unauthorized dev access
- Whether Content API lives on prod only or both instances
- Port numbers (if 3000/3001 are taken)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Two-instance PM2 setup — production (port 3001) + dev (port 3000) on Promptheus VPS | PM2 ecosystem.config.js with multiple apps array; `--only` flag for independent targets |
| INFRA-02 | nginx reverse proxy routing public traffic to production, preview subdomain to dev | Separate nginx server blocks per subdomain; proxy_pass to each port |
| INFRA-03 | Dev server access restricted to Ember only (not publicly accessible) | nginx `if ($http_authorization != "Bearer TOKEN")` returning 403 in preview server block |
| INFRA-04 | SSL/TLS configured via certbot | `certbot --nginx -d yapu.promptheus.cloud -d yapu-preview.promptheus.cloud` on shared VPS |
| INFRA-05 | Deploy script: `next build` + `pm2 restart yapu-prod` | Extension of Promptheus deploy.sh pattern with `--prod`/`--dev`/`--all` flags |
| EDIT-01 | Protected Content API Route Handler (POST /api/content) with auth token validation | Next.js App Router `app/api/content/route.ts`; bearer token in `Authorization` header; Zod schema validation; `fs.writeFileSync` to `content/data/` |
| EDIT-03 | Content changes visible on production site within one page reload (SSR with force-dynamic) | `export const dynamic = 'force-dynamic'` on all content pages; pages re-read JSON from disk on every request; no rebuild required |
</phase_requirements>

---

## Summary

Phase 2 establishes the VPS infrastructure that all later phases depend on. The work falls into four parallel tracks: (1) PM2 two-instance setup, (2) nginx routing with SSL and preview access control, (3) the Content API Route Handler, and (4) the deploy script extension.

The single most uncertain area is the two-instance architecture. The problem is that `next build` writes to `.next/` by default and both instances running from the same directory would share the same build output. The solution — using `distDir` in `next.config.ts` to point each build to a distinct output folder (`.next-prod/` and `.next-dev/`) — is documented by Next.js. The `next dev` instance doesn't use `distDir` at all (HMR serves directly from source), so the directory conflict only affects when running `next start` for prod. Both PM2 processes then point to their respective `distDir` output. This is LOW-MEDIUM confidence because there is no prior art in this project and it must be verified with a spike.

The Content API is clean: a POST Route Handler at `app/api/content/route.ts` reads the Authorization header, validates a bearer token against `process.env.CONTENT_API_SECRET`, validates the body with Zod, and writes JSON to `content/data/{locale}/{file}.json` using `fs.writeFileSync`. Because all content pages are set to `force-dynamic`, Next.js re-reads the file from disk on every request — no cache busting, no rebuild, changes appear on next page load.

**Primary recommendation:** Implement dev instance as `next dev -p 3000` (no build needed), prod as `next start -p 3001` pointing to `distDir: '.next-prod'`. This is the simplest separation that avoids `.next/` conflicts without requiring separate git worktrees.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| PM2 | latest (global) | Process manager, keeps Next.js alive, auto-restart on reboot | Industry standard for Node.js on VPS; already in Promptheus pattern |
| nginx | system (already installed) | Reverse proxy, SSL termination, preview access control | Already in Promptheus VPS; handles bearer token check in config layer |
| certbot (python3-certbot-nginx) | system | SSL certificate provisioning and renewal | Let's Encrypt standard; already in Promptheus setup.sh |
| Zod | ^3.x | JSON schema validation in Content API | TypeScript-first, zero-deps, standard for Next.js API validation |
| Node.js `fs` module | built-in | Write JSON files from Content API | Built-in; works on self-hosted VPS (unlike Vercel serverless) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `next` CLI `-p` flag | built-in | Set port for `next dev` and `next start` | Both instances need explicit port assignment |
| PM2 `--only` flag | built-in | Deploy/restart individual app from ecosystem file | `--prod` and `--dev` deploy targets |
| `process.env.CONTENT_API_SECRET` | — | Auth token for Content API | Store in `.env.local` on VPS, never in git |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| nginx `if` block for bearer token | `auth_request` subrequest module | `auth_request` requires a validation endpoint; `if` block with static token is simpler for single-client case |
| Zod for JSON schema validation | Manual type guards | Zod provides typed errors, reusable schemas, TypeScript inference — less code |
| `fs.writeFileSync` (sync) | `fs.promises.writeFile` (async) | Async is preferred; sync blocks the Node.js event loop. Use `fs.promises.writeFile` in the Route Handler |
| Single ecosystem.config.js | Two separate ecosystem files | Single file with `--only` flag is cleaner for Promptheus deploy pattern |
| `distDir` per instance | Separate git worktrees | `distDir` is simpler; worktrees add filesystem complexity on VPS |

**Installation:**
```bash
npm install zod
```

---

## Architecture Patterns

### Recommended Project Structure

```
yapu2/                            # Single git repo, single codebase
  .next-prod/                     # Production build output (gitignored)
  app/
    api/
      content/
        route.ts                  # POST /api/content — Content API
  content/data/                   # JSON files read by pages, written by API
  server/
    ecosystem.config.js           # PM2 two-app config (yapu-prod, yapu-dev)
    deploy.sh                     # Extended with --prod/--dev/--all flags
    nginx-yapu.conf               # nginx config for both subdomains
    nginx-yapu-preview.conf       # (or combined into one file with two server blocks)
  next.config.ts                  # distDir: '.next-prod' (prod build target)
  .env.local                      # CONTENT_API_SECRET (VPS only, gitignored)
```

### Pattern 1: PM2 Two-Instance Ecosystem Config

**What:** Both `yapu-prod` and `yapu-dev` live in one `ecosystem.config.js`. Prod runs `next start`, dev runs `next dev`. Different ports.

**When to use:** Always — single file makes `pm2 start ecosystem.config.js` manage both.

**Example:**
```javascript
// server/ecosystem.config.js
// Source: PM2 official docs + Promptheus pattern
module.exports = {
  apps: [
    {
      name: "yapu-prod",
      script: "node_modules/.bin/next",
      args: "start -p 3002",
      cwd: "/home/yapu/yapu2",
      env: { NODE_ENV: "production" }
    },
    {
      name: "yapu-dev",
      script: "node_modules/.bin/next",
      args: "dev -p 3003",
      cwd: "/home/yapu/yapu2",
      env: { NODE_ENV: "development" }
    }
  ]
};
```

**Port note:** 3000/3001 are likely taken by existing Promptheus apps. Use 3002/3003. Must verify on VPS with `ss -tlnp | grep LISTEN` before committing to port numbers.

### Pattern 2: next.config.ts distDir for Build Separation

**What:** `distDir` tells `next build` where to write output. `next start` reads from that same dir. `next dev` ignores `distDir` (serves from source via HMR). This prevents prod build from clobbering dev's HMR process.

**When to use:** Always when two instances share one codebase.

**Example:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  distDir: '.next-prod',   // prod build writes here; next start reads here
  turbopack: { root: '.' }
};
```

**Consequence:** The `start` script in package.json still works: `next start` picks up `distDir` from config automatically. The dev PM2 process (`next dev`) runs HMR in memory, no build artifact needed.

### Pattern 3: nginx Bearer Token Access Control (Preview Subdomain)

**What:** nginx `if` block compares `$http_authorization` to expected `"Bearer TOKEN"` value. Returns 403 for non-matching requests. Ember passes the token; browsers don't.

**When to use:** Preview subdomain only. Production subdomain has no auth gate.

**Example:**
```nginx
# /etc/nginx/sites-available/yapu-preview
server {
    listen 443 ssl;
    server_name yapu-preview.promptheus.cloud;

    ssl_certificate /etc/letsencrypt/live/yapu-preview.promptheus.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yapu-preview.promptheus.cloud/privkey.pem;

    # CORS headers for cross-origin Ember access
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;

    # Allow iframe embedding (remove DENY, set frame-ancestors)
    add_header Content-Security-Policy "frame-ancestors *" always;

    # Bearer token gate — Ember passes token, browsers don't
    if ($http_authorization != "Bearer PREVIEW_TOKEN") {
        return 403;
    }

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Note on nginx `if`:** nginx `if` is considered "evil" in complex proxying scenarios but is safe here because the only action inside `if` is `return 403` — no proxy_pass or rewrites inside the block.

### Pattern 4: Content API Route Handler

**What:** POST to `/api/content` validates bearer token, validates body with Zod, writes or patch-merges to `content/data/{locale}/{file}.json`, returns confirmation.

**When to use:** This is EDIT-01 and is the only write path into content files.

**Example:**
```typescript
// app/api/content/route.ts
// Source: Next.js Route Handler docs + Zod docs
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';

const WriteSchema = z.object({
  locale: z.enum(['en', 'fr', 'es']),
  file: z.string().regex(/^[a-z-]+$/),         // slug only, no path traversal
  content: z.record(z.unknown()),               // full replacement
});

const PatchSchema = z.object({
  locale: z.enum(['en', 'fr', 'es']),
  file: z.string().regex(/^[a-z-]+$/),
  patch: z.record(z.unknown()),                 // dot-notation patch fields
});

const RequestSchema = z.union([WriteSchema, PatchSchema]);

export async function POST(request: NextRequest) {
  // 1. Auth check
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CONTENT_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse and validate body
  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 3. Resolve file path (no traversal — validated regex above)
  const { locale, file } = parsed.data;
  const filePath = path.join(process.cwd(), 'content', 'data', locale, `${file}.json`);

  // 4. Write or patch
  if ('content' in parsed.data) {
    await fs.promises.writeFile(filePath, JSON.stringify(parsed.data.content, null, 2));
  } else {
    // patch: read existing, deep-merge at dot-notation path
    const existing = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'));
    const merged = applyPatch(existing, parsed.data.patch);
    await fs.promises.writeFile(filePath, JSON.stringify(merged, null, 2));
  }

  return NextResponse.json({ ok: true, locale, file });
}
```

### Pattern 5: force-dynamic on Content Pages (EDIT-03)

**What:** `export const dynamic = 'force-dynamic'` tells Next.js to re-run the page server function on every request, re-reading content from disk each time.

**When to use:** Every page that calls `readContent()`. This is the mechanism that makes content edits visible without a rebuild.

**Example:**
```typescript
// app/[locale]/page.tsx (and all other content pages)
export const dynamic = 'force-dynamic';

export default async function HomePage({ params }) {
  const { locale } = await params;
  const content = readContent<PageContent>('homepage', locale); // reads disk fresh
  // ...
}
```

**Confirmed by:** Next.js official docs — `force-dynamic` is equivalent to setting every fetch to `{ cache: 'no-store', next: { revalidate: 0 } }`. For pages using `fs.readFileSync` (not fetch), the effect is the same: no build-time static generation, no cached HTML.

### Pattern 6: Extended Deploy Script

**What:** `server/deploy.sh` extended from Promptheus base pattern. `--prod` builds and restarts `yapu-prod`, `--dev` restarts `yapu-dev` (no build needed for dev), `--all` does both.

**Example:**
```bash
#!/bin/bash
set -e
APP_DIR="${APP_DIR:-/home/yapu/yapu2}"
TARGET="${1:-all}"   # --prod | --dev | --all

deploy_prod() {
  cd "$APP_DIR"
  git pull origin master
  if ! git diff HEAD~1 --quiet -- package-lock.json 2>/dev/null; then
    npm ci
  fi
  npm run build   # writes to .next-prod/ via distDir in next.config.ts
  pm2 restart ecosystem.config.js --only yapu-prod
}

deploy_dev() {
  cd "$APP_DIR"
  git pull origin master
  if ! git diff HEAD~1 --quiet -- package-lock.json 2>/dev/null; then
    npm ci
  fi
  pm2 restart ecosystem.config.js --only yapu-dev
  # No build — next dev serves from source
}

case "$TARGET" in
  --prod) deploy_prod ;;
  --dev)  deploy_dev ;;
  --all)  deploy_prod && deploy_dev ;;
  *)      echo "Usage: deploy.sh [--prod|--dev|--all]"; exit 1 ;;
esac

echo "Deploy done at $(date)"
```

### Anti-Patterns to Avoid

- **Sharing `.next/` between instances:** Both `next start` and `next dev` use the same directory by default. If both run concurrently without `distDir`, the dev process can corrupt the prod build output.
- **Running `next dev` for production:** Dev mode is slow, insecure, and not optimized. Prod always uses `next start` against a built artifact.
- **Writing bearer token to nginx config with hardcoded value:** The token in nginx config is the preview-access token (low-risk; only gates HMR preview). The Content API secret must live in `.env.local`, not nginx.
- **Using `next build` for the dev PM2 process:** Dev uses HMR directly — no build step needed, no `distDir` written. Only `yapu-prod` ever runs `next build`.
- **Putting the Content API on both instances:** Prod only is the right call. The dev instance is for code editing (Tier 2, Phase 7); content writes should always target production.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON schema validation in Content API | Custom type guards / if chains | Zod `z.object().safeParse()` | Zod gives typed errors, safe parse, TypeScript inference, path traversal protection |
| Token comparison | Timing-attack-safe comparison | Simple strict equality is fine for static bearer token (not HMAC) | Token is compared against env var, not a database lookup; no timing oracle risk with fixed-length token |
| SSL certificate management | Manual openssl | `certbot --nginx -d domain` | Auto-renewal, nginx integration, trusted CA chain |
| Process supervision | `nohup` or `screen` | PM2 | PM2 persists across reboots via `pm2 save` + `pm2 startup` |
| nginx bearer token validation | Complex Lua/auth_request | `if ($http_authorization != "Bearer TOKEN")` | For single static token, `if` block is correct and safe |

---

## Common Pitfalls

### Pitfall 1: Port Conflicts on Shared VPS

**What goes wrong:** `EADDRINUSE` error when PM2 tries to start on port 3000 or 3001 because other Promptheus apps already occupy those ports.

**Why it happens:** The CONTEXT.md explicitly flags this. Ports 3000/3001 are mentioned in REQUIREMENTS.md as initial assumptions, not verified values.

**How to avoid:** Before committing to port numbers in ecosystem.config.js, verify with `ss -tlnp | grep LISTEN` or `netstat -tlnp` on the VPS. Assign yapu-prod and yapu-dev to the first two free ports above 3001 (likely 3002 and 3003 given other Promptheus apps use 3000/3001).

**Warning signs:** PM2 logs show `EADDRINUSE`; `pm2 list` shows apps as `errored`.

### Pitfall 2: next.config.ts distDir and next start Mismatch

**What goes wrong:** `next start` cannot find the build because it looks in `.next/` while `next build` wrote to `.next-prod/`.

**Why it happens:** `next start` reads `distDir` from `next.config.ts` only if the config is loaded — which it is when running via the `next` CLI from the project root. This should work correctly. But if someone runs `next start` without the config (e.g., from a different cwd), it breaks.

**How to avoid:** Always run `next start` from the project root. Set `cwd` explicitly in ecosystem.config.js. Test the full `npm run build && next start` flow after adding `distDir`.

**Warning signs:** `Error: Could not find a production build in the '.next' directory`.

### Pitfall 3: nginx `if` and proxy_pass Interaction

**What goes wrong:** Placing `proxy_pass` inside an nginx `if` block causes unpredictable behavior (the "if is evil" rule).

**Why it happens:** nginx processes `if` in location context differently — the block only sets variables and return codes safely. proxy_pass inside `if` is not safe.

**How to avoid:** Put `return 403` inside the `if` block (safe). Put `proxy_pass` outside the `if` block at the location level. The `if` runs first and short-circuits; proxy_pass is only reached if auth passes.

**Warning signs:** nginx config test (`nginx -t`) warnings; 500 errors on proxied requests.

### Pitfall 4: Content API Path Traversal

**What goes wrong:** A malicious POST with `file: "../../etc/passwd"` overwrites system files.

**Why it happens:** `path.join(process.cwd(), 'content', 'data', locale, file + '.json')` with an unsanitized `file` param can traverse the filesystem.

**How to avoid:** Validate `file` with Zod regex: `z.string().regex(/^[a-z-]+$/)` — only lowercase letters and hyphens, no slashes, no dots.

**Warning signs:** Any file path that contains `/` or `.` slipping through validation.

### Pitfall 5: force-dynamic on Pages with generateStaticParams

**What goes wrong:** Mixing `force-dynamic` with `generateStaticParams` causes a build error. Static param generation and force-dynamic are incompatible.

**Why it happens:** `generateStaticParams` is for SSG; `force-dynamic` forces SSR. They conflict.

**How to avoid:** Remove `generateStaticParams` from any page that uses `force-dynamic`. For the locale pages (which currently generate static params), choose: either SSG (fast, no content edit support) or force-dynamic (SSR, content edits work). Phase 2 decision is `force-dynamic` for all content pages.

**Warning signs:** Build error: "Page cannot use both `generateStaticParams` and `force-dynamic`".

### Pitfall 6: PM2 Startup Not Saved After Changes

**What goes wrong:** VPS reboots; PM2 does not restart apps because `pm2 save` was not run after changes.

**Why it happens:** `pm2 startup` generates the init script, but `pm2 save` is needed to write the current process list to the dump file. Without `pm2 save`, the init script restores the old or empty list.

**How to avoid:** Run `pm2 save` after every ecosystem change (adding apps, changing ports). Include in deploy script as the final step.

**Warning signs:** After reboot, `pm2 list` shows no processes.

### Pitfall 7: certbot on Shared VPS — Existing nginx Conflicts

**What goes wrong:** certbot's nginx plugin modifies nginx config files it finds, potentially breaking existing Promptheus app configs.

**Why it happens:** `certbot --nginx` auto-edits the matched server block. On a shared VPS with multiple configs, it may target the wrong file.

**How to avoid:** Use `certbot certonly --nginx -d yapu.promptheus.cloud` (obtains cert without editing config), then manually add SSL directives to the nginx config files. Or use `certbot --nginx` but only after verifying the correct config file is matched. Run `nginx -t` before and after.

**Warning signs:** nginx fails to reload after certbot; other apps stop responding.

---

## Code Examples

Verified patterns from official sources:

### PM2 Ecosystem Config — Two Apps, Different Ports
```javascript
// server/ecosystem.config.js
// Source: https://pm2.keymetrics.io/docs/usage/application-declaration/
module.exports = {
  apps: [
    {
      name: "yapu-prod",
      script: "node_modules/.bin/next",
      args: "start -p 3002",
      cwd: "/home/yapu/yapu2",
      env: { NODE_ENV: "production" }
    },
    {
      name: "yapu-dev",
      script: "node_modules/.bin/next",
      args: "dev -p 3003",
      cwd: "/home/yapu/yapu2",
      env: { NODE_ENV: "development" }
    }
  ]
};
```

### PM2 Commands
```bash
pm2 start ecosystem.config.js              # start all
pm2 start ecosystem.config.js --only yapu-prod   # prod only
pm2 start ecosystem.config.js --only yapu-dev    # dev only
pm2 restart ecosystem.config.js --only yapu-prod # restart prod
pm2 save                                         # persist process list
pm2 startup                                      # generate init script (run once)
pm2 list                                         # check status
```

### next.config.ts with distDir
```typescript
// next.config.ts
// Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/distDir
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  distDir: '.next-prod',   // prod build output; next start reads this automatically
  turbopack: { root: '.' }
};
```

### Route Handler Auth Check (EDIT-01)
```typescript
// app/api/content/route.ts
// Source: Next.js Route Handler docs (https://nextjs.org/docs/app/getting-started/route-handlers)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import fs from 'node:fs/promises';
import path from 'node:path';

const BodySchema = z.object({
  locale: z.enum(['en', 'fr', 'es']),
  file: z.string().regex(/^[a-z-]+$/),
  content: z.record(z.unknown()).optional(),
  patch: z.record(z.unknown()).optional(),
}).refine(d => d.content || d.patch, { message: 'Provide either content or patch' });

export async function POST(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!auth || auth !== `Bearer ${process.env.CONTENT_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const rawBody = await request.json().catch(() => null);
  const result = BodySchema.safeParse(rawBody);
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 });
  }
  const { locale, file, content, patch } = result.data;
  const filePath = path.join(process.cwd(), 'content', 'data', locale, `${file}.json`);
  if (content) {
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf-8');
  } else if (patch) {
    const existing = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    const merged = deepMergePatch(existing, patch);
    await fs.writeFile(filePath, JSON.stringify(merged, null, 2), 'utf-8');
  }
  return NextResponse.json({ ok: true, locale, file });
}
```

### nginx Production Subdomain Config
```nginx
# /etc/nginx/sites-available/yapu-prod
# Source: Promptheus nginx.conf.template pattern + nginx docs
server {
    listen 80;
    server_name yapu.promptheus.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yapu.promptheus.cloud;

    ssl_certificate /etc/letsencrypt/live/yapu.promptheus.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yapu.promptheus.cloud/privkey.pem;

    add_header X-Content-Type-Options "nosniff" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location /_next/static {
        proxy_pass http://127.0.0.1:3002;
        expires 365d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### nginx Preview Subdomain Config (with Bearer Token Gate)
```nginx
# /etc/nginx/sites-available/yapu-preview
server {
    listen 80;
    server_name yapu-preview.promptheus.cloud;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yapu-preview.promptheus.cloud;

    ssl_certificate /etc/letsencrypt/live/yapu-preview.promptheus.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yapu-preview.promptheus.cloud/privkey.pem;

    # Allow Ember (unknown origin) to embed via iframe
    add_header Content-Security-Policy "frame-ancestors *" always;
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;

    # Simple bearer token gate — safe use of if (only returns, no proxy inside)
    if ($http_authorization != "Bearer PREVIEW_ACCESS_TOKEN") {
        return 403;
    }

    location / {
        proxy_pass http://127.0.0.1:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Certbot for Multiple Subdomains on Shared VPS
```bash
# Obtain certs without auto-editing nginx config (safer on shared VPS)
certbot certonly --nginx -d yapu.promptheus.cloud
certbot certonly --nginx -d yapu-preview.promptheus.cloud

# Or combined:
certbot certonly --nginx -d yapu.promptheus.cloud -d yapu-preview.promptheus.cloud
# Note: combined cert requires BOTH subdomains pointed to VPS IP before running
```

### force-dynamic on Content Pages (EDIT-03)
```typescript
// app/[locale]/page.tsx
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = 'force-dynamic';

// Remove generateStaticParams if present — incompatible with force-dynamic
```

### DNS Records (for user documentation)
```
Type  Host                     Value          TTL
A     yapu.promptheus.cloud    187.77.66.133  3600
A     yapu-preview.promptheus.cloud  187.77.66.133  3600
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `getServerSideProps` for SSR | `export const dynamic = 'force-dynamic'` | Next.js 13+ App Router | Same effect, different syntax |
| PM2 cluster mode for scale | PM2 fork mode for two different apps | N/A | Cluster mode is for horizontal scaling; fork mode is correct for two different processes |
| `nginx allow/deny` for IP-based access | `if ($http_authorization)` for token-based access | N/A | Token better than IP for remote clients like Ember on unknown host |
| `next build --no-cache` | `distDir` in config | Next.js 9.1+ | `distDir` cleanly separates build outputs; no flag needed on build command |

---

## Open Questions

1. **Port availability on VPS**
   - What we know: REQUIREMENTS.md assumes 3000/3001; CONTEXT.md flags these may be taken
   - What's unclear: Exact ports used by other Promptheus apps
   - Recommendation: The planning step (Wave 0 of the plan) must include a VPS verification task to run `ss -tlnp` and confirm port availability before writing ecosystem.config.js

2. **nginx and certbot pre-installed?**
   - What we know: Promptheus setup.sh installs them; at least one other project is deployed on the same VPS
   - What's unclear: Whether the exact versions are current and whether certbot's auto-renewal cron is configured
   - Recommendation: Plan includes a VPS audit task (check `nginx -v`, `certbot --version`, `pm2 --version`) before installation steps

3. **distDir + next dev interaction**
   - What we know: Official docs confirm `next dev` does not use `distDir` — it serves from source
   - What's unclear: Whether HMR websocket (used by `next dev`) passes through nginx `Upgrade` headers correctly with the proxy config
   - Recommendation: Plan includes a smoke test: `next dev` via nginx proxy with curl and a browser; verify HMR websocket connects

4. **Patch merge implementation**
   - What we know: CONTEXT.md requires partial patch support (`{ "patch": { "hero.title": "New Title" } }`)
   - What's unclear: Whether patch uses dot-notation paths (e.g., `"hero.title"`) or nested objects (e.g., `{ "hero": { "title": "..." } }`)
   - Recommendation: Plan should decide on format. Nested objects are simpler to implement (deep-merge with `Object.assign` / lodash merge). Dot-notation requires a path resolver (`set-value` or hand-rolled). Use nested object format for Phase 2 simplicity.

5. **Content API on prod-only vs both instances**
   - What we know: CONTEXT.md marks this as Claude's discretion
   - Recommendation: Prod-only. The Content API writes to `content/data/` on disk. Since both PM2 processes share the same git repo directory, a write on prod is immediately visible to both instances. Putting the API on both would create two competing write paths with no coordination. Prod only is safer and simpler.

6. **Subdomain naming**
   - Claude's discretion per CONTEXT.md
   - Recommendation: `yapu.promptheus.cloud` (production) and `yapu-preview.promptheus.cloud` (dev/preview). Consistent with Promptheus naming pattern.

---

## Decisions Made in This Research

These should be codified in the plan:

| Decision | Rationale |
|----------|-----------|
| Subdomains: `yapu.promptheus.cloud` + `yapu-preview.promptheus.cloud` | Clear, consistent with Promptheus naming |
| PM2 app names: `yapu-prod` + `yapu-dev` | Matches subdomain semantics |
| Ports: 3002 (prod) + 3003 (dev) — tentative | Assumes 3000/3001 taken; must verify on VPS |
| Auth mechanism: Bearer token in Authorization header | Simpler than API key; standard for Ember HTTP calls |
| `CONTENT_API_SECRET` env var for bearer token | Never in git; loaded from `.env.local` on VPS |
| Content API on prod only | Single write path; both processes share same `content/data/` directory |
| Patch format: nested object (deep-merge) | Simpler than dot-notation for Phase 2 |
| 403 response style: generic JSON `{ "error": "Forbidden" }` | No HTML needed; Ember reads the response, not a browser |
| `distDir: '.next-prod'` in next.config.ts | Prod build output separated from default `.next/`; dev ignores it |
| `force-dynamic` on all content pages from day one | Established project decision (from STATE.md); enables instant content edits |
| Remove `generateStaticParams` from content pages | Incompatible with `force-dynamic` |

---

## Sources

### Primary (HIGH confidence)
- [Next.js Route Handlers docs](https://nextjs.org/docs/app/getting-started/route-handlers) — POST handlers, HTTP methods, caching behavior
- [Next.js Route Segment Config docs](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config) — `force-dynamic` behavior, incompatibility with `generateStaticParams`
- [Next.js Self-Hosting docs](https://nextjs.org/docs/app/guides/self-hosting) — `distDir`, filesystem caching, nginx streaming
- [Next.js distDir docs](https://nextjs.org/docs/app/api-reference/config/next-config-js/distDir) — custom build output directory
- [PM2 Ecosystem File docs](https://pm2.keymetrics.io/docs/usage/application-declaration/) — multiple apps array, `--only` flag
- [Zod docs](https://zod.dev/) — `safeParse`, schema definition, TypeScript inference

### Secondary (MEDIUM confidence)
- [Nginx CORS guide](https://enable-cors.org/server_nginx.html) — CORS header patterns verified against nginx module docs
- [MDN X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options) — `frame-ancestors` CSP as modern replacement
- [Let's Encrypt community — adding new domain](https://community.letsencrypt.org/t/adding-new-domain-on-nginx/70544) — certbot on shared VPS with existing sites
- Promptheus `server/nginx.conf.template` — project-specific nginx pattern (project codebase)
- Promptheus `server/deploy.sh` — project-specific deploy pattern (project codebase)

### Tertiary (LOW confidence)
- nginx `if` block bearer token check: confirmed pattern from multiple sources but `if` in nginx is documented as "evil" — verified that `return 403` inside `if` is the safe exception to the rule

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — PM2, nginx, certbot, Next.js Route Handlers all verified from official docs
- Architecture (two-instance distDir): MEDIUM — `distDir` is documented; the specific two-PM2-process-sharing-one-repo pattern has no prior art in this project; needs a spike verification in Wave 0 of the plan
- Content API: HIGH — Route Handler POST + fs.writeFile + Zod all confirmed from official sources; file writes work on self-hosted VPS (not Vercel serverless)
- force-dynamic for SSR: HIGH — confirmed from Next.js Route Segment Config docs; incompatibility with generateStaticParams confirmed
- Pitfalls: HIGH — port conflicts, path traversal, nginx if-proxy interaction all well-documented

**Research date:** 2026-02-26
**Valid until:** 2026-05-26 (stable infra stack — 90 days)
