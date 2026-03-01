# Phase 6: Ember Integration (Tier 1) - Research

**Researched:** 2026-02-27
**Domain:** Chatbot-based content editing — Ember (Node.js/Express/Claude API) + YAPU Next.js website
**Confidence:** HIGH — Ember source code is fully available locally at `C:/Users/hmk/promptheus-ember/`

---

## Summary

Phase 6 wires the already-running Ember chatbot to the YAPU website so that a non-technical user can type a natural-language instruction ("change the hero headline to X") and see the live production site reflect that change on the next page reload — no code, no rebuild, no deploy needed.

The key insight from reading the Ember source: **Ember is already a complete, working system**. It runs as a Node.js Express app (`promptheus-ember/server.js`), uses Claude API with tool-use, and has a `website_edit` tool that directly writes files to disk (via `writeFile`) and commits the change to git. The YAPU project already has a `force-dynamic` SSR setup and a Content API (`/api/content`) that writes JSON. These two systems need to be **connected** and **configured** — not built from scratch.

Phase 6 is primarily a **deployment and configuration** phase, with one significant UX gap: Ember's current `preview_build` tool (used for the confirmation workflow in EDIT-05) triggers a full `next build` — which would take 60-120 seconds and conflicts with YAPU's two-instance architecture. For Tier 1 (content-only edits), a simpler confirmation pattern is needed: Ember shows the proposed change text, user confirms, then Ember writes the file. The "live preview" (EDIT-04) is simply a link to `https://yapu.promptheus.cloud` — the production site reflects the change on the next page reload because `force-dynamic` is already in place.

**Primary recommendation:** Deploy Ember to the VPS pointed at `/home/yapu/yapu2`, configure it with `CUSTOMER_TIER=2` (restricts edits to `content/data/` and `messages/`), adapt the system prompt for EN/FR/ES (current Ember context.js only loads `de` and `en` locales), and wire the confirmation UX through Ember's existing workflow instructions rather than `preview_build`.

---

## Standard Stack

### Core (already built — do not rebuild)

| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| Ember server | `C:/Users/hmk/promptheus-ember/server.js` | Express app, SSE streaming, tool loop | Exists, works |
| Claude API integration | `promptheus-ember/lib/claude.js` | Streaming + tool-use loop with claude-sonnet-4-6 | Exists |
| `website_edit` tool | `promptheus-ember/lib/tools.js` | Reads file, replaces text, writes file, git commit | Exists |
| `website_read` / `website_list` / `website_search` tools | `promptheus-ember/lib/tools.js` | Context gathering before edit | Exists |
| Tier 2 edit guard | `promptheus-ember/lib/tools.js:isEditAllowed()` | Restricts edits to `content/data/` and `messages/` at tier 2 | Exists |
| System prompt builder | `promptheus-ember/lib/context.js:buildSystemPrompt()` | Loads file tree + all editable JSON content into context | Exists |
| Bearer auth | `promptheus-ember/lib/auth.js` | Token-based auth for Ember UI | Exists |
| Chat UI | `promptheus-ember/public/index.html` + `app.js` | Vanilla JS SPA with SSE streaming | Exists |
| Git ops | `promptheus-ember/lib/git-ops.js` | stageAndCommit, getLog, pushToRemote | Exists |
| YAPU Content API | `yapu2/app/api/content/route.ts` | POST with bearer auth, writes JSON, supports patch | Exists |
| `force-dynamic` pages | All 8 YAPU `page.tsx` files | SSR on every request — changes visible on reload | Exists |

### Supporting (needs configuration or minor adaptation)

