# Phase 7: Ember Tier 2 + Deploy - Research

**Researched:** 2026-02-27
**Domain:** Chatbot-driven code/CSS/color editing via dev server HMR + production deploy trigger
**Confidence:** HIGH — all components are running live on VPS and their source is fully readable locally

---

## Summary

Phase 7 upgrades the existing Ember-YAPU integration from Tier 2 (content-only edits) to Tier 3 (full code editing: `.tsx`, `.css`, `globals.css` color changes). The core workflow is: Ember edits files on the dev server → HMR updates the preview URL immediately → user confirms → Ember triggers `next build` + `pm2 restart yapu-prod` to push to production.

The good news: almost all infrastructure is already running. `yapu-dev` (port 3008) runs `next dev` on the VPS, nginx proxies `yapu-preview.promptheus.cloud` to it with the right headers, and the preview URL returns a 200 with full Turbopack-powered HTML. The Ember codebase already has `isEditAllowed()` with Tier 3 support for `components/`, `app/`, `lib/`, `public/` — and `deploy.js` already calls `npm run build` + `pm2 restart ecosystem.config.js`.

The critical issues to solve are: (1) `ember-yapu` is running at **CUSTOMER_TIER=2** — upgrading to Tier 3 requires changing `.env` and restarting PM2; (2) `isEditAllowed()` must include `app/globals.css` edits — currently Tier 3 allows `app/` already so this is covered; (3) the **WebSocket path** for HMR (`/_next/webpack-hmr`) is blocked by the nginx bearer token gate for browser WebSocket connections — the HMR client cannot send the bearer token via WebSocket headers; (4) `deployToProduction()` currently restarts `ecosystem.config.js` (all apps) instead of only `yapu-prod`.

**Primary recommendation:** Make `yapu-dev` run in `fork_mode` (not `cluster_mode`), open `/_next/webpack-hmr` in nginx as an unrestricted WebSocket endpoint (the preview URL is the only traffic isolation needed — HMR WS on a locked-down server is acceptable), upgrade `ember-yapu` to Tier 3, fix `deployToProduction()` to restart only `yapu-prod`, update the system prompt in `context.js` for the Tier 3 workflow, and add `globals.css` color editing to the system prompt's examples.

---

## VPS State (Verified 2026-02-27)

Critical facts discovered by SSH inspection:

| Component | State | Notes |
|-----------|-------|-------|
| `ember-yapu` PM2 process | Running at port 3009 | Located at `/home/ember-yapu/`, `.env` (not `.env.local`) |
| `ember-yapu` CUSTOMER_TIER | **2** | Must change to 3 for code editing |
| `ember-yapu` WEBSITE_REPO_PATH | `/home/yapu/yapu2` | Correct |
| `ember-yapu` nginx | `ember.yapu.promptheus.cloud` → port 3009 | SSL + proxy_buffering off |
| `yapu-dev` PM2 | Running at port 3008, **cluster_mode** | Must be `fork_mode` for `next dev` |
| `yapu-dev` nginx | `yapu-preview.promptheus.cloud` → port 3008 | Bearer token gate active, SSL + `Content-Security-Policy: frame-ancestors *` |
| `yapu-prod` PM2 | Running at port 3003 | Production; `distDir: '.next-prod'` in next.config.ts |
| Preview URL | Returns HTTP 200 | `yapu-preview.promptheus.cloud` resolves, HMR JS included in HTML |
| Turbopack HMR WS path | `/_next/webpack-hmr?id=...` | WebSocket, NOT Server-Sent Events |
| Preview bearer token | `qm6okJXWiDfSix+aISArZmVlOFHs9M+NCtenHEYZmuU=` | Hardcoded in nginx; NOT in Ember's `.env` |

---

## Standard Stack

