# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-26)

**Core value:** YAPU sees their own site running on Promptheus technology with chatbot-editing as the key differentiator
**Current focus:** PROJECT COMPLETE — All 7 phases finished

## Current Position

Phase: 7 of 7 (Ember Tier 2 + Deploy — COMPLETE)
Plan: 2 of 2 complete in current phase
Status: PROJECT COMPLETE — All 7 phases executed. Tier 3 deployed to VPS, end-to-end verification deferred (user-trusted).
Last activity: 2026-02-27 — Phase 7 Plan 02: Tier 3 VPS deployment + verification (EDIT-07, EDIT-08, EDIT-09, EDIT-10, EDIT-11)

Progress: [██████████] 100%

Last session: 2026-02-27
Stopped at: Completed 07-02-PLAN.md — Tier 3 deployed to VPS, all PM2 processes online. PROJECT COMPLETE.

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 7 min (excluding human-action checkpoint)
- Total execution time: 0.45 hours (code plans only)

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 18 min | 9 min |
| 02-infrastructure | 3 | 9 min + checkpoint | 5 min |

**Recent Trend:**
- Last 5 plans: 8 min, 10 min, 6 min, 3 min, checkpoint
- Trend: stable

*Updated after each plan completion*
| Phase 02-infrastructure P03 | checkpoint | 1 tasks | 0 files |
| Phase 03-ui-components P01 | 4 | 2 tasks | 14 files |
| Phase 03-ui-components P03 | 2 | 2 tasks | 6 files |
| Phase 03-ui-components P02 | 2 | 1 tasks | 1 files |
| Phase 03-ui-components P04 | 2 | 1 tasks | 3 files |
| Phase 04-page-assembly P01 | 9 | 2 tasks | 13 files |
| Phase 04-page-assembly P02 | 6 | 2 tasks | 12 files |
| Phase 04-page-assembly P03 | 5 | 2 tasks | 13 files |
| Phase 04-page-assembly P04 | 5min | 1 task | 0 files |
| Phase 04.1-visual-fidelity P01 | 2 | 2 tasks | 7 files |
| Phase 04.1-visual-fidelity P02 | 2 | 2 tasks | 8 files |
| Phase 04.2-visual-pixel-match P01 | 3 | 2 tasks | 8 files |
| Phase 04.2-visual-pixel-match P02 | 5min | 2 tasks | 2 files |
| Phase 05-compliance-integration P01 | 2 | 2 tasks | 7 files |
| Phase 05-compliance-integration P02 | 2 | 2 tasks | 12 files |
| Phase 07-ember-tier-2-deploy P01 | 2 | 2 tasks | 3 files |
| Phase 07-ember-tier-2-deploy P02 | checkpoint | 2 tasks | 5 files (VPS) |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Use `force-dynamic` on all content pages from day one (not `revalidateTag`) — acceptable tradeoff at demo stage, avoids stale cache pitfall
- Two-instance architecture: separate `.next/` directories required — must be validated in Phase 2 spike before any Tier 2 work
- System fonts over Museo Sans Rounded — no licensing cost, acceptable for demo stage
- proxy.ts (not middleware.ts) for Next.js 16 middleware naming convention
- hasLocale guard required in every component to narrow string params to typed Locale union (next-intl v4 pattern)
- i18n/request.ts dynamically imports messages by locale — avoids bundle bloat
- Root app/layout.tsx is pass-through — locale layout (app/[locale]/layout.tsx) owns html/body
- [Phase 01-foundation]: OKLCH color tokens declared as CSS custom properties so dark mode can override them independently
- [Phase 01-foundation]: readContent falls back to EN when locale file is missing to avoid 404 on partially-translated pages
- [Phase 01-foundation]: hasLocale guard required in Navigation switchLocale to narrow string to typed Locale union (next-intl v4 pattern)
- [Phase 02-infrastructure]: PM2 two-app config shares single codebase — yapu-prod uses next start (port 3002), yapu-dev uses next dev (port 3003)
- [Phase 02-infrastructure]: nginx OPTIONS preflight must be handled before bearer token check to prevent CORS preflight 403 failures
- [Phase 02-infrastructure]: .env.example negation rule added to .gitignore so template is committable while .env.local stays gitignored
- [Phase 02-infrastructure 02-01]: Zod v4 z.record() requires two args (keyType, valueType) — single-arg form was Zod v3 API
- [Phase 02-infrastructure 02-01]: distDir: '.next-prod' in next.config.ts validated — dev uses .next/, prod build uses .next-prod/ — two-instance blocker resolved
- [Phase 02-infrastructure 02-03]: Production verified on port 3003, preview on port 3008 — consistent with server/ecosystem.config.js
- [Phase 02-infrastructure 02-03]: Content API live write round-trip verified: POST -> visible on page reload -> revert confirmed on production
- [Phase 02-infrastructure 02-03]: PM2 persistence: pm2 save + pm2 startup executed — both instances survive reboots
- [Phase 03-ui-components]: shadcn add --yes works without --legacy-peer-deps in current CLI
- [Phase 03-ui-components]: CSS @keyframes inside @theme inline block creates animate-* Tailwind utilities in v4
- [Phase 03-ui-components]: Homepage JSON uses top-level section keys (serviceModules, testimonial, partnerLogos, clientLogos) for typed access
- [Phase 03-ui-components]: PartnerCarousel and ClientCarousel kept as separate components (not generic) to avoid prop-driven complexity
- [Phase 03-ui-components]: Newsletter useTranslations('Newsletter') — all UI strings from messages JSON, no hardcoded text
- [Phase 03-ui-components]: Carousel placeholder logos use div boxes not img — real images deferred to Phase 4
- [Phase 03-ui-components]: Nav background is bg-accent (Mint #45B5B4) not Dark Teal — matches live YAPU site
- [Phase 03-ui-components]: NavSections defined as TypeScript constant inside component — structural UI not JSON content
- [Phase 03-ui-components]: Footer receives all translated strings via props — layout calls getTranslations and passes strings down, keeping Footer a pure server component
- [Phase 03-ui-components]: Layout wraps children in main.min-h-screen so page.tsx uses React fragment instead of nested main element
- [Phase 04-page-assembly]: CDN logos are JPGs saved as .png extension; JSON updated to match actual CDN-available logos (12 partners, 15 clients from live carousel)
- [Phase 04-page-assembly]: YAPU SVG logo has white fill (.st0 class) - works on both accent nav and dark brand footer backgrounds
- [Phase 04-page-assembly]: Subpage i18n namespaces match route names: InvestorServices, DataInsights, DigitalTools, Impact, News, About
- [Phase 04-page-assembly 04-03]: News articles are EN-only — FR/ES news.json files contain same articles array but translated hero
- [Phase 04-page-assembly 04-03]: NewsFilter 'use client' is the only client component in Phase 4 — clean server/client boundary
- [Phase 04-page-assembly 04-03]: SDG_COLORS Record<number, string> map is the pattern for SDG badge coloring — reusable across Investor Services page
- [Phase 04-page-assembly 04-03]: Contact form submit button type='button' not type='submit' — visual-only, Phase 5 adds backend handler
- [Phase 04-page-assembly 04-02]: Icon maps as Record<string, LucideIcon> resolve icon name strings from JSON at render time with fallback — pattern for all subpage icon grids
- [Phase 04-page-assembly 04-02]: Inline ContentSection helper component in digital-tools/page.tsx reduces 5 repeating alternating sections to clean single-call pattern
- [Phase 04-page-assembly 04-04]: Visual pixel-accuracy gaps vs yapu.solutions deferred to Phase 4.1 — page assembly goal (content structure + all sections present) declared met by human verification
- [Phase 04.1-visual-fidelity]: Navigation background corrected from bg-accent (mint) to bg-white — overrides Phase 03 decision based on incorrect reference; live yapu.solutions nav is white
- [Phase 04.1-visual-fidelity]: White SVG logo made visible on white nav using CSS filter brightness(0) saturate(100%) — avoids duplicate logo assets
- [Phase 04.1-visual-fidelity]: Hero bgClass? optional prop defaults to bg-brand — zero breaking change for existing pages, Impact/About can override
- [Phase 04.1-visual-fidelity]: rounded-full is the YAPU design language for all CTA buttons — pill shape applied globally across all shared components
- [Phase 04.1-visual-fidelity 04.1-02]: Impact page hero replaced with inline section using linear-gradient(90deg, rgba(213,186,0,1) 0%, rgba(213,186,0,0.85) 100%) — unique gold gradient, Hero component import removed
- [Phase 04.1-visual-fidelity 04.1-02]: bg-gray-50 is the canonical alternating section background for all page files — bg-muted/30 and bg-muted/5 are not used
- [Phase 04.1-visual-fidelity 04.1-02]: bg-brand for step/sequence number circles (Investor Services); bg-cta for CTA submit buttons (About contact form)
- [Phase 04.2-visual-pixel-match]: ServiceModules uses sectionConfig Record keyed by module id — clean per-section styling without prop drilling
- [Phase 04.2-visual-pixel-match]: ServiceModule interface: bullets string[] + readMoreText string replaces description + icon — matches yapu.solutions content model
- [Phase 04.2-visual-pixel-match]: Hero ctaHref changed from /en/about to https://my.yapu.solutions — direct app link matches original CTA
- [Phase 04.2-visual-pixel-match 04.2-02]: Newsletter section uses bg-brand (dark teal) with text-white — matches yapu.solutions dark treatment
- [Phase 04.2-visual-pixel-match 04.2-02]: Newsletter submit button uses bg-accent text-brand (mint button, dark teal text) — matches yapu.solutions mint CTA
- [Phase 04.2-visual-pixel-match 04.2-02]: PartnerCarousel grayscale removed — partner logos always full color, matching yapu.solutions behavior
- [Phase 05-compliance-integration 05-01]: showBanner initialized to false (not true) to avoid server/client hydration mismatch — set to true in useEffect only when no localStorage value
- [Phase 05-compliance-integration 05-01]: GoogleAnalytics uses beforeInteractive for consent defaults — must execute before GA4 library to enforce denied-by-default state
- [Phase 05-compliance-integration 05-01]: CookieConsent placed inside ThemeProvider (after Footer) — requires NextIntlClientProvider ancestor for useTranslations
- [Phase 05-compliance-integration 05-01]: metadataBase = yapu.promptheus.cloud with title.template '%s | YAPU Solutions' — standard SEO pattern, updateable at final domain launch
- [Phase 05-compliance-integration]: Newsletter API returns 200 with mock:true when BREVO_API_KEY not configured — graceful degradation
- [Phase 05-compliance-integration]: Per-page Meta namespaces follow pattern '{PageName}Meta' — consistent with project i18n convention
- [Phase 05-compliance-integration]: COMP-06 satisfied via existing Footer external links to yapu.solutions legal pages — no new pages needed
- [Phase 06-ember-integration-tier-1 06-01]: Dynamic locale detection via readdir(contentDir) — zero-configuration, any repo locale set (en/fr/es, de/en) auto-detected
- [Phase 06-ember-integration-tier-1 06-01]: Tier 2 (YAPU) Ember workflow: confirm-before-write, NIEMALS preview_build/deploy — edits live instantly via force-dynamic SSR
- [Phase 06-ember-integration-tier-1 06-01]: WEBSITE_URL env var added to Ember .env — injected into Tier 2 post-edit confirmation message
- [Phase 06-ember-integration-tier-1 06-01]: workflowInstructions const with tier === 2 ternary mirrors existing tierRules pattern — consistent branching approach
- [Phase 06-ember-integration-tier-1 06-02]: Ember deployed to /home/ember/ on VPS, PM2 process ember-yapu (port 3005), nginx proxy with SSL at ember.yapu.promptheus.cloud
- [Phase 06-ember-integration-tier-1 06-02]: Revert via re-edit not git revert — Ember writes original values back via website_edit x3 (6 commits instead of 1); acceptable at demo stage
- [Phase 06-ember-integration-tier-1 06-02]: All 3 locales (EN/ES/FR) updated simultaneously on single edit — confirms dynamic locale detection from Plan 01 works end-to-end in production
- [Phase 06-ember-integration-tier-1 06-02]: Chat UI message ordering bug noted (cosmetic, frontend only) — deferred to future Ember development
- [Phase 07-ember-tier-2-deploy]: PM2_PROD_APP env var defaults to yapu-prod — deploy.js configurable per customer without code change
- [Phase 07-ember-tier-2-deploy]: globals.css loaded as :root + .dark regex extract to keep Claude context lean (30 lines vs 200+ full file)
- [Phase 07-ember-tier-2-deploy]: fork_mode added to both yapu-prod and yapu-dev — explicit on prod, critical on dev for next dev HMR
- [Phase 07-ember-tier-2-deploy]: previewUrl injected from PREVIEW_URL env var into Tier 3 workflow step 6 — decoupled from websiteUrl
- [Phase 07-ember-tier-2-deploy 07-02]: End-to-end Tier 3 verification deferred by user choice (trusted) — deployment confirmed, functional testing not performed
- [Phase 07-ember-tier-2-deploy 07-02]: nginx exact match (location =) for HMR WebSocket bypass — scopes bearer gate exception to /_next/webpack-hmr only

### Roadmap Evolution

- Phase 04.1 inserted after Phase 4: Visual Fidelity — pixel-accurate replica of yapu.solutions (INSERTED). Approach: HTML/CSS analysis of original site + Puppeteer pixel-diff tooling for verification.
- Phase 04.2 inserted after Phase 4: Visual Pixel Match — structural layout and image fidelity to close remaining gaps (URGENT). Approach: B+C methodology — WebFetch HTML/CSS analysis → rebuild → Puppeteer pixel-diff verification → iterative fixes per page.

### Pending Todos

None.

### Blockers/Concerns

- **Phase 6 (Ember Integration):** Ember's current file-write API and preview implementation status must be investigated before Phase 6 planning. Currently unverified.
- **Phase 4 (Content):** Locale structural mismatches between EN/FR/ES on live yapu.solutions — must audit all three locales before designing JSON schema.

## Session Continuity

Last session: 2026-02-27
Stopped at: PROJECT COMPLETE — All 7 phases finished. YAPU rebuild live at yapu.promptheus.cloud with Ember Tier 3 editing at ember.yapu.promptheus.cloud.
Resume file: None