| Component | Purpose | Gap |
|-----------|---------|-----|
| Ember `.env` for YAPU | Point Ember at YAPU repo, set tier=2, set customer name | Must be created on VPS |
| Ember nginx config | Route `ember.yapu.promptheus.cloud` to Ember port | Must be deployed |
| Ember PM2 entry | Auto-start Ember alongside yapu-prod and yapu-dev | Must be added to ecosystem.config.js or separate PM2 config |
| context.js locale fix | Currently only loads `de` and `en` locales; YAPU uses `en`, `fr`, `es` | Must patch `loadEditableContent()` to use correct locales |
| System prompt YAPU customization | Current system prompt says "Aendere IMMER beide Sprachen (DE und EN)" — YAPU has EN/FR/ES | Must update default instructions |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Direct file write via `website_edit` | POST to `/api/content` route | Both work; direct file write is simpler for Ember since it runs on the same VPS and WEBSITE_REPO_PATH gives direct access |
| `preview_build` for confirmation | Text-based confirmation in chat | `preview_build` does a full `next build` (60-120s) — unsuitable for Tier 1 SSR workflow. Text confirmation is faster and correct for Tier 1 |
| Separate Ember instance per customer | Shared Ember with customer switching | Separate instances are the pattern (per `.env.example`) — each customer has their own Ember with their own repo path |

---

## Architecture Patterns

### How Ember Actually Works (confirmed from source)

```
User types message in browser
    ↓ POST /api/chat (SSE)
    ↓ Ember server loads conversation history
    ↓ buildSystemPrompt() provides context:
        - File tree of WEBSITE_REPO_PATH
        - Full contents of all content/data/{locale}/*.json files
        - Full contents of all messages/*.json files
    ↓ Claude API receives messages + system prompt + tool definitions
    ↓ Claude streams response + tool calls
        → website_read: read a specific file
        → website_list: browse directory
        → website_search: find text in codebase
        → website_edit: replace old_text with new_text, commit
        → preview_build: trigger next build (NOT for Tier 1)
        → deploy: push + build + pm2 restart (NOT for Tier 1)
    ↓ Tool results fed back to Claude
    ↓ Claude responds to user in German (Sie-form), non-technical language
    ↓ SSE events stream to browser
    ↓ Conversation saved to data/conversations/{id}.json
```

### Tier 1 Confirmation Workflow (EDIT-05)

The Ember system prompt already includes:
```
## Workflow
1. Kunde beschreibt was er aendern will
2. Du liest die relevante Datei, findest die Stelle
3. Du machst die Aenderung und zeigst dem Kunden was sich geaendert hat
4. Du baust eine Vorschau und gibst dem Kunden den Link
5. Kunde bestaetigt → Du schaltest live
```

For Tier 1, step 4 should NOT call `preview_build` (which does `next build`). Instead the system prompt should be adapted:
- Show the proposed change text in chat (old value → new value)
- Ask user to confirm with "Ja, das ist korrekt" before calling `website_edit`
- After confirmed edit, tell user "Ihre Webseite wurde aktualisiert. Sie können die Änderung jetzt unter [production URL] sehen."

This pattern satisfies EDIT-05 (confirmation before write) without a build step.

### Live Preview Pattern (EDIT-04)

For Tier 1, "live preview" = link to the production URL. Because `force-dynamic` is already configured on all pages, the production site reflects file changes on the next HTTP request — no build needed. The Ember system prompt should include the production URL (`https://yapu.promptheus.cloud`) so Claude can provide it as a direct link after every confirmed edit.

This is NOT an iframe in the Ember UI. It is a chat message containing a hyperlink. The Ember chat already renders markdown links as `<a target="_blank">` elements.

### Scoped Edits Pattern (EDIT-06)

Ember's `website_edit` tool takes a `path` parameter (relative path to file) and `old_text`/`new_text`. Scoping happens because:
1. Claude knows the file tree (from `buildSystemPrompt`)
2. Claude knows the content of all JSON files (from `loadEditableContent`)
3. When user says "change the hero headline", Claude searches for "hero" → finds it in `content/data/en/homepage.json` → edits only that file
4. The `isEditAllowed()` guard prevents edits outside `content/data/` and `messages/`

No additional scoping mechanism is needed — this is already handled by Claude's context + the tier guard.

### Recommended Project Structure (additions to YAPU repo)