### Core (already built — do not rebuild)

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| `isEditAllowed()` Tier 3 | `promptheus-ember/lib/tools.js:117` | Allows `components/`, `app/`, `lib/`, `public/` for tier >= 3 | Exists — just needs CUSTOMER_TIER=3 |
| `deployToProduction()` | `promptheus-ember/lib/deploy.js` | `npm run build` + `pm2 restart` | Exists — needs fix: target only `yapu-prod` |
| `buildPreview()` | `promptheus-ember/lib/preview.js` | Builds + starts preview server | Exists — NOT appropriate for this setup; we use the running `yapu-dev` instead |
| `yapu-dev` PM2 process | VPS port 3008 | `next dev` with Turbopack HMR | Running — needs `fork_mode` fix |
| `nginx-yapu-preview.conf` | VPS `/etc/nginx/sites-available/yapu-preview-new` | Bearer-gated proxy to port 3008 | Active — needs WebSocket fix for HMR |
| `context.js` Tier 3 system prompt | `promptheus-ember/lib/context.js:143` | Tier 3 retains preview+deploy flow | Exists — needs YAPU-specific customization |
| `website_edit` tool | `promptheus-ember/lib/tools.js:216` | File write + git commit | Works at Tier 3 — no changes needed |
| `ecosytem.config.js` | `/home/yapu/yapu2/server/ecosystem.config.js` | PM2 config for `yapu-dev` and `yapu-prod` | Must add `exec_mode: 'fork'` to `yapu-dev` |

### Gaps to Fill

| Gap | What's Missing | Solution |
|-----|----------------|----------|
| CUSTOMER_TIER | `ember-yapu` `.env` has TIER=2 | Change to 3, restart PM2 |
| `deployToProduction()` targets wrong app | Calls `pm2 restart ecosystem.config.js` (all apps) | Fix to `pm2 restart ecosystem.config.js --only yapu-prod` |
| HMR WebSocket blocked by bearer gate | `/_next/webpack-hmr` needs WS upgrade, but browser can't send bearer token via WebSocket | Add separate `location /_next/webpack-hmr` in nginx with no bearer gate (or allow `location ~* /_next/(webpack-hmr|static)` without auth) |
| `yapu-dev` cluster_mode | `next dev` doesn't fully support cluster mode; HMR may be impaired | Add `exec_mode: 'fork'` to ecosystem.config.js `yapu-dev` entry + `pm2 restart` |
| Tier 3 system prompt | Current Tier 3 prompt is generic; YAPU needs YAPU-specific instructions | Update `context.js` with YAPU preview URL, deploy instructions |
| `globals.css` in system prompt | Not currently loaded into Ember's `editableContent` context | Include `app/globals.css` in `loadEditableContent()` for color editing guidance |
| `app/` allowed for edits but not loaded | `isEditAllowed` allows `app/` but `loadEditableContent` only reads JSON + messages | Add `app/globals.css` to context so Claude knows the color variables |
| Preview URL in Ember `.env` | `PREVIEW_DOMAIN=preview.yapu.promptheus.cloud` is present but `PREVIEW_PORT=3010` is wrong (dev is on 3008) | Update `PREVIEW_PORT=3008` and use `yapu-preview.promptheus.cloud` as the preview URL |

---

## Architecture Patterns

### Phase 7 Tier 3 Workflow

```
User types: "Change the YAPU primary color to a deeper teal"
    ↓ Ember reads app/globals.css via website_read
    ↓ Claude finds --primary OKLCH value
    ↓ Claude shows: "I'll change --primary from oklch(0.35 0.08 201) to oklch(0.28 0.09 201) — want me to do that?"
    ↓ User confirms
    ↓ Claude calls website_edit → globals.css updated on disk
    ↓ yapu-dev (next dev) detects file change → Turbopack HMR fires
    ↓ iframe at yapu-preview.promptheus.cloud reloads the changed CSS automatically
    ↓ Claude: "Ich habe die Farbe geändert. Hier ist die Vorschau: https://yapu-preview.promptheus.cloud"

User types: "Deploy to production"
    ↓ Claude calls deploy tool
    ↓ deployToProduction() runs: npm run build --cwd /home/yapu/yapu2
    ↓ pm2 restart ecosystem.config.js --only yapu-prod
    ↓ yapu-prod serves the new build
    ↓ Claude: "Ihre Änderungen sind jetzt live: https://yapu.promptheus.cloud"
```

### Pattern 1: HMR via nginx WebSocket Proxy

Next.js Turbopack dev server connects via WebSocket to `/_next/webpack-hmr?id=...` on the same host+port as the page. The browser HMR client code is:

```javascript
// Source: confirmed from VPS chunk node_modules_next_dist_client_17643121._.js
new window.WebSocket(`${getSocketUrl(assetPrefix)}/_next/webpack-hmr?id=${self.__next_r}`)
```

