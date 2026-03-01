---
phase: 02-infrastructure
plan: 03
subsystem: infra
tags: [nginx, pm2, ssl, dns, deployment, vps, certbot, bearer-auth]

# Dependency graph
requires:
  - phase: 02-infrastructure
    plan: 01
    provides: Content API with bearer auth, build output isolation via distDir
  - phase: 02-infrastructure
    plan: 02
    provides: PM2 ecosystem config, nginx reverse proxy configs, deploy script, env template

provides:
  - Live production site at https://yapu.promptheus.cloud over HTTPS
  - Bearer-gated preview at https://yapu-preview.promptheus.cloud (403 without token, 200 with)
  - End-to-end Content API write round-trip confirmed on live VPS
  - PM2 persistence configured — both instances survive reboots
  - SSL certificates via Let's Encrypt / certbot for both subdomains
affects: [03-preview, 04-content, 05-pages, 06-ember-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Two-subdomain split — yapu.promptheus.cloud (prod, port 3003) and yapu-preview.promptheus.cloud (preview, port 3008)
    - nginx bearer token gate blocks preview subdomain for unauthenticated requests
    - certbot --nginx auto-patches nginx config for SSL termination
    - PM2 ecosystem.config.js manages two named processes (yapu-prod, yapu-dev) on separate ports
    - pm2 save + pm2 startup enables reboot persistence without manual systemd unit files

key-files:
  created: []
  modified: []

key-decisions:
  - "Production verified on port 3003, preview on port 3008 — consistent with server/ecosystem.config.js"
  - "Preview nginx bearer token gate confirmed working: 403 without Authorization header, 200 with valid token"
  - "PM2 persistence: pm2 save + pm2 startup executed — both instances survive reboots"
  - "Content API write round-trip verified live: POST -> visible on page reload -> revert confirmed"
  - "Security headers (X-Content-Type-Options, HSTS, Referrer-Policy) confirmed on production responses"

patterns-established:
  - "VPS deployment: copy nginx configs to sites-available, symlink to sites-enabled, nginx -t, systemctl reload"
  - "certbot --nginx auto-configures SSL — run after nginx config is live, before PM2 start"
  - "Content API live verification: write test -> curl page -> grep for title -> revert"

requirements-completed: [INFRA-01, INFRA-02, INFRA-03, INFRA-04, INFRA-05, EDIT-01, EDIT-03]

# Metrics
duration: human-action
completed: 2026-02-26
---

# Phase 02 Plan 03: Infrastructure Summary

**Production site live at yapu.promptheus.cloud (HTTPS), preview bearer-gated at yapu-preview.promptheus.cloud, Content API write round-trip verified on VPS with PM2 persistence for both instances**

## Performance

- **Duration:** Human-action checkpoint (user-performed VPS deployment)
- **Started:** 2026-02-26T18:33:50Z
- **Completed:** 2026-02-26
- **Tasks:** 1 (human-action)
- **Files modified:** 0 (VPS configuration only — no codebase changes)

## Accomplishments

- DNS A records created for both `yapu.promptheus.cloud` and `yapu-preview.promptheus.cloud` pointing to 187.77.66.133
- SSL certificates issued via certbot for both subdomains — HTTPS confirmed active
- nginx configured with reverse proxy: production on port 3003, preview on port 3008
- Preview subdomain returns 403 without Authorization bearer token, 200 with valid token — access control confirmed
- Production site: 307 -> /en -> 200 (i18n locale redirect working correctly)
- Security headers confirmed: X-Content-Type-Options, HSTS, Referrer-Policy on production responses
- Content API write round-trip verified on live production: POST with auth writes JSON, change visible on page reload, revert successful
- PM2 running both `yapu-prod` and `yapu-dev` with 0 restarts — both show "online"
- PM2 persistence configured: `pm2 save` + `pm2 startup` executed for reboot survival

## Task Commits

This plan was a human-action checkpoint. No code commits were made — all VPS configuration was performed manually on the server. Code was committed in Plans 01 and 02.

**Pre-existing commits from Plans 01 and 02:**
- `dbd1f68` - feat(02-01): Build separation and force-dynamic on all content pages
- `aa236ea` - feat(02-01): Content API route handler with bearer auth and Zod validation
- (Plan 02 commits) - PM2 ecosystem config, nginx configs, deploy script, env template

## Files Created/Modified

None — this plan verified VPS infrastructure only. All code artifacts were created in Plans 01 and 02. VPS configuration (nginx sites, PM2 processes, SSL certs, .env.local) lives on the server at `/home/yapu/yapu2/`, not tracked in git.

## Decisions Made

- Production on port 3003, preview on port 3008 — consistent with server/ecosystem.config.js committed in Plan 02
- certbot run after nginx config was live — auto-patches conf file for SSL termination
- PM2 persistence via `pm2 save` + `pm2 startup` — no manual systemd unit files required
- Content API live round-trip (write -> page reload -> verify -> revert) used as definitive verification of the full stack

## Deviations from Plan

None — plan executed exactly as written. All 8 verification checks passed on first attempt.

## Issues Encountered

None. All verification checks passed cleanly:

| Check | Status | Details |
|-------|--------|---------|
| DNS — both subdomains | PASS | Resolve to 187.77.66.133 |
| SSL/HTTPS — both subdomains | PASS | Certbot certificates active |
| Production site | PASS | 307 -> /en -> 200, security headers present |
| Preview without auth | PASS | 403 Forbidden with CORS headers |
| Preview with auth | PASS | 200 OK |
| Content API without auth | PASS | `{"error":"Unauthorized"}` |
| Content API write round-trip | PASS | Write confirmed visible, revert confirmed |
| PM2 both instances | PASS | yapu-prod and yapu-dev online, 0 restarts |

## User Setup Required

None — environment was configured on VPS during this checkpoint. `.env.local` is live on the server with real tokens. No additional setup needed.

## Next Phase Readiness

- Phase 2 complete — all infrastructure is live and verified end-to-end
- Production site publicly accessible at https://yapu.promptheus.cloud
- Content API functional and round-trip tested on production
- Preview subdomain bearer-gated and working for development use
- Phase 3 (preview workflow) can proceed — dev server running at yapu-preview.promptheus.cloud
- Phase 4 (content) can begin — JSON content files editable via Content API with auth

## Self-Check: PASSED

- Production site accessible: CONFIRMED by user (HTTP 200 after locale redirect)
- Preview 403 without token: CONFIRMED by user
- Preview 200 with token: CONFIRMED by user
- Content API unauthorized: CONFIRMED (`{"error":"Unauthorized"}`)
- Content API write round-trip: CONFIRMED (write -> visible -> revert)
- PM2 both online: CONFIRMED (`pm2 list` shows yapu-prod and yapu-dev online)
- SSL active on both subdomains: CONFIRMED

---
*Phase: 02-infrastructure*
*Completed: 2026-02-26*