No new files needed in the YAPU repo. Changes are all in:
1. VPS: Ember deployed at `/home/ember/` (separate from YAPU repo)
2. VPS: Ember `.env.local` pointing `WEBSITE_REPO_PATH=/home/yapu/yapu2`
3. VPS: nginx config for `ember.yapu.promptheus.cloud`
4. `promptheus-ember/lib/context.js`: locale fix (`fr`, `es` instead of `de`)
5. `promptheus-ember/lib/context.js`: system prompt update (EN/FR/ES language instructions)
6. VPS: PM2 entry for `ember-yapu` process

### Anti-Patterns to Avoid

- **Calling `preview_build` for Tier 1 edits:** Triggers a 60-120s `next build`. Completely wrong for SSR/force-dynamic sites. The production site is live immediately on file write.
- **Building a new confirmation UI:** Ember already handles this via the conversation flow. The system prompt just needs the right instructions.
- **Using the Content API (`/api/content`) instead of direct file write:** Both work but the Content API adds unnecessary network hop when Ember runs on the same VPS. `website_edit` writes directly. (Note: Content API was built for Phase 2 to enable external tools — Ember can use either, but direct write is simpler.)
- **Embedding the production site in an iframe inside Ember:** YAPU's production nginx does NOT have `X-Frame-Options: DENY`, but adding an iframe to the Ember UI is scope creep. A link is sufficient for Tier 1.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LLM tool-use loop with streaming | Custom SSE + Claude loop | Existing `promptheus-ember/lib/claude.js` | Already built, tested, handles all edge cases |
| File write + git commit | Custom git integration | Existing `website_edit` tool + `git-ops.js` | Already works with simple-git |
| Chat UI with SSE streaming | React/Vue chat component | Existing `public/index.html` + `app.js` | Vanilla JS SPA, already deployed at ember.promptheus.cloud |
| Content scoping/permissions | Custom permission system | `isEditAllowed()` in tools.js with `CUSTOMER_TIER` env var | Tier 2 already restricts to content/data/ and messages/ |
| Auth | Custom token system | Existing `auth.js` + `AUTH_TOKEN` env var | Bearer token auth already implemented |

**Key insight:** Ember is a complete, deployed product. Phase 6 is about pointing it at the YAPU repo and configuring it correctly, not rebuilding it.

---

## Common Pitfalls

### Pitfall 1: context.js Loads Wrong Locales
**What goes wrong:** `loadEditableContent()` hardcodes `['de', 'en']` as locale directories to scan. YAPU uses `['en', 'fr', 'es']`. Ember's system prompt will have the `de/` content empty and miss `fr/` and `es/` content.
**Why it happens:** Ember was originally built for the Promptheus homepage (DE/EN). YAPU has different locales.
**How to avoid:** Patch `context.js` line 67: change `for (const locale of ['de', 'en'])` to `for (const locale of ['en', 'fr', 'es'])` — or better, read locales from the directory listing dynamically.
**Warning signs:** Claude says "I don't see any FR content" or makes edits only to EN files when asked to update all languages.

### Pitfall 2: System Prompt Language Instructions Are Wrong
**What goes wrong:** The current system prompt says "Aendere IMMER beide Sprachen (DE und EN)" — YAPU has EN/FR/ES, not DE/EN.
**Why it happens:** Hardcoded in `context.js:buildSystemPrompt()`.
**How to avoid:** Add an env var `CONTENT_LOCALES=en,fr,es` and reference it in the system prompt, or hardcode for YAPU.
**Warning signs:** Claude updates EN and DE files when YAPU has no DE content.

### Pitfall 3: `preview_build` Being Called for Tier 1 Edits
**What goes wrong:** Claude follows the system prompt workflow step 4 "Du baust eine Vorschau" and calls `preview_build`, which runs `npm run build` (60-120s) on the production server. This blocks the VPS and produces confusing output since the `force-dynamic` build still needs to be running.
**Why it happens:** The Ember system prompt workflow includes `preview_build` as step 4. For SSR sites (force-dynamic), this step is unnecessary.
**How to avoid:** Update the system prompt workflow to say: after edit, give user the production URL as the preview. Remove `preview_build` from the tool list for Tier 1, OR instruct Claude via system prompt not to call it.
**Warning signs:** Chat hangs for 60-120 seconds after an edit.

