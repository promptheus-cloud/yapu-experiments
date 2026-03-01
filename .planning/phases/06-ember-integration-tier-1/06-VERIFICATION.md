---
phase: 06-ember-integration-tier-1
verified: 2026-02-27T12:00:00Z
status: passed
score: 9/9 must-haves verified
re_verification: false
---

# Phase 6: Ember Integration (Tier 1) Verification Report

**Phase Goal:** A non-technical person using Ember can change any text content on the YAPU site and see the change live on production within seconds — no code, no deploy
**Verified:** 2026-02-27
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

Phase 6 has two plan-level must_have sets. Truths from 06-01-PLAN.md cover the code patch (verifiable against the codebase). Truths from 06-02-PLAN.md cover the running VPS deployment (verified via human E2E testing, as the plan required).

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Ember loads all EN, FR, and ES content JSON files into Claude's system prompt context | VERIFIED | `loadEditableContent()` uses `readdir(contentDir)` (line 67) + `.filter(entry => !entry.includes('.'))` (line 68) — dynamically discovers locale dirs. YAPU's `content/data/` contains `en/`, `fr/`, `es/` subdirs with JSON files. |
| 2 | Ember system prompt instructs Claude to confirm changes before writing (EDIT-05) | VERIFIED | Line 133-134: `"Du fragst: 'Soll ich das so aendern?'"` present in Tier 2 workflowInstructions. Line 138: `"Fuehre NIEMALS website_edit aus, ohne dass der Kunde die Aenderung explizit bestaetigt hat"`. |
| 3 | Ember system prompt tells Claude to provide production URL after edit, not call preview_build (EDIT-04) | VERIFIED | Line 135: `"Die Aenderung ist hier sichtbar: ${websiteUrl}"` (conditional on WEBSITE_URL). Line 139: `"Rufe NIEMALS preview_build auf"`. Line 140: `"Rufe NIEMALS deploy auf"`. WEBSITE_URL env var added at line 105. |
| 4 | Ember system prompt instructs Claude to update all 3 locales for content changes (EDIT-02) | VERIFIED | Line 141: `"Wenn du Content aenderst, aktualisiere IMMER alle vorhandenen Sprachversionen (pruefe welche Locale-Verzeichnisse unter content/data/ existieren)"`. Dynamic locale detection means this instruction is repo-agnostic. |
| 5 | Ember system prompt references YAPU page/section structure so Claude scopes edits correctly (EDIT-06) | VERIFIED | `buildSystemPrompt()` builds a full `fileTree` of the repo (lines 107-109) and loads all content JSON in `editableContent` (line 111). Both are injected into the system prompt (lines 189-195). Claude sees the complete page/section structure and all JSON file names. |
| 6 | Ember chat UI accessible at ember.yapu.promptheus.cloud with auth gate | VERIFIED (human) | Human tester confirmed: Ember accessible at `https://ember.yapu.promptheus.cloud`, auth gate working. PM2 `ember-yapu` process running on port 3005 behind nginx with SSL. |
| 7 | Typing a content change instruction in Ember updates a YAPU content JSON file on disk | VERIFIED (human) | EDIT-02 confirmed: hero headline edit updated `homepage.json` in EN/ES/FR simultaneously via `website_edit`. |
| 8 | Ember asks for confirmation before writing any change (EDIT-05) | VERIFIED (human) | EDIT-05 confirmed: "Soll ich das so andern?" shown before file write during E2E test. |
| 9 | Editing homepage content does not affect other page content files (EDIT-06) | VERIFIED (human) | EDIT-06 confirmed: `investor-services.json` unchanged after homepage hero edit. |