The WebSocket connects to the same domain as the page (via `getSocketUrl`). When the page is served via `yapu-preview.promptheus.cloud`, the HMR WebSocket also connects to `wss://yapu-preview.promptheus.cloud/_next/webpack-hmr`.

**Problem:** Browser WebSocket API does not support custom headers — no `Authorization` header can be sent. The nginx bearer token gate will block this request.

**Solution:** Add a separate nginx location for `/_next/webpack-hmr` that bypasses the bearer gate:

```nginx
# nginx location for HMR WebSocket — no bearer gate (only served via preview subdomain)
location = /_next/webpack-hmr {
    proxy_pass http://127.0.0.1:3008;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;
}
```

Security note: `yapu-preview.promptheus.cloud` is already isolated from production (port 3008, separate from port 3003). The bearer gate on the page itself prevents casual browsing. Opening just `/_next/webpack-hmr` without auth is acceptable — it only streams compiled file hashes, not site content.

### Pattern 2: `next dev` in fork_mode (not cluster_mode)

The current `yapu-dev` PM2 entry runs in `cluster_mode` (inherited from PM2 default when `instances: 1`). Next.js `next dev` is a single-process dev server — cluster mode is incorrect and can interfere with file watching and HMR. The ecosystem.config.js must explicitly set:

```javascript
// server/ecosystem.config.js — yapu-dev entry fix
{
  name: "yapu-dev",
  script: "node_modules/.bin/next",
  args: "dev -p 3008",
  cwd: "/home/yapu/yapu2",
  exec_mode: "fork",    // ADD THIS — prevents cluster_mode default
  instances: 1,
  env: {
    NODE_ENV: "development",
    PORT: "3008"
  },
  autorestart: true,
  max_memory_restart: "512M"
}
```

After changing this, run: `pm2 restart ecosystem.config.js --only yapu-dev` (or `pm2 delete yapu-dev && pm2 start ecosystem.config.js --only yapu-dev`).

### Pattern 3: deployToProduction() Fix

Current `deploy.js` on VPS calls `pm2 restart ecosystem.config.js` (restarts ALL apps). Fix:

```javascript
// Source: /home/ember-yapu/lib/deploy.js — line to fix
// CURRENT (wrong — restarts all):
await execAsync('pm2 restart ecosystem.config.js', { cwd: repoPath, timeout: 10000 });

// FIXED (restarts only yapu-prod):
await execAsync('pm2 restart ecosystem.config.js --only yapu-prod', { cwd: repoPath, timeout: 10000 });
```

Also: `distDir: '.next-prod'` is set in `next.config.ts`. `npm run build` uses this path. `yapu-prod` runs `next start` which reads from `.next-prod/`. This is already correct — no changes needed to the build command.

### Pattern 4: `globals.css` Color Editing (EDIT-10)

The YAPU color palette lives in `app/globals.css` under `:root` as OKLCH CSS custom properties. `isEditAllowed()` at Tier 3 already allows `app/` — so `website_edit` on `app/globals.css` will succeed.

The gap is that `loadEditableContent()` in `context.js` only reads `content/data/` and `messages/` JSON files. Claude needs to see the CSS color variables to know what to edit. Solution:

```javascript
// Add to loadEditableContent() in context.js, after loading messages:
// Read globals.css for color palette context
const globalsCssPath = join(repoPath, 'app', 'globals.css');
const globalsCss = await safeReadFile(globalsCssPath);
if (globalsCss) {
  sections.push(`### app/globals.css (YAML color tokens — OKTCH)\n\`\`\`css\n${globalsCss}\n\`\`\``);
}
```

This loads the full CSS into Ember's system prompt so Claude can find `--primary`, `--accent`, `--brand` and suggest exact OKLCH replacements.

### Pattern 5: Tier 3 System Prompt for YAPU

The current Tier 3 system prompt branch in `context.js:143` is generic. It needs YAPU-specific instructions:

```javascript
// context.js — Tier 3 workflowInstructions for YAPU
const workflowInstructions = tier === 2
  ? `/* existing Tier 2 YAPU prompt */`
  : `## Workflow (Code-Aenderungen — Tier 3)

1. Kunde beschreibt was er aendern will
2. Du liest die relevante Datei (website_read)
3. Du zeigst dem Kunden was du aendern willst und fragst nach Bestaetigung
4. Nach Bestaetigung machst du die Aenderung (website_edit)
5. Du gibst dem Kunden den Vorschau-Link: ${previewUrl || 'https://yapu-preview.promptheus.cloud'}
6. Nach Bestaetigung der Vorschau: Du schaltest live (deploy)

WICHTIG:
- Fuehre KEINE Aenderung durch ohne explizite Bestaetigung des Kunden
- Farbaenderungen: Aendere die CSS Custom Properties in app/globals.css (OKLCH-Werte unter :root)
- Fuehre NIEMALS deploy aus ohne explizite Freigabe des Kunden
- Nach deploy ist die Webseite live unter: ${websiteUrl || 'https://yapu.promptheus.cloud'}`;
```

Note: a `previewUrl` env var should be added to Ember's `.env` — similar to how `WEBSITE_URL` was added in Phase 6.

### Anti-Patterns to Avoid

- **Calling `buildPreview()` from `preview.js`:** This does `npm run build` + starts a NEW Next.js process. YAPU already has a running `yapu-dev` dev server with HMR. Do NOT call `buildPreview()`. The preview is the existing dev server URL, not a new built instance.
- **Restarting `yapu-dev` as part of deploy:** Deploy should ONLY restart `yapu-prod`. The dev server must stay running for HMR to continue working.
- **Running `next dev` in cluster_mode:** One process handles all file watching and HMR. Multiple instances of `next dev` would each start their own separate Turbopack process, and HMR would be inconsistent.
- **Putting bearer gate on `/_next/webpack-hmr`:** The browser cannot send Authorization headers via WebSocket. The bearer gate must be absent or bypassed for this specific path.
- **Changing `WEBSITE_REPO_PATH`:** It correctly points to `/home/yapu/yapu2`. Ember edits files there directly, and the running `yapu-dev` watches the same directory — so HMR fires on Ember's file writes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HMR transport | Custom file-watch loop | Existing `yapu-dev` (next dev + Turbopack) | Already running, already watching `/home/yapu/yapu2` |
| Build triggering | Custom build script | `deployToProduction()` in `deploy.js` | Already calls `npm run build` correctly |
| PM2 restart | SSH from Ember | `execAsync('pm2 restart ...')` in `deploy.js` | PM2 is already installed on VPS and accessible from Ember's cwd |
| Preview iframe | Embedding prod in iframe | Nginx-proxied `yapu-preview.promptheus.cloud` | Already live, already has `Content-Security-Policy: frame-ancestors *` |
| Color editing UI | Custom color picker widget | Natural language → `website_edit` on `globals.css` | Claude understands OKLCH color requests; direct file edit is instant |

**Key insight:** Almost all the machinery exists. Phase 7 is primarily about unlocking Tier 3 (`CUSTOMER_TIER=3`), fixing two concrete bugs (cluster_mode + wrong PM2 restart target), and adding HMR WebSocket pass-through to nginx.

---

## Common Pitfalls

### Pitfall 1: HMR WebSocket Blocked by Bearer Gate
**What goes wrong:** After Ember edits a `.tsx` file, the browser never sees the HMR update — it has to manually refresh. Browser console shows `WebSocket connection to 'wss://yapu-preview.promptheus.cloud/_next/webpack-hmr' failed`.
**Why it happens:** The nginx bearer token gate applies to ALL requests on `yapu-preview.promptheus.cloud`. The browser WebSocket API cannot send custom Authorization headers.
**How to avoid:** Add `location = /_next/webpack-hmr { ... }` BEFORE the `location /` block in nginx, with WebSocket upgrade headers but no bearer check.
**Warning signs:** Browser console shows "WebSocket connection failed" on the preview domain. Page works, but changes don't auto-reflect without a manual refresh.

### Pitfall 2: `yapu-dev` Running in cluster_mode Impairs HMR
**What goes wrong:** File changes may not trigger HMR consistently. `next dev` is single-process by design — cluster mode forks it, and the child process may not handle Turbopack's file watcher correctly.
**Why it happens:** PM2's default when `instances: 1` is specified without `exec_mode: 'fork'` may sometimes default to cluster. Confirmed on VPS: `exec mode = cluster_mode`.
**How to avoid:** Add `exec_mode: 'fork'` to the `yapu-dev` entry in `ecosystem.config.js`, commit, push, and restart.
**Warning signs:** HMR shows "connected" in browser but changes don't reflect. Dev server logs show multiple worker processes.

### Pitfall 3: Deploy Restarts ALL Apps (including `yapu-dev`)
**What goes wrong:** When Ember triggers deploy, `pm2 restart ecosystem.config.js` restarts both `yapu-prod` AND `yapu-dev`. The dev server goes down briefly, HMR disconnects, and the user experience breaks.
**Why it happens:** Current `deploy.js` calls `pm2 restart ecosystem.config.js` without `--only yapu-prod`.
**How to avoid:** Fix `deploy.js` to use `pm2 restart ecosystem.config.js --only yapu-prod`. This leaves `yapu-dev` untouched.
**Warning signs:** After deploy, the preview URL returns 502 briefly. Browser shows HMR disconnected.

### Pitfall 4: `globals.css` Edit Not in Claude's Context
**What goes wrong:** User asks "change the brand color to X", Claude doesn't know what variables exist in `globals.css` and guesses wrong names or values.
**Why it happens:** `loadEditableContent()` only loads `content/data/` JSON and `messages/` JSON. `globals.css` is not included.
**How to avoid:** Add `globals.css` loading to `loadEditableContent()` as shown in Pattern 4 above.
**Warning signs:** Claude says "I cannot find the color variables" or edits the wrong property.

### Pitfall 5: `next build` Build Output Goes to `.next-prod/`
**What goes wrong:** After `npm run build`, PM2 restarts `yapu-prod` which calls `next start`. If `next start` reads `.next/` but the build wrote to `.next-prod/`, the wrong (old) build is served.
**Why it happens:** `next.config.ts` sets `distDir: '.next-prod'`. `next start` respects this and reads from `.next-prod/`. This is ALREADY CORRECT — no bug here.
**How to avoid:** Do NOT change `next.config.ts`. The current setup is correct: build writes to `.next-prod/`, prod reads from `.next-prod/`.
**Warning signs:** After deploy, production still shows old content. Check `ls -lt /home/yapu/yapu2/.next-prod/` to verify build timestamp.

### Pitfall 6: `website_edit` on `.tsx` Files With JSX
**What goes wrong:** Claude reads a `.tsx` file with JSX, proposes an `old_text` that includes angle-bracket JSX syntax, but the match fails because the actual file uses slightly different whitespace or indentation.
**Why it happens:** `website_edit` uses exact string matching (`content.includes(old_text)`). JSX is sensitive to formatting.
**How to avoid:** System prompt must instruct Claude to read the file first, use uniquely identifying longer strings as `old_text`, never guess the formatting. The existing instruction "liest die Datei zuerst" is already in the Tier 3 prompt.
**Warning signs:** Tool returns "Der zu ersetzende Text wurde nicht gefunden." Claude retries with slightly different text.

### Pitfall 7: `ember-yapu` Port Confusion (3005 vs 3009)
**What goes wrong:** Planning docs reference port 3005, but the actual running process uses port 3009. Any nginx config changes that reference 3005 will fail.
**Why it happens:** The Phase 6 plan referenced port 3005, but the final VPS deployment used 3009 (confirmed via PM2 info and `.env` file: `PORT=3009`).
**How to avoid:** Always use port 3009 for `ember-yapu` in any nginx or PM2 config changes.
**Warning signs:** nginx config test succeeds but Ember is unreachable after config reload.

---

## Code Examples

### Fix 1: ecosystem.config.js — fork_mode for yapu-dev

```javascript
// Source: /home/yapu/yapu2/server/ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "yapu-prod",
      script: "node_modules/.bin/next",
      args: "start -p 3003",
      cwd: "/home/yapu/yapu2",
      exec_mode: "fork",
      instances: 1,
      env: { NODE_ENV: "production", PORT: "3003" },
      autorestart: true,
      max_memory_restart: "512M"
    },
    {
      name: "yapu-dev",
      script: "node_modules/.bin/next",
      args: "dev -p 3008",
      cwd: "/home/yapu/yapu2",
      exec_mode: "fork",  // FIX: was defaulting to cluster_mode
      instances: 1,
      env: { NODE_ENV: "development", PORT: "3008" },
      autorestart: true,
      max_memory_restart: "512M"
    }
  ]
};
```

### Fix 2: nginx — HMR WebSocket pass-through

```nginx
# Add BEFORE the bearer-gated location / block
# Source: /etc/nginx/sites-available/yapu-preview-new (updated)
location = /_next/webpack-hmr {
    # HMR WebSocket — no bearer gate (browser cannot send Authorization header via WebSocket)
    proxy_pass http://127.0.0.1:3008;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;
    proxy_buffering off;
}