### Pitfall 4: YAPU Nginx Missing X-Frame-Options or Frame-Ancestors for Ember Domain
**What goes wrong:** If an iframe is ever used (e.g., in Phase 7), the production nginx config needs `Content-Security-Policy: frame-ancestors *`. The current `nginx-yapu-prod.conf` does NOT include this header.
**Why it happens:** Production nginx uses `X-Frame-Options` is not set in the current config but it also doesn't explicitly allow framing.
**How to avoid:** For Phase 6 (Tier 1), use a link, not an iframe. This pitfall is irrelevant for Phase 6 but must be noted for Phase 7.
**Warning signs:** Browser console shows "Refused to display in frame" error.

### Pitfall 5: Ember Deployed Without `no-buffer` on SSE Nginx
**What goes wrong:** nginx buffers SSE responses, causing streaming to appear to hang until the entire response is complete.
**Why it happens:** Default nginx buffering behavior.
**How to avoid:** Ember's nginx template already includes `proxy_buffering off` and `proxy_cache off` for the Ember domain — use the template exactly as written.
**Warning signs:** Chat appears frozen for 10-30 seconds, then all text appears at once.

### Pitfall 6: `website_edit` Uses Exact String Match
**What goes wrong:** `website_edit` requires `old_text` to match exactly. If Claude reads a JSON file and proposes an edit with slightly different whitespace or quotes, the match fails.
**Why it happens:** The tool does `content.includes(toolInput.old_text)` — exact string match.
**How to avoid:** This is already handled by having Claude read the file first (via `website_read`) and copy the exact text. The system prompt instructs this. No fix needed, just awareness.
**Warning signs:** Tool returns "Der zu ersetzende Text wurde in X nicht gefunden."

---

## Code Examples

### Ember `website_edit` Tool in Action (from tools.js)

```javascript
// Source: C:/Users/hmk/promptheus-ember/lib/tools.js
case 'website_edit': {
  if (!isEditAllowed(toolInput.path, tier)) {
    return `Diese Datei darf auf Ihrem Pflegeplan nicht direkt bearbeitet werden.`;
  }

  const filepath = join(repoPath, toolInput.path);
  const content = await readFile(filepath, 'utf-8');

  if (!content.includes(toolInput.old_text)) {
    return `Der zu ersetzende Text wurde in ${toolInput.path} nicht gefunden.`;
  }

  const newContent = content.replace(toolInput.old_text, toolInput.new_text);
  await writeFile(filepath, newContent, 'utf-8');

  // Git commit on current branch
  await gitOps.stageAndCommit(repoPath, toolInput.path, `Ember: ${toolInput.path} aktualisiert`);

  return `Erfolgreich geaendert in ${toolInput.path}`;
}
```

### Tier Guard (from tools.js)

```javascript
// Source: C:/Users/hmk/promptheus-ember/lib/tools.js
function isEditAllowed(filepath, tier) {
  const normalized = filepath.replace(/\\/g, '/');
  const allowedTier2 = [
    'content/data/',   // JSON content files (EN/FR/ES)
    'messages/',       // next-intl UI strings
  ];
  const allowedTier3 = [
    ...allowedTier2,
    'components/', 'app/', 'lib/', 'public/',
  ];
  const allowed = tier >= 3 ? allowedTier3 : allowedTier2;
  return allowed.some(prefix => normalized.startsWith(prefix));
}
// YAPU uses CUSTOMER_TIER=2 → only content/data/ and messages/ editable
```

### Locale Fix for context.js (required change)

```javascript
// Current (WRONG for YAPU):
// Source: C:/Users/hmk/promptheus-ember/lib/context.js line 67
for (const locale of ['de', 'en']) {  // ← YAPU has en/fr/es, not de/en

// Fixed for YAPU:
for (const locale of ['en', 'fr', 'es']) {

// Better — dynamic detection (reads from directory):
const localesAvailable = await readdir(contentDir).catch(() => []);
const locales = localesAvailable.filter(d => !d.includes('.'));
for (const locale of locales) {
```

### Ember .env for YAPU (on VPS at /home/ember/.env)

