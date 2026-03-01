---
phase: 02-infrastructure
plan: 02
subsystem: server-config
tags: [pm2, nginx, deploy, infrastructure, bearer-auth, cors]
dependency_graph:
  requires: []
  provides: [server/ecosystem.config.js, server/deploy.sh, server/nginx-yapu-prod.conf, server/nginx-yapu-preview.conf, .env.example]
  affects: [vps-deployment, preview-access]
tech_stack:
  added: []
  patterns: [two-instance-pm2, nginx-bearer-gate, cors-preflight-nginx]
key_files:
  created:
    - server/ecosystem.config.js
    - server/deploy.sh
    - server/nginx-yapu-prod.conf
    - server/nginx-yapu-preview.conf
    - .env.example
  modified:
    - .gitignore
decisions:
  - "PM2 two-app config uses next start -p 3002 (prod) and next dev -p 3003 (dev) on same codebase directory"
  - "Deploy script uses conditional npm ci — only runs when package-lock.json changed, saving time on content-only deploys"
  - "nginx preview config handles OPTIONS preflight BEFORE bearer token check to avoid CORS preflight failures"
  - "SSL cert lines commented out in nginx configs — certbot populates them at VPS setup time, avoiding nginx test failures before certs exist"
  - ".gitignore exception added for .env.example (!.env.example) so template can be committed while .env.local stays secret"
metrics:
  duration: 3 min
  completed: 2026-02-26
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 02: Server Deployment Configuration Summary

**One-liner:** PM2 two-instance config (yapu-prod/yapu-dev on ports 3002/3003), nginx reverse proxies with bearer token gate and CORS for preview, and deploy script with --prod/--dev/--all flags.

## What Was Built

All server-side configuration files needed to deploy the two-instance architecture on the Promptheus VPS:

- **`server/ecosystem.config.js`** — PM2 config defining two apps sharing `/home/yapu/yapu2` codebase: `yapu-prod` (next start, port 3002) and `yapu-dev` (next dev, port 3003)
- **`server/deploy.sh`** — Deploy script with `--prod` (build + restart), `--dev` (restart only), and `--all` (both) flags; conditional npm ci; pm2 save at end for reboot survival
- **`server/nginx-yapu-prod.conf`** — HTTPS reverse proxy for yapu.promptheus.cloud to port 3002; security headers, static asset caching with 365d expiry; complete DNS + VPS setup steps in comments
- **`server/nginx-yapu-preview.conf`** — HTTPS reverse proxy for yapu-preview.promptheus.cloud to port 3003; bearer token gate returning 403 without Authorization header; CORS headers; frame-ancestors * for Ember iframe embedding; OPTIONS preflight handled before auth check
- **`.env.example`** — Template documenting CONTENT_API_SECRET and PREVIEW_ACCESS_TOKEN with openssl generation instructions

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | PM2 ecosystem config and deploy script | fc67bfe | server/ecosystem.config.js, server/deploy.sh |
| 2 | nginx configs, env template, and DNS documentation | 2fea94c | server/nginx-yapu-prod.conf, server/nginx-yapu-preview.conf, .env.example, .gitignore |

## Decisions Made

1. **PM2 instance naming**: `yapu-prod` and `yapu-dev` — matches the naming convention from RESEARCH.md for clarity in `pm2 list` output
2. **Conditional npm ci**: Deploy script checks `git diff HEAD~1 -- package-lock.json` before running `npm ci` — saves ~30-60s on content-only deploys
3. **OPTIONS preflight before bearer check**: nginx `if ($request_method = 'OPTIONS')` block appears before the bearer token check to prevent CORS preflight requests from failing with 403 before the browser can send the actual request with the Authorization header
4. **SSL lines commented in nginx configs**: Certbot requires nginx to be running to validate domains; commenting out SSL lines lets nginx start with HTTP-only first, then certbot adds SSL
5. **.gitignore exception for .env.example**: The default Next.js `.gitignore` has `.env*` which blocked `.env.example`. Added `!.env.example` negation rule.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] .gitignore blocked .env.example from being committed**
- **Found during:** Task 2
- **Issue:** Default Next.js `.gitignore` pattern `.env*` matched `.env.example`, preventing it from being staged
- **Fix:** Added `!.env.example` negation line to `.gitignore` so the template file can be committed while actual `.env.local` remains secret
- **Files modified:** `.gitignore`
- **Commit:** 2fea94c

## VPS Setup Reference

The `server/nginx-yapu-prod.conf` file contains the full 12-step VPS setup procedure including:
- DNS A records required (yapu.promptheus.cloud and yapu-preview.promptheus.cloud both pointing to VPS IP)
- nginx config deployment and symlinking
- certbot SSL certificate issuance for both subdomains
- .env.local creation from .env.example
- PM2 startup and pm2 save for reboot survival

## Self-Check: PASSED

All files verified present:
- FOUND: server/ecosystem.config.js
- FOUND: server/deploy.sh
- FOUND: server/nginx-yapu-prod.conf
- FOUND: server/nginx-yapu-preview.conf
- FOUND: .env.example
- FOUND: .planning/phases/02-infrastructure/02-02-SUMMARY.md

All commits verified:
- FOUND: fc67bfe (Task 1 — PM2 ecosystem config and deploy script)
- FOUND: 2fea94c (Task 2 — nginx configs, env template, DNS documentation)
