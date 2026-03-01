---
phase: 07-ember-tier-2-deploy
plan: 01
subsystem: ember-context
tags: [ember, tier-3, context, deploy, pm2, hmr, globals-css]
dependency_graph:
  requires: [06-02-PLAN.md]
  provides: [Tier 3 system prompt with preview URL + globals.css, targeted PM2 deploy, fork_mode for HMR]
  affects: [promptheus-ember/lib/context.js, promptheus-ember/lib/deploy.js, yapu2/server/ecosystem.config.js]
tech_stack:
  added: []
  patterns: [PM2_PROD_APP env var for configurable deploy target, safeReadFile + regex extract for CSS token context]
key_files:
  created: []
  modified:
    - C:/Users/hmk/promptheus-ember/lib/context.js
    - C:/Users/hmk/promptheus-ember/lib/deploy.js
    - C:/Users/hmk/promptheus/yapu2/server/ecosystem.config.js
decisions:
  - PM2_PROD_APP env var defaults to yapu-prod — deploy.js configurable per customer without code change
  - globals.css loaded as :root + .dark regex extract to keep context lean (30 lines vs 200+ full file)
  - fork_mode added to both yapu-prod and yapu-dev — explicit on prod, critical on dev for next dev HMR
  - previewUrl injected from PREVIEW_URL env var into Tier 3 workflow step 6 — decoupled from websiteUrl
metrics:
  duration: 2 min
  completed: 2026-02-27
  tasks_completed: 2
  files_modified: 3
---

# Phase 7 Plan 01: Ember Tier 3 Patch — context.js, deploy.js, ecosystem.config.js Summary

**One-liner:** Patched Ember for Tier 3 code/CSS editing — globals.css color token loading, targeted PM2 deploy via PM2_PROD_APP env var, and fork_mode for yapu-dev HMR reliability.

## What Was Built

Three targeted patches to enable Ember's Tier 3 (code + CSS) editing workflow:

1. **context.js — globals.css color token loading (EDIT-10):** `loadEditableContent()` now extracts the `:root { }` and `.dark { }` blocks from `app/globals.css` via regex and appends them to Claude's context. This gives Claude visibility into the OKLCH color variable names and values for color editing.

2. **context.js — Tier 3 system prompt with preview URL (EDIT-07):** The `buildSystemPrompt()` Tier 3 branch was a generic 6-step workflow. Replaced with a YAPU-specific 7-step workflow that: uses `website_read`/`website_edit` tool names explicitly, injects `PREVIEW_URL` env var as the preview link (the running yapu-dev HMR server), forbids `preview_build`, adds CSS color editing guidance, and ends with deploy confirmation. Tier 2 branch is completely unchanged.

3. **deploy.js — targeted PM2 restart (EDIT-09):** Changed `pm2 restart ecosystem.config.js` (restarts all apps) to `pm2 restart ${PM2_PROD_APP}` where `PM2_PROD_APP` defaults to `yapu-prod`. Also increased build timeout 120s -> 180s and PM2 restart timeout 10s -> 15s. Other Ember customers can set their own PM2 app name via env var.

4. **ecosystem.config.js — fork_mode for HMR (EDIT-08):** Added `exec_mode: "fork"` to both PM2 app entries. Critical for `yapu-dev` — `next dev` does not support cluster_mode; fork mode ensures reliable file watching and WebSocket HMR. Harmless for `yapu-prod` (1 instance in fork mode is equivalent).

## Tasks Completed

| Task | Name | Commits | Files Modified |
|------|------|---------|----------------|
| 1 | context.js — globals.css loading + Tier 3 prompt | 2b3968a (promptheus-ember) | lib/context.js |
| 2 | deploy.js PM2 target + ecosystem.config.js fork_mode | a0cf81c (promptheus-ember), bfedd0d (yapu2) | lib/deploy.js, server/ecosystem.config.js |

## Verification Results

All 7 Tier 3 prompt checks passed:
- `hasTier3Workflow`: Prompt contains "Code & Design-Aenderungen"
- `hasPreviewUrl`: Prompt contains PREVIEW_URL value (yapu-preview.promptheus.cloud)
- `hasGlobalsCss`: Prompt contains globals.css and OKLCH
- `hasNoPreviewBuild`: Prompt contains "NIEMALS preview_build"
- `hasDeployStep`: Prompt contains "deploy"
- `hasColorGuidance`: Prompt contains "CSS Custom Properties"
- `hasConfirm`: Prompt contains "Soll ich das so aendern"

Tier 2 backward compatibility verified — Tier 2 prompt unchanged, no Tier 3 workflow leaking.

`ecosystem.config.js`: Both yapu-prod and yapu-dev confirmed as `exec_mode: "fork"`.

`deploy.js`: Source contains `pm2 restart ${pm2AppName}` (not ecosystem.config.js).

## Decisions Made

- **PM2_PROD_APP env var:** Makes `deployToProduction()` configurable per customer. Default `yapu-prod` is correct for YAPU. Other projects override via their Ember `.env` — no code change needed.
- **globals.css regex extract:** Only `:root {}` and `.dark {}` blocks extracted — avoids sending 200+ lines of CSS utilities to Claude. Keeps context lean and focused on editable color tokens.
- **fork_mode on both apps:** Explicit on yapu-prod (was implicit default), critical on yapu-dev. Adding it to both ensures consistency and avoids future ambiguity.
- **previewUrl decoupled from websiteUrl:** Tier 3 step 6 uses `previewUrl || websiteUrl` — if PREVIEW_URL is not set, falls back to production URL. Graceful degradation.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `C:/Users/hmk/promptheus-ember/lib/context.js` modified
- [x] `C:/Users/hmk/promptheus-ember/lib/deploy.js` modified
- [x] `C:/Users/hmk/promptheus/yapu2/server/ecosystem.config.js` modified
- [x] Commit 2b3968a exists in promptheus-ember
- [x] Commit a0cf81c exists in promptheus-ember
- [x] Commit bfedd0d exists in yapu2