```bash
# Source: C:/Users/hmk/promptheus-ember/.env.example (adapted for YAPU)
ANTHROPIC_API_KEY=sk-ant-...         # Production Anthropic key
AUTH_TOKEN=<strong-random-token>     # Token for YAPU client access

WEBSITE_REPO_PATH=/home/yapu/yapu2   # Points at YAPU repo
CUSTOMER_NAME=YAPU Solutions
CUSTOMER_TIER=2                      # Restricts to content/data/ + messages/

PORT=3005                            # Ember runs on port 3005
PREVIEW_PORT=3006                    # Not used in Tier 1 (no preview_build)

DOMAIN=ember.yapu.promptheus.cloud
PREVIEW_DOMAIN=preview.yapu.promptheus.cloud
```

### System Prompt Workflow Update (adapted for YAPU Tier 1)

The system prompt's `## Workflow` and language instructions should be updated:

```
## Workflow (Tier 1 — Inhalts-Änderungen)

1. Kunde beschreibt was er ändern will
2. Du liest die relevante Datei, findest die genaue Textstelle
3. Du zeigst dem Kunden den aktuellen Text und den Vorschlag für den neuen Text
4. Du fragst: "Soll ich das so ändern?"
5. Nach expliziter Bestätigung → Du machst die Änderung (website_edit)
6. Du informierst: "Ihre Webseite wurde aktualisiert. Die Änderung ist hier sichtbar: https://yapu.promptheus.cloud"

WICHTIG:
- Ändere IMMER alle Sprachen (EN, FR und ES) wenn du Content änderst, es sei denn der Kunde sagt explizit nur eine Sprache
- Schalte NIE live ohne explizite Bestätigung des Kunden
- Rufe NIEMALS preview_build auf — die Webseite aktualisiert sich automatisch nach einer Textänderung
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| CMS admin panel (WordPress) | Ember chatbot (natural language) | YAPU's original site uses WordPress/Cornerstone |
| Rebuild on every content change | `force-dynamic` SSR — changes visible on next request | Already implemented in Phase 2 |
| Preview = full build (60-120s) | Preview = production URL (immediate) | For Tier 1 SSR; Tier 2 will use dev server |
| Multi-locale edit = manual per locale | Ember multi-locale = single instruction updates EN+FR+ES | Works via `website_edit` on multiple files |

---

## Open Questions

1. **Is Ember already deployed on the VPS for YAPU?**
   - What we know: ember.promptheus.cloud exists (domain resolves, UI loads with auth error). The `.env.example` references `WEBSITE_REPO_PATH=/home/yapu-web` (old path). The VPS has `/home/yapu/yapu2` as the YAPU repo path.
   - What's unclear: Whether an `ember` PM2 process exists on the server, and what `WEBSITE_REPO_PATH` it currently points to.
   - Recommendation: Check `pm2 list` on VPS at start of Phase 6. If Ember is running with wrong path, update `.env.local` and restart. If not running, deploy from `promptheus-ember/`.

2. **Is `promptheus-ember` in a git repo with a remote for VPS deployment?**
   - What we know: `server/deploy.sh` does `git pull origin main` — implies a git remote exists.
   - What's unclear: Whether the local `promptheus-ember/` has a remote set, and whether the VPS already has it cloned.
   - Recommendation: Check `git remote -v` in `promptheus-ember/`. If no remote or VPS not cloned, use `scp` or manual deploy for Phase 6.

3. **Should Ember's locale detection be dynamic or hardcoded for YAPU?**
   - What we know: `context.js` hardcodes `['de', 'en']`. YAPU needs `['en', 'fr', 'es']`.
   - What's unclear: Whether future customers will always be 2-locale or variable.
   - Recommendation: Make it dynamic (read from `content/data/` directory listing). This is a 3-line change and makes Ember universally reusable.

4. **Should `preview_build` be removed from Ember's tool list for YAPU Tier 1?**
   - What we know: `preview_build` runs `next build` (60-120s). For `force-dynamic` SSR, changes are live immediately. Calling `preview_build` would be wasteful and confusing.
   - Recommendation: Keep the tool definition but update the system prompt to instruct Claude never to call it for Tier 1. For Tier 2 (Phase 7), `preview_build` will be needed for the dev server workflow.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EDIT-02 | Ember can update any content JSON file via natural language instruction | `website_edit` tool in `tools.js` already does this: finds file via `WEBSITE_REPO_PATH + path`, replaces `old_text` with `new_text`, commits. Need: locale fix in `context.js` so FR/ES content loads into Claude's context. |
| EDIT-04 | Live preview via iframe or tab link showing current production state, updates after confirmed content change | For Tier 1: production URL `https://yapu.promptheus.cloud` is the preview. File changes are immediately visible on next page load (`force-dynamic`). Ember chat renders markdown links, so Claude includes the URL in its response. No iframe needed for Tier 1. |
| EDIT-05 | Ember shows confirmation step before writing any change to disk | Already in Ember's workflow: Claude is instructed to show proposed change and ask for confirmation before calling `website_edit`. Must ensure system prompt enforces this. Verification: send "change hero headline to X" and observe that Ember asks "Soll ich das so ändern?" before the file is written. |
| EDIT-06 | Ember correctly scopes edits by page and section — editing homepage hero does not affect Investor Services | Scoping is achieved by: (1) `isEditAllowed()` restricts to `content/data/` only, (2) Claude reads the file tree and full JSON content in system prompt, (3) `website_edit` requires exact file path + exact old_text — so editing `content/data/en/homepage.json` hero.title cannot accidentally change `content/data/en/investor-services.json`. |
</phase_requirements>