# Also needed for Turbopack static assets (dev builds)
location /_next/static {
    proxy_pass http://127.0.0.1:3008;
    proxy_set_header Host $host;
}
```

### Fix 3: deploy.js — target only yapu-prod

```javascript
// Source: /home/ember-yapu/lib/deploy.js — line ~42
// BEFORE (wrong):
await execAsync('pm2 restart ecosystem.config.js', {
  cwd: repoPath,
  timeout: 10000,
});

// AFTER (correct):
await execAsync('pm2 restart ecosystem.config.js --only yapu-prod', {
  cwd: repoPath,
  timeout: 10000,
});
```

### Fix 4: context.js — load globals.css into system prompt

```javascript
// Source: C:/Users/hmk/promptheus-ember/lib/context.js
// Add at end of loadEditableContent(), after messages section:

// Load globals.css for color palette editing (Tier 3: color customization)
const globalsCssPath = join(repoPath, 'app', 'globals.css');
const globalsCss = await safeReadFile(globalsCssPath);
if (globalsCss) {
  // Only include the :root section to keep context lean
  const rootMatch = globalsCss.match(/:root\s*\{[^}]+\}/s);
  const excerpt = rootMatch ? rootMatch[0] : globalsCss.slice(0, 2000);
  sections.push(`### app/globals.css (CSS custom properties — color tokens)\n\`\`\`css\n${excerpt}\n\`\`\``);
}
```

### Fix 5: ember-yapu .env — upgrade to Tier 3 + add preview URL

```bash
# /home/ember-yapu/.env (current values + changes marked)
ANTHROPIC_API_KEY=sk-ant-api03-...   # unchanged
AUTH_TOKEN=daf78b70...               # unchanged

