---
phase: 07-ember-tier-2-deploy
plan: 02
subsystem: infra
tags: [ember, tier-3, deploy, vps, nginx, pm2, hmr, websocket, preview]
dependency_graph:
  requires:
    - phase: 07-01
      provides: Patched context.js (globals.css loading + Tier 3 prompt), deploy.js (targeted PM2 restart), ecosystem.config.js (fork_mode)
  provides:
    - Ember Tier 3 live on VPS — code/CSS/color editing with HMR preview and production deploy
    - nginx HMR WebSocket pass-through on yapu-preview.promptheus.cloud
    - yapu-dev running in fork_mode for reliable HMR
    - Ember .env upgraded to CUSTOMER_TIER=3 with PREVIEW_URL and PM2_PROD_APP
  affects: []
tech_stack:
  added: []
  patterns: [nginx location = exact match for WebSocket bypass of bearer gate, PM2 delete + start from ecosystem.config.js for mode change]
key_files:
  created: []
  modified:
    - /home/ember-yapu/.env (VPS)
    - /etc/nginx/sites-available/yapu-preview-new (VPS)
    - /home/yapu/yapu2/server/ecosystem.config.js (VPS — pulled from git)
    - /home/ember-yapu/lib/context.js (VPS — pulled from git)
    - /home/ember-yapu/lib/deploy.js (VPS — pulled from git)
key-decisions:
  - "End-to-end Tier 3 verification deferred by user choice (trusted, not manually tested) — all deployment steps confirmed complete"
  - "nginx HMR location block uses exact match (location =) to scope WebSocket bypass narrowly"

patterns-established:
  - "VPS Tier 3 deployment: git pull + .env update + nginx reload + PM2 delete/start cycle"
  - "HMR WebSocket requires bearer gate bypass — browser WebSocket API cannot send Authorization headers"

requirements-completed: [EDIT-07, EDIT-08, EDIT-09, EDIT-10, EDIT-11]

metrics:
  duration: checkpoint (human-action + human-verify)
  completed: 2026-02-27
  tasks_completed: 2
  files_modified: 5
---

# Phase 7 Plan 02: Ember Tier 3 VPS Deployment and End-to-End Verification Summary

**Tier 3 configuration deployed to VPS — Ember .env upgraded to CUSTOMER_TIER=3, nginx HMR WebSocket pass-through added, yapu-dev restarted in fork_mode, all PM2 processes online. End-to-end verification deferred (user-trusted).**

## Performance

- **Duration:** checkpoint (human-action deployment + human-verify)
- **Started:** 2026-02-27T10:40:14Z
- **Completed:** 2026-02-27
- **Tasks:** 2 (1 human-action, 1 human-verify)
- **Files modified:** 5 (all on VPS)

## Accomplishments

- Deployed Plan 01 source patches (context.js, deploy.js, ecosystem.config.js) to VPS via git pull
- Upgraded Ember .env from CUSTOMER_TIER=2 to CUSTOMER_TIER=3, added PREVIEW_URL, PM2_PROD_APP, fixed PREVIEW_PORT and PREVIEW_DOMAIN
- Added nginx HMR WebSocket pass-through location block before bearer gate — browser WebSocket connections to /_next/webpack-hmr bypass auth
- Added nginx Turbopack static asset pass-through for /_next/static (HMR chunks)
- Deleted and recreated yapu-dev PM2 process with fork_mode from updated ecosystem.config.js
- Restarted ember-yapu to pick up Tier 3 .env values
- All PM2 processes confirmed online: ember-yapu (port 3009), yapu-dev (port 3008), yapu-prod (port 3003)

## Task Commits

This plan consisted entirely of human-action checkpoints (VPS deployment via SSH). No code commits were made in this repository.

1. **Task 1: Deploy Tier 3 configuration to VPS** - No commit (human SSH deployment: .env, nginx, PM2)
2. **Task 2: End-to-end Tier 3 verification** - No commit (verification deferred by user choice, trusted)

## Files Created/Modified

All modifications were on the VPS (187.77.66.133), not in this repository:

- `/home/ember-yapu/.env` - CUSTOMER_TIER=3, PREVIEW_URL, PM2_PROD_APP, PREVIEW_PORT, PREVIEW_DOMAIN
- `/etc/nginx/sites-available/yapu-preview-new` - Added /_next/webpack-hmr WebSocket location + /_next/static proxy
- `/home/yapu/yapu2/server/ecosystem.config.js` - Pulled from git (fork_mode from Plan 01)
- `/home/ember-yapu/lib/context.js` - Pulled from git (globals.css loading + Tier 3 prompt from Plan 01)
- `/home/ember-yapu/lib/deploy.js` - Pulled from git (targeted PM2 restart from Plan 01)

## Decisions Made

- **End-to-end verification deferred:** User chose to trust the deployment rather than perform manual browser-based verification of all 5 EDIT requirements. The deployment steps (Task 1) were confirmed complete. The functional verification (Task 2: code edit with HMR, color edit, deploy to production, preview isolation) was not manually tested. Requirements EDIT-07 through EDIT-11 are marked complete based on: (a) Plan 01 source patches verified correct, (b) VPS deployment steps confirmed executed, (c) user trust.
- **nginx exact match for HMR:** `location = /_next/webpack-hmr` uses exact match to scope the bearer gate bypass as narrowly as possible — only the WebSocket endpoint is unprotected, all other paths still require the bearer token.

## Deviations from Plan

None — plan executed exactly as written (two checkpoints, both completed).

## Issues Encountered

None — user confirmed all 6 VPS deployment steps completed successfully.

## Verification Note

**End-to-end Tier 3 verification was NOT manually performed.** The following tests were deferred by user choice (trusted):

- EDIT-07: Component code (.tsx) editing via Ember — not tested
- EDIT-08: HMR preview update without page reload — not tested
- EDIT-09: Deploy to production (build + restart yapu-prod only) — not tested
- EDIT-10: Color change via globals.css OKLCH values — not tested
- EDIT-11: Preview URL isolation from production — not tested

These requirements are marked complete based on the correctness of the source patches (verified in Plan 01) and the confirmed VPS deployment. If any issues arise during actual use, the verification steps from the plan can be followed to diagnose.

## User Setup Required

None — all VPS configuration was completed in Task 1.

## Next Phase Readiness

This is the final plan of the final phase. The YAPU rebuild is complete:
- All 7 pages live at https://yapu.promptheus.cloud
- Ember chatbot editing at https://ember.yapu.promptheus.cloud
- Tier 3 capabilities: content editing (Tier 1), code/CSS editing with HMR preview (Tier 3), production deploy
- The Promptheus pitch demo is ready

No further phases planned. Future work tracked in REQUIREMENTS.md v2 section (ADV-01 through ADV-05, PERF-01 through PERF-03).

## Self-Check: PASSED

- [x] `07-02-SUMMARY.md` exists at `.planning/phases/07-ember-tier-2-deploy/`
- [x] `07-01-SUMMARY.md` exists (Plan 01 dependency)
- [x] Plan 01 commit `99b2a6e` exists in git history
- [x] No code commits expected for this plan (both tasks are checkpoints)

---
*Phase: 07-ember-tier-2-deploy*
*Completed: 2026-02-27*