**Score:** 9/9 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `C:/Users/hmk/promptheus-ember/lib/context.js` | Dynamic locale detection + YAPU Tier 1 system prompt | VERIFIED | 293 lines. Contains `readdir(contentDir)` (line 67), `workflowInstructions` ternary (lines 127-156), `websiteUrl` from env (line 105). Committed via `ee20744` and `1a0334b`. |
| `/home/ember/.env.local` (VPS) | Ember config with WEBSITE_REPO_PATH=/home/yapu/yapu2 | VERIFIED (human) | Created on VPS during Plan 02 human task. Contains `WEBSITE_REPO_PATH=/home/yapu/yapu2`, `CUSTOMER_TIER=2`, `PORT=3005`, `WEBSITE_URL=https://yapu.promptheus.cloud`. |
| `/etc/nginx/sites-available/ember-yapu` (VPS) | nginx reverse proxy for Ember | VERIFIED (human) | Created on VPS. Routes `ember.yapu.promptheus.cloud` to port 3005 with `proxy_buffering off` for SSE. |
| `content/data/en/`, `content/data/fr/`, `content/data/es/` (yapu2 repo) | EN/FR/ES JSON content directories | VERIFIED | All three locale subdirectories exist with homepage.json and all subpage JSON files. Dynamic `readdir()` will find them at runtime. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `context.js:loadEditableContent` | `content/data/{en,fr,es}/` | `readdir(contentDir)` + `.filter(entry => !entry.includes('.'))` | VERIFIED | Lines 67-69 in context.js. No hardcoded locale list. Filter strips `shared/` (contains a `.` via path construction? No — `shared` has no dot, but filter passes directories without dots — all of `en`, `fr`, `es`, `shared` would be picked up). Verified: `shared/` directory exists but contains placeholder.json files, not harmful if loaded into context. |
| `context.js:buildSystemPrompt` | Claude behavior (Tier 2 workflow) | `workflowInstructions` const with `tier === 2` branch | VERIFIED | Lines 127-156. Tier 2 gets confirm-before-write, no preview_build, no deploy, production URL. Tier 3+ retains old workflow. Wired into template via `${workflowInstructions}` at line 177. |
| Ember `website_edit` tool | `/home/yapu/yapu2/content/data/` | `WEBSITE_REPO_PATH=/home/yapu/yapu2` in `.env.local` | VERIFIED (human) | VPS .env.local created. Server.js reads `REPO_PATH = process.env.WEBSITE_REPO_PATH` (server.js line 19). Tool executor uses REPO_PATH. E2E test confirmed file writes succeeded. |
| YAPU force-dynamic pages | `content/data/ JSON files` | `export const dynamic = 'force-dynamic'` on all pages | VERIFIED | All 7 page files (`page.tsx`) have `export const dynamic = 'force-dynamic'`. Changes to JSON are reflected on next request, no rebuild needed. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| EDIT-02 | 06-01-PLAN, 06-02-PLAN | Ember can update any content JSON file via natural language instruction | SATISFIED | Dynamic locale detection loads all EN/FR/ES JSON. System prompt instructs Claude to update all locales. Human test confirmed EN/ES/FR updated simultaneously. |
| EDIT-04 | 06-01-PLAN, 06-02-PLAN | Live preview via production URL (not preview_build) | SATISFIED | `NIEMALS preview_build` in Tier 2 system prompt. `WEBSITE_URL` injected into post-edit message. Human test confirmed URL provided after edit. |
| EDIT-05 | 06-01-PLAN, 06-02-PLAN | Change confirmation in Ember before writing to files | SATISFIED | "Soll ich das so aendern?" step in Tier 2 workflow. "NIEMALS website_edit ohne Bestaetigung" constraint. Human test confirmed. |
| EDIT-06 | 06-01-PLAN, 06-02-PLAN | Scoped edits — Ember understands which page/section is being edited | SATISFIED | Full repo file tree + all page JSON injected into system prompt. Claude can distinguish homepage from investor-services by filename. Human test confirmed investor-services.json unaffected. |

**REQUIREMENTS.md Traceability check:** EDIT-02, EDIT-04, EDIT-05, EDIT-06 are all listed under Phase 6 in REQUIREMENTS.md with status "Complete". All four requirements declared in both plan frontmatter files. No orphaned requirements for Phase 6.

**Note:** EDIT-01 (Content API Route Handler) and EDIT-03 (force-dynamic SSR) were assigned to Phase 2 and are prerequisites — both verified as present (`/api/content` route exists, `force-dynamic` on all 7 pages).

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `lib/context.js` | 68 | `locales = localesAvailable.filter(entry => !entry.includes('.'))` | Info | The filter excludes entries with dots (intended to skip files like `placeholder.json` at the contentDir root). The `shared/` directory has no dot and will be included as a locale. If `content/data/shared/` contains JSON, Ember will load it into the system prompt under a `shared/` section header. This is not harmful — it gives Claude more context. Not a blocker. |
| `lib/context.js` | 135 | System prompt template literal with `${websiteUrl}` inside a Tier 2 string constant | Info | The `workflowInstructions` const is computed once per `buildSystemPrompt()` call (every content change triggers refresh per server.js line 43). WEBSITE_URL is read from process.env at call time. No caching issue. |

No blockers found. No TODO/FIXME/placeholder comments in context.js. No stub implementations. No empty handlers.

**Known non-blocking issues (from 06-02-SUMMARY):**
1. Chat UI message ordering bug — cosmetic frontend rendering issue in Ember UI, not context.js. Deferred.
2. Revert uses re-edit (6 commits) instead of `git revert` (1 commit) — functionally correct, git history is noisier. Deferred.

Neither issue blocks the phase goal.

---

### Human Verification Required

All automated checks for the code-side changes pass with full confidence. The VPS deployment and E2E browser tests were confirmed by the human tester. No additional human verification is required.

The following items were human-verified during Plan 02 execution:
1. Ember accessible at `https://ember.yapu.promptheus.cloud` with auth gate
2. "Soll ich das so andern?" prompt appears before any file write (EDIT-05)
3. Production URL `https://yapu.promptheus.cloud` provided after edit (EDIT-04)
4. EN/ES/FR updated simultaneously on one content edit instruction (EDIT-02)
5. `investor-services.json` unchanged after homepage edit (EDIT-06)
6. Content change visible on production within one page reload (force-dynamic confirmed)

---

### Gaps Summary

No gaps. All 9 truths verified (5 via static code analysis, 4 via human E2E testing as designed by the plan). All 4 requirements (EDIT-02, EDIT-04, EDIT-05, EDIT-06) satisfied. All artifacts exist and are substantive and wired.

The phase goal is achieved: a non-technical person using Ember at `https://ember.yapu.promptheus.cloud` can type a content change instruction in natural language, confirm it, and see the change live on `https://yapu.promptheus.cloud` within one page reload — with no code editing and no deploy step.

---

_Verified: 2026-02-27_
_Verifier: Claude (gsd-verifier)_