WEBSITE_REPO_PATH=/home/yapu/yapu2   # unchanged
CUSTOMER_NAME=YAPU Solutions         # unchanged
CUSTOMER_TIER=3                      # CHANGED: was 2

PORT=3009                            # unchanged
PREVIEW_PORT=3008                    # CHANGED: was 3010 (now points to yapu-dev)

DOMAIN=ember.yapu.promptheus.cloud   # unchanged
PREVIEW_DOMAIN=yapu-preview.promptheus.cloud  # CHANGED: was preview.yapu.promptheus.cloud
WEBSITE_URL=https://yapu.promptheus.cloud     # unchanged
PREVIEW_URL=https://yapu-preview.promptheus.cloud  # ADDED: for Tier 3 system prompt
```

### Fix 6: context.js — Tier 3 system prompt with preview URL

```javascript
// Source: C:/Users/hmk/promptheus-ember/lib/context.js
// Add previewUrl variable alongside websiteUrl:
const previewUrl = process.env.PREVIEW_URL || '';

// Update Tier 3 workflowInstructions:
const workflowInstructions = tier === 2
  ? `/* existing Tier 2 prompt */`
  : `## Workflow (Code & Design-Aenderungen)

1. Kunde beschreibt was er aendern will
2. Du liest die relevante Datei (website_read), findest die genaue Stelle
3. Du zeigst dem Kunden den aktuellen Code-Abschnitt und deinen Vorschlag
4. Du fragst: "Soll ich das so aendern?"
5. Nach expliziter Bestaetigung → Du machst die Aenderung (website_edit)
6. Du informierst: "Die Vorschau ist hier sichtbar: ${previewUrl || 'Vorschau-Link'} — bitte pruefen Sie die Aenderung"
7. Kunde bestaetigt die Vorschau → Du schaltest live (deploy)

WICHTIG:
- Fuehre NIEMALS website_edit aus ohne explizite Bestaetigung des Kunden
- Fuehre NIEMALS deploy aus ohne explizite Freigabe nach Vorschau-Sichtung
- Farb-Aenderungen: Finde die CSS Custom Properties in app/globals.css (OKLCH-Werte unter :root)
- Bearbeite IMMER alle Sprach-Versionen bei Content-Aenderungen (EN/FR/ES)
- Nach deploy: "Ihre Webseite ist jetzt aktualisiert: ${websiteUrl || 'Live-Link'}"`;
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Tier 2: content-only edits | Tier 3: code + CSS + color edits | Unlock via CUSTOMER_TIER=3 |
| Preview = production URL (force-dynamic) | Preview = dev server (HMR) | `yapu-preview.promptheus.cloud` is the live HMR preview |
| No deploy flow | `deploy` tool → `npm build` + `pm2 restart --only yapu-prod` | `deployToProduction()` needs minor fix |
| No color editing | Globals.css edit via `website_edit` | Need to load globals.css into Claude's context |