---

## Sources

### Primary (HIGH confidence)
- `C:/Users/hmk/promptheus-ember/server.js` — Ember architecture, routes, startup
- `C:/Users/hmk/promptheus-ember/lib/tools.js` — All tool definitions and executor logic
- `C:/Users/hmk/promptheus-ember/lib/context.js` — System prompt builder, locale loading
- `C:/Users/hmk/promptheus-ember/lib/claude.js` — Claude API streaming + tool-use loop
- `C:/Users/hmk/promptheus-ember/lib/git-ops.js` — Git operations
- `C:/Users/hmk/promptheus-ember/.env.example` — Configuration model for YAPU
- `C:/Users/hmk/promptheus-ember/server/nginx.conf.template` — Nginx config template
- `C:/Users/hmk/promptheus-ember/server/ecosystem.config.cjs` — PM2 config template
- `C:/Users/hmk/promptheus/yapu2/app/api/content/route.ts` — YAPU Content API (already exists)
- `C:/Users/hmk/promptheus/yapu2/app/[locale]/page.tsx` — `force-dynamic` confirmed on all pages
- `C:/Users/hmk/promptheus/yapu2/.planning/REQUIREMENTS.md` — EDIT-02, EDIT-04, EDIT-05, EDIT-06 definitions
- `C:/Users/hmk/promptheus/yapu2/.planning/STATE.md` — Phase 6 noted as "Ember's current file-write API and preview implementation status must be investigated"

### Secondary (MEDIUM confidence)
- `https://ember.promptheus.cloud` — WebFetch confirmed: chat UI, "Ungültiger Zugangsschlüssel" (auth gate works), SSE streaming confirmed
- `.planning/PROJECT.md` — "Ember (ember.promptheus.cloud) is the chatbot interface that lets clients edit their websites. It exists but the preview feature is not yet functional — building preview is part of this project." → Confirms preview is an open item; our research shows production URL link is the correct Tier 1 approach.

### Tertiary (LOW confidence)
- None — all critical findings verified from source code.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Ember source code fully available and read
- Architecture: HIGH — Tool definitions, tier guard, system prompt builder all confirmed from source
- Pitfalls: HIGH — locale hardcoding confirmed from source (line 67 of context.js); SSE buffering from nginx template analysis
- Deployment: MEDIUM — VPS state not confirmed (SSH timeout during research); deployment steps inferred from existing scripts

**Research date:** 2026-02-27
**Valid until:** 2026-03-27 (Ember source is local — stable unless explicitly changed)
