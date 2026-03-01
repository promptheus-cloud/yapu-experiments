---
phase: 06-ember-integration-tier-1
plan: 01
subsystem: infra
tags: [ember, chatbot, locale, system-prompt, tier2]

# Dependency graph
requires:
  - phase: 05-compliance-integration
    provides: All content pages finalized, EN/FR/ES JSON content complete
provides:
  - Dynamic locale detection in Ember context.js (reads content/data/ subdirectories)
  - Tier 2 system prompt with confirm-before-write, no preview_build, production URL link
  - Tier 3 backward compatibility retained
affects: [06-02, ember-integration, promptheus-ember]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tier-based workflowInstructions branching in buildSystemPrompt"
    - "Dynamic readdir(contentDir) for locale detection instead of hardcoded list"
    - "WEBSITE_URL env var injected into Tier 2 post-edit confirmation message"

key-files:
  created: []
  modified:
    - "C:/Users/hmk/promptheus-ember/lib/context.js"

key-decisions:
  - "Dynamic locale detection via readdir(contentDir) — works for any locale set (en/fr/es, de/en, etc.) without code changes"
  - "Tier 2 workflow: confirm-before-write, NIEMALS preview_build/deploy, auto-update all locales"
  - "WEBSITE_URL env var controls post-edit URL shown to customer — optional, blank-safe"
  - "workflowInstructions is a const computed before the return template — clean branching, Tier 3 retains preview+deploy"

patterns-established:
  - "Tier 2 system prompt: no preview_build, no deploy, confirm before every edit, update all locale dirs"
  - "Dynamic locale list from filesystem — repo locale changes are automatically reflected in Ember context"

requirements-completed: [EDIT-02, EDIT-04, EDIT-05, EDIT-06]

# Metrics
duration: 2min
completed: 2026-02-27
---

# Phase 6 Plan 01: Ember Integration Tier 1 Summary

**Ember context.js patched with dynamic EN/FR/ES locale detection and YAPU Tier 2 confirm-before-write system prompt replacing hardcoded DE/EN workflow**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-27T09:49:59Z
- **Completed:** 2026-02-27T09:51:54Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Replaced hardcoded `['de', 'en']` locale loop with `readdir(contentDir)` — YAPU's EN/FR/ES content now fully loaded into Ember's Claude system prompt
- Added tier-aware `workflowInstructions` variable: Tier 2 (YAPU) gets confirm-before-write workflow with no preview_build/deploy calls; Tier 3+ retains existing preview+deploy flow
- Added `WEBSITE_URL` env var support so Tier 2 post-edit message can link directly to production site
- All 5 verification checks pass: EN/FR/ES locales detected, confirmation step present, NIEMALS preview_build, URL in prompt, Tier 3 backward compat

## Task Commits

Each task was committed atomically:

1. **Task 1: Patch loadEditableContent for dynamic locale detection** - `ee20744` (feat)
2. **Task 2: Update system prompt for YAPU Tier 1 workflow** - `1a0334b` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `C:/Users/hmk/promptheus-ember/lib/context.js` - Dynamic locale detection + tier-aware Tier 2/Tier 3 workflow system prompt

## Decisions Made
- Dynamic locale detection via `readdir(contentDir)` — zero-configuration, any repo locale structure works automatically
- `workflowInstructions` computed as a `const` before the template string, using a ternary on `tier === 2` — mirrors the existing `tierRules` pattern for consistency
- Tier 2 explicitly forbids `preview_build` and `deploy` (force-dynamic SSR means edits are live instantly after `website_edit`)
- `WEBSITE_URL` is optional — blank-safe, no URL shown if env var not set

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Shell escaping: The plan's `node -e` verification commands used `!` which bash escapes. Resolved by writing temporary `.mjs` scripts and running them directly. Test scripts removed after verification.

## Next Phase Readiness
- Ember context.js is YAPU-ready: loads EN/FR/ES content, enforces Tier 2 confirm-before-write workflow
- Ready for Phase 6 Plan 02 (Ember deployment / server-side .env configuration on yapu server)

---
*Phase: 06-ember-integration-tier-1*
*Completed: 2026-02-27*