---

## Open Questions

1. **Does `next dev` actually work in PM2 cluster_mode on this VPS?**
   - What we know: VPS shows `exec mode = cluster_mode` for `yapu-dev`. The preview URL serves a page with HMR JS included. Requests return 200.
   - What's unclear: Whether HMR file watching actually works in cluster_mode. It may work for page serving (the cluster forwards HTTP) but HMR websocket state and file watching may be fragmented across workers.
   - Recommendation: Switch to `fork_mode` as a safe fix. This is a 1-line change to `ecosystem.config.js`. Do not leave cluster_mode — it is not supported by `next dev`.

2. **Will `pm2 restart ecosystem.config.js --only yapu-prod` work from Ember's cwd?**
   - What we know: `deploy.js` calls `execAsync('pm2 restart ...')` with `cwd: repoPath` (= `/home/yapu/yapu2`). PM2 is installed globally on the VPS. The ecosystem.config.js is at `/home/yapu/yapu2/server/ecosystem.config.js`.
   - What's unclear: Whether `pm2 restart ecosystem.config.js --only yapu-prod` needs the full path when cwd is `/home/yapu/yapu2`.
   - Recommendation: Use full path: `pm2 restart /home/yapu/yapu2/server/ecosystem.config.js --only yapu-prod`. Alternatively, `pm2 restart yapu-prod` (by name) is simpler and always works: `pm2 restart yapu-prod`.

3. **How long does `npm run build` take on this VPS?**
   - What we know: `build` calls `next build` with `distDir: '.next-prod'`. The VPS has a YAPU Next.js app with ~7 pages and Turbopack.
   - What's unclear: Actual build time. From typical Next.js apps of this size: 30-90 seconds.
   - Recommendation: Set a 180-second timeout (not 120s as currently set) in `deploy.js` to be safe. Inform the user in the system prompt: "Der Deploy-Vorgang dauert etwa 1-2 Minuten."

4. **Should `globals.css` load the full file or just `:root`?**
   - What we know: The full `globals.css` for YAPU includes color tokens, Tailwind imports, glassmorphism styles — potentially 200-400 lines.
   - What's unclear: Context cost vs. value of loading the full file.
   - Recommendation: Load only the `:root { }` block (color tokens). This is small (~30 lines) and gives Claude exactly what it needs for color editing. Full CSS is available via `website_read` on demand.

