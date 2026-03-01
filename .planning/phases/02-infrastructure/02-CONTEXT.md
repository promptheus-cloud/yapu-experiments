# Phase 2: Infrastructure - Context

**Gathered:** 2026-02-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Two-instance PM2 deployment on the Promptheus VPS — production serving public visitors over HTTPS, dev/preview serving Ember — with nginx reverse proxy, SSL, a Content API that writes JSON and triggers revalidation, and a deploy script. No UI work, no Ember chat logic, no component building.

</domain>

<decisions>
## Implementation Decisions

### Domains & naming
- Claude chooses subdomains (production and preview) on the Promptheus domain — consistent naming convention
- Claude chooses PM2 app names consistent with subdomain choice
- Deploy script supports independent targets: `--prod`, `--dev`, `--all` flags to deploy instances separately

### Content API design
- Claude decides auth mechanism (bearer token or API key) — simplest secure approach for single-client (Ember) access
- Claude decides request body format — map cleanly to `content/data/{locale}/{file}.json` structure
- **Validate JSON structure before writing** — API checks content matches expected schema, prevents broken pages from bad writes
- **Support partial merge updates** — Ember can patch specific fields (e.g., `{ "patch": { "hero.title": "New Title" } }`) rather than replacing entire files. Less error-prone for Ember editing flow.

### Dev server access
- **Bearer token check in nginx** — preview subdomain requires Authorization header; Ember includes it, browsers without it get 403
- **Build for cross-origin access** — Ember's hosting location TBD, so include CORS headers and cross-origin iframe permissions to be safe
- Claude decides 403 response style (generic or branded)
- Claude decides Content API host placement (production-only vs both instances)

### VPS & existing state
- **Shared VPS** — other Promptheus apps already running with their own nginx configs and PM2 processes
- **Ports need verification** — 3000/3001 from requirements may be taken; researcher must check during planning
- **Tooling needs verification** — nginx and certbot may already be installed from other projects; researcher should confirm
- **User manages DNS** — can create A/CNAME records; wants documentation of exactly which DNS records to create (subdomains → VPS IP)

### Claude's Discretion
- Production and preview subdomain names
- PM2 app names
- Auth mechanism (bearer token vs API key)
- Content API request/response body format
- 403 page style for unauthorized dev access
- Whether Content API lives on prod only or both instances
- Port numbers (if 3000/3001 are taken)

</decisions>

<specifics>
## Specific Ideas

- Deploy script should work like the existing Promptheus pattern in `server/deploy.sh` but with the `--prod`/`--dev`/`--all` flag extension
- DNS documentation should be clear enough for the user to create records without further assistance — list exact subdomain → IP mappings needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-infrastructure*
*Context gathered: 2026-02-26*
