---
phase: 06-ember-integration-tier-1
plan: 02
subsystem: infra
tags: [ember, chatbot, vps, nginx, pm2, ssl, deployment, content-editing]

# Dependency graph
requires:
  - phase: 06-ember-integration-tier-1-plan-01
    provides: Ember context.js patched with dynamic EN/FR/ES locale detection and Tier 2 confirm-before-write system prompt
provides:
  - Running Ember instance at ember.yapu.promptheus.cloud with SSL and auth gate
  - End-to-end content editing workflow verified (natural language -> JSON write -> live production)
  - Ember connected to YAPU repo at /home/yapu/yapu2 via WEBSITE_REPO_PATH
  - PM2 process (ember-yapu) configured for auto-restart
affects: [ember-integration, yapu-production, promptheus-demo]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Ember deployed at /home/ember/ on VPS, separate from YAPU repo at /home/yapu/yapu2"
    - "nginx reverse proxy: ember.yapu.promptheus.cloud -> port 3005 with proxy_buffering off for SSE"
    - "PM2 process name: ember-yapu, pm2 save executed for reboot persistence"
    - "WEBSITE_REPO_PATH=/home/yapu/yapu2 connects Ember to YAPU content JSON files"

key-files:
  created:
    - "/home/ember/.env.local (VPS) - Ember configuration: ANTHROPIC_API_KEY, AUTH_TOKEN, WEBSITE_REPO_PATH, CUSTOMER_NAME, CUSTOMER_TIER=2, PORT=3005"
    - "/etc/nginx/sites-available/ember-yapu (VPS) - nginx reverse proxy config with SSL for ember.yapu.promptheus.cloud"
  modified: []

key-decisions:
  - "Ember deployed to /home/ember/ (separate from YAPU repo) — clean separation between chatbot and website code"
  - "Tier 2 revert via re-edit not git revert — Ember writes original values back via website_edit calls (6 commits instead of 1); acceptable at demo stage, could be improved with git revert tooling"
  - "Chat UI message ordering bug noted but non-blocking — frontend CSS/JS issue in Ember, not context.js; deferred to future Ember fix"
  - "All 3 locales (EN/ES/FR) updated simultaneously on content edit — confirms dynamic locale detection from Plan 01 works end-to-end on production"

patterns-established:
  - "YAPU Ember workflow: natural language -> Claude reads JSON -> confirm prompt -> website_edit -> JSON updated -> production URL shown"
  - "force-dynamic SSR means content changes are visible on production within one page reload, no rebuild needed"
  - "Auth gate pattern: AUTH_TOKEN in .env.local, Ember UI prompts for token, /api/auth returns {ok:true,customer,tier}"

requirements-completed: [EDIT-02, EDIT-04, EDIT-05, EDIT-06]

# Metrics
duration: human-executed
completed: 2026-02-27
---

# Phase 6 Plan 02: Ember Deployment and End-to-End Verification Summary

**Ember deployed to VPS at ember.yapu.promptheus.cloud with SSL, PM2, and nginx; full content editing workflow verified — natural language edit updates YAPU production JSON and is live within one page reload**

## Performance

- **Duration:** Human-executed (checkpoint tasks)
- **Started:** 2026-02-27
- **Completed:** 2026-02-27
- **Tasks:** 2 (both human checkpoints)
- **Files modified:** 0 (all changes on VPS, not in repo)

## Accomplishments

- Ember deployed and running on VPS at `/home/ember/` with PM2 process `ember-yapu` on port 3005
- nginx configured with SSL for `ember.yapu.promptheus.cloud` — proxy_buffering off for SSE streaming
- EDIT-02 verified: natural language content edit updated hero headline in EN/ES/FR simultaneously via `website_edit`
- EDIT-04 verified: production URL `https://yapu.promptheus.cloud` provided in Ember confirmation message after edit
- EDIT-05 verified: confirmation prompt "Soll ich das so andern?" shown before any file write
- EDIT-06 verified: homepage edit did not affect `investor-services.json` or other page content files
- force-dynamic SSR confirmed: edited content visible on production within one page reload, no rebuild triggered

## Task Commits

Both tasks were human-executed checkpoint steps — no code commits in this repo.

1. **Task 1: Deploy Ember to VPS and configure for YAPU** — Human action (SSH deployment, nginx + SSL + PM2 setup)
2. **Task 2: End-to-end content editing verification** — Human verify (browser testing of all 4 EDIT requirements)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

All changes were made directly on the VPS, not in this repo:

- `/home/ember/.env.local` (VPS) — Ember config: ANTHROPIC_API_KEY, AUTH_TOKEN, WEBSITE_REPO_PATH=/home/yapu/yapu2, CUSTOMER_TIER=2, PORT=3005
- `/etc/nginx/sites-available/ember-yapu` (VPS) — nginx reverse proxy with SSL for ember.yapu.promptheus.cloud -> port 3005
- PM2 process `ember-yapu` registered and saved on VPS

## Decisions Made

- Revert mechanism: Ember re-edits values back to originals via `website_edit` x3 (one per locale) rather than running `git revert` — this produces 6 commits instead of 1 but is functionally correct; git revert tooling would be a Tier 3 improvement
- Chat UI message ordering bug noted (bot responses sometimes render above user messages) — this is a frontend rendering bug in Ember's chat UI, not a context.js or workflow issue; deferred to future Ember development
- All 3 locales confirmed updated simultaneously on a single edit request — validates the dynamic locale detection pattern from Plan 01 works correctly in production

## Deviations from Plan

None — plan executed exactly as written. Both known issues (message ordering bug, re-edit vs git revert) were noted during verification and are non-blocking for demo purposes.

## Issues Encountered

**1. Chat UI message ordering bug (non-blocking)**
- Bot responses occasionally rendered above user messages in the Ember chat UI
- Root cause: frontend CSS/JS rendering issue in Ember, not context.js
- Impact: Cosmetic only — content edits worked correctly despite display issue
- Resolution: Noted as known issue; deferred to future Ember frontend fix

**2. Revert uses re-edit not git revert (non-blocking)**
- When asked to revert a change, Ember wrote original values back via `website_edit` x3 (one per locale)
- Produces 6 commits instead of 1 clean `git revert` commit
- Root cause: Ember's tool set does not include a git revert tool; it uses available tools to achieve the goal
- Impact: Git history is noisier than ideal; functionally correct
- Resolution: Acceptable at demo stage; could be improved by adding git revert to Ember's tool set

## User Setup Required

The following was required for this plan (completed by human):

- **ANTHROPIC_API_KEY** — Set in `/home/ember/.env.local` on VPS (from Anthropic Console)
- **AUTH_TOKEN** — Generated random token set in `/home/ember/.env.local` on VPS
- **DNS A record** — `ember.yapu.promptheus.cloud` pointing to 187.77.66.133 (via Cloudflare)
- **SSL certificate** — Issued via `certbot certonly --nginx -d ember.yapu.promptheus.cloud`

## Next Phase Readiness

- Ember integration is complete for YAPU Tier 1 demo
- Live at: https://ember.yapu.promptheus.cloud
- YAPU production site: https://yapu.promptheus.cloud
- Phase 6 is now fully complete — both plans done
- Phase 7 (if planned): Additional Tier 2 improvements (git revert tooling, chat UI fixes) or replication to other portfolio sites

---
*Phase: 06-ember-integration-tier-1*
*Completed: 2026-02-27*