5. **Is the `PREVIEW_DOMAIN` env var used anywhere in Ember's code?**
   - What we know: `PREVIEW_DOMAIN` is in the `.env` but checking `preview.js` shows it uses `process.env.PREVIEW_DOMAIN` to construct the preview URL after `buildPreview()`. Since we're NOT using `buildPreview()`, this variable doesn't affect the live preview URL.
   - Recommendation: Add a new `PREVIEW_URL` env var for the Tier 3 system prompt, as shown in Fix 6. Keep `PREVIEW_DOMAIN` as-is (it won't be called at Tier 3 since we use the running dev server).

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-07 | Ember can edit component code (.tsx), styles (.css), and layout files on the dev server | `isEditAllowed()` at `tier >= 3` already allows `components/`, `app/`, `lib/`, `public/`. Only need: (1) change `CUSTOMER_TIER=3` in ember-yapu `.env`, (2) restart PM2, (3) update system prompt to guide Claude on code editing. |
| EDIT-08 | Changes visible instantly via HMR on the dev server preview | `yapu-dev` (`next dev`) is running on port 3008, proxied via nginx to `yapu-preview.promptheus.cloud`. HMR client (`/_next/webpack-hmr` WebSocket) is already included in page HTML. Fix needed: (1) `fork_mode` for yapu-dev, (2) nginx WebSocket pass-through for `/_next/webpack-hmr` without bearer gate, (3) Ember's `PREVIEW_URL` in system prompt. |
| EDIT-09 | Deploy from dev to production triggered via Ember (build + restart) | `deployToProduction()` in `deploy.js` already calls `npm run build` + `pm2 restart`. Fix: change to `pm2 restart --only yapu-prod` (not all apps). The Tier 3 system prompt must include the `deploy` tool in the workflow. |
| EDIT-10 | Color scheme changes editable via Ember (CSS custom properties in globals.css) | `website_edit` on `app/globals.css` is allowed at Tier 3 (`app/` is in allowedTier3). Fix: (1) load `:root` block of `globals.css` into `loadEditableContent()` so Claude knows the variable names and current OKLCH values. |
| EDIT-11 | Preview iframe routing for Tier 2 edits (dev server URL proxied via nginx) | `yapu-preview.promptheus.cloud` is already live and proxies to port 3008 with SSL and `Content-Security-Policy: frame-ancestors *`. Fix: HMR WebSocket nginx pass-through so HMR works in the iframe context. |
</phase_requirements>

---

## Validation Architecture

> `workflow.nyquist_validation` is NOT set in `.planning/config.json` — section skipped per instructions.

(Note: `config.json` does not contain `workflow.nyquist_validation` key — it has `workflow.research`, `workflow.plan_check`, and `workflow.verifier`. Treating as false = no automated test framework.)

---

## Sources

### Primary (HIGH confidence)

- `C:/Users/hmk/promptheus-ember/lib/tools.js` — `isEditAllowed()`, Tier 3 paths, `website_edit` implementation
- `C:/Users/hmk/promptheus-ember/lib/context.js` — `loadEditableContent()`, `buildSystemPrompt()`, Tier 3 workflowInstructions
- `C:/Users/hmk/promptheus-ember/lib/deploy.js` — `deployToProduction()` — runs `npm run build` + `pm2 restart ecosystem.config.js`
- `C:/Users/hmk/promptheus-ember/lib/preview.js` — `buildPreview()` — confirmed NOT appropriate for our setup
- `C:/Users/hmk/promptheus/yapu2/server/ecosystem.config.js` — `yapu-dev` and `yapu-prod` PM2 config
- `C:/Users/hmk/promptheus/yapu2/next.config.ts` — `distDir: '.next-prod'` confirmed
- SSH to VPS (`root@187.77.66.133`) — confirmed live state:
  - PM2 processes: `ember-yapu` (port 3009, TIER=2), `yapu-dev` (port 3008, cluster_mode), `yapu-prod` (port 3003)
  - nginx `yapu-preview-new` active with bearer gate and `frame-ancestors *`
  - Ember `.env` at `/home/ember-yapu/.env`
  - Preview URL returns HTTP 200 with Turbopack HMR JS included
  - WebSocket path: `/_next/webpack-hmr` (confirmed from browser chunk `node_modules_next_dist_client_17643121._.js`)

### Secondary (MEDIUM confidence)

- https://github.com/vercel/next.js/discussions/64070 — HMR WebSocket configuration for nginx (working pattern: dedicated `location = /_next/webpack-hmr` with WS upgrade)
- https://nextjs.org/docs/app/guides/local-development — Next.js 16 Turbopack dev server behavior confirmed

### Tertiary (LOW confidence)

- PM2 cluster_mode incompatibility with `next dev` — multiple GitHub discussions confirm but not an official "unsupported" statement; treating as LOW because behavior may be version-dependent. Recommendation stands: use `fork_mode` as it is definitively correct.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — source code verified, VPS state SSH-confirmed
- Architecture: HIGH — WebSocket path confirmed from live browser chunk analysis, nginx config read from VPS
- Pitfalls: HIGH — cluster_mode issue confirmed from VPS pm2 info; bearer gate WS issue derived from browser WebSocket API spec (cannot send custom headers)
- Deployment: HIGH — deploy.js, ecosystem.config.js, and pm2 state all confirmed via SSH

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (VPS state confirmed today; Ember source code is local)
