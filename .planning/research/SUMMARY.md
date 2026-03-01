# Project Research Summary

**Project:** YAPU Solutions Website Rebuild
**Domain:** Chatbot-editable multilingual corporate website (WordPress to Next.js migration)
**Researched:** 2026-02-26
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project rebuilds yapu.solutions as a faithful visual recreation on the Promptheus stack (Next.js 16, Tailwind v4, shadcn/ui, next-intl) with chatbot-editing capabilities via Ember. The domain is well-understood: corporate marketing sites on Next.js are thoroughly documented, and every core technology in the stack is stable and current. The novel part is the two-instance architecture (dev server for Ember editing + production server for visitors) and the content-as-JSON pattern that makes Ember editing possible without a CMS. No competitor combines natural-language editing with a two-tier model (content-only vs. full code access) designed for non-developers on a production marketing site -- this is the Promptheus differentiator.

The recommended approach is: build the content layer and routing first, validate the two-instance architecture early, then layer UI components on top of a working foundation. The biggest architectural risk is the shared `.next/` directory between dev and production instances -- this must be solved with separate working directories before any Tier 2 editing work begins. The second risk is Next.js caching silently serving stale content after Ember JSON edits -- the content-loading pipeline must use `force-dynamic` or explicit revalidation from day one, not retrofitted later. Both risks are solvable with upfront architecture decisions.

The faithful visual recreation of YAPU's site is the sales argument -- YAPU must see their own site running on better technology. But pixel-perfect reproduction of a WordPress/Cornerstone site in Tailwind is not achievable. Aim for "visually equivalent" and focus fidelity on the Hero, Module Cards, and logo carousels. Multilingual content extraction (EN/FR/ES) is the highest-effort table-stakes requirement and the one most likely to introduce late bugs from structural mismatches between locales.

## Key Findings

### Recommended Stack

The entire stack is stable and current. Next.js 16.1 with Turbopack as default bundler, React 19.2, Tailwind v4.1 with OKLCH color model, and next-intl v4 for i18n. All version compatibility is verified against official sources. No experimental or RC packages needed.

**Core technologies:**
- **Next.js 16.1** (App Router only): Framework with stable Turbopack, React Compiler, and PPR caching. Self-hosting with PM2 + nginx is officially documented.
- **Tailwind v4.1** (PostCSS plugin, not Vite): OKLCH color model, `@theme inline` for CSS variables. No `tailwind.config.js` -- all theming in CSS. Critical: utility names changed from v3 (shadow scale shifted, ring defaults changed, border color changed).
- **next-intl v4.8.3**: De facto standard for Next.js App Router i18n. ESM-only, TypeScript 5+. Supports `[locale]` route segment, typed locale APIs.
- **shadcn/ui** (CLI-based, not versioned): Components copied into repo -- Ember can edit them directly. This is a core requirement for Tier 2 editing. Uses Radix UI primitives, React 19 compatible.
- **Content-as-JSON** (no CMS, no DB): `content/[section]/[locale].json` files read by Server Components. Ember writes JSON for Tier 1 edits. Git-versionable, no vendor lock-in.

**Critical version note:** Use `@tailwindcss/postcss` (not `@tailwindcss/vite`) for Next.js. Use embla-carousel v8 (not v9 RC). Use Zod v4 (not v3).

### Expected Features

**Must have (table stakes):**
- Faithful visual recreation of all 7 pages (homepage + 6 subpages) in 3 languages (EN/FR/ES)
- Mega-menu navigation matching YAPU's current structure
- Partner/client logo carousels (~12 partners, 24+ clients)
- GDPR cookie consent (legal requirement for German-registered entity)
- Responsive design at mobile/tablet/desktop breakpoints
- SEO basics (meta, OG tags) via Next.js metadata API
- Chatbot Tier 1 editing with live preview -- this is the demo's reason for existence

**Should have (differentiators, add after validation):**
- Chatbot Tier 2 editing (code/design changes via HMR) -- validate Tier 1 first
- Functional newsletter subscription -- needs email provider integration
- Analytics integration -- add when YAPU wants tracking
- Multi-language batch editing via Ember

**Defer (v2+):**
- Component scaffolding via Ember
- Image replacement via Ember
- Undo/revert UI in Ember (git safety net exists)
- Structured diff view in Ember

**Anti-features (do not build):**
- CMS admin panel (Ember IS the CMS)
- WYSIWYG visual editor (breaks content-as-code model)
- Dark mode (fixed brand identity)
- User accounts/auth (link to YAPU's existing app)

### Architecture Approach

Two-instance architecture: production (`next start` on port 3001) serves visitors via SSR; dev (`next dev` on port 3000) serves as Ember's editing canvas with HMR. Both share the filesystem for content JSON but MUST have separate `.next/` directories. nginx routes public traffic to prod and restricts dev server access to Ember only. Content edits (Tier 1) go through a protected Route Handler that writes JSON and calls `revalidatePath`. Code edits (Tier 2) are written directly to the filesystem, previewed via HMR, then deployed via `next build` + `pm2 restart`.

**Major components:**
1. **Production Next.js server** -- SSR for visitors, reads content JSON on every request (`force-dynamic`)
2. **Dev Next.js server** -- HMR for Ember preview, accepts file edits for Tier 2
3. **Content API Route Handler** -- POST endpoint for Tier 1 edits (auth + write + revalidate)
4. **Content JSON layer** -- `content/[section]/[locale].json` files, source of truth for all page content
5. **nginx reverse proxy** -- TLS termination, routing, security boundary between public and dev
6. **PM2 process manager** -- Manages both instances, `ecosystem.config.js`

### Critical Pitfalls

1. **Stale content after JSON edits** -- Next.js caching silently serves old content. Prevention: use `force-dynamic` on all content pages and wire `revalidatePath` into the Ember write flow from day one.
2. **Two-instance `.next/` directory conflict** -- Dev and prod servers fight over the same build output. Prevention: separate working directories or separate `.next/` paths. Solve in architecture phase, not during Tier 2 work.
3. **next-intl middleware misconfiguration** -- Pages silently render default locale regardless of URL. Prevention: verify locale routing in isolation before building any content pages. Test `/fr/` and `/es/` explicitly.
4. **Tailwind v4 utility name changes** -- Shadow, ring, and border defaults changed from v3. No compile errors, just wrong visuals. Prevention: keep upgrade guide open during all styling; explicitly specify values instead of relying on defaults.
5. **Multilingual content structural mismatches** -- EN/FR/ES versions of the live site have different content density and optional sections. Prevention: audit all three locales on the live site before designing JSON schema. Make sections optional in the schema.

## Top 5 Cross-Research Insights

1. **The content-as-JSON architecture is load-bearing.** Stack, Features, Architecture, and Pitfalls all converge on this: JSON files in `content/[section]/[locale].json` are the foundation for Tier 1 editing, multilingual support, and the SSR content pipeline. Getting the JSON schema right (with optional sections per locale) is the single most impactful design decision. Get it wrong and both the chatbot editing and multilingual support break.

2. **Two-instance architecture is novel and under-documented.** Architecture research confirms the pattern is sound. Pitfalls research reveals the `.next/` directory conflict as a critical risk with no established prior art. Features research shows Tier 2 editing depends entirely on this working. This is the area with highest uncertainty and must be validated early with a spike, not assumed to work.

3. **Tailwind v4 is a silent visual regression risk.** Stack research confirms v4 is the right choice (OKLCH, CSS variables, no config file). But Pitfalls research documents that v4's renamed utilities will cause incorrect visuals without compile errors. For a project whose entire value is "it looks like your site," silent visual regressions are a demo-killer. The YAPU color scheme must be defined as CSS custom properties in Phase 1.

4. **"Visually equivalent" not "pixel-perfect" is the right target.** Features research identifies trust signals (Hero, logos, navigation) as the highest-scrutiny areas. Pitfalls research identifies Cornerstone CSS specificity as irreproducible. Architecture research shows the content-layer separation enables rapid iteration. The implication: focus visual fidelity on the 5 sections YAPU will scrutinize (Hero, Module Cards, Logo Carousels, Navigation, Footer) and accept deliberate deviations elsewhere.

5. **Live preview is the make-or-break feature for the demo.** Features research identifies it as the core differentiator. Architecture research shows Tier 1 preview (SSR reload) is straightforward but Tier 2 preview (HMR in iframe) is complex. The two-tier editing model is what makes Promptheus unique vs. v0.dev, TinaCMS, and Bolt. Tier 1 preview must work flawlessly for the demo; Tier 2 preview can be deferred to post-validation.

## Tensions Between Research Dimensions

- **force-dynamic vs. performance:** Architecture recommends `force-dynamic` for instant content updates. Pitfalls flags it as technical debt for high traffic. Resolution: acceptable for demo/sales stage; replace with `revalidateTag` before production scale.
- **Tier 2 in MVP vs. post-validation:** Features research puts Tier 2 editing in v1.x (after validation). Architecture research includes the two-instance setup as Phase 2. Resolution: build the two-instance infrastructure in an early phase but defer full Tier 2 editing UI to after Tier 1 demo success.
- **Static rendering vs. dynamic for i18n:** Pitfalls warns that missing `setRequestLocale()` forces dynamic rendering everywhere. But the project already uses `force-dynamic` for content freshness. Resolution: use `force-dynamic` intentionally and document it as a known tradeoff, not a bug.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation (Project Scaffold + Design System + Routing)
**Rationale:** Every subsequent component depends on routing, theming, and content loading working correctly. Architecture research shows clear dependency: routing -> content layer -> components -> pages. Pitfalls research identifies 4 issues that must be caught in this phase (next-intl middleware, Tailwind v4 defaults, TypeScript augmentation, env var conventions).
**Delivers:** Working Next.js 16 project with Tailwind v4 theme (YAPU colors as CSS custom properties), next-intl routing for EN/FR/ES, content JSON directory structure with `readContent()` helper, TypeScript types for content, placeholder pages rendering in all 3 locales.
**Addresses:** Multi-language routing, responsive foundation, SEO basics, design system tokens.
**Avoids:** Pitfalls 3 (middleware misconfiguration), 4 (missing setRequestLocale), 5 (Tailwind v4 regressions), 8 (env var baking), 12 (TypeScript augmentation).

### Phase 2: Infrastructure (Two-Instance Architecture + Content API)
**Rationale:** Architecture research mandates validating the two-instance setup before building content features. The `.next/` directory conflict (Pitfall 2) is the highest-uncertainty risk and must be resolved with a spike. The Content API (Pitfall 1) must be wired correctly before any chatbot integration.
**Delivers:** PM2 ecosystem with prod (port 3001) + dev (port 3000) on VPS, nginx config for both instances with security restrictions on dev server, Content API Route Handler with auth and revalidation, verified that Ember can write JSON and production reflects changes.
**Addresses:** Two-instance architecture, Tier 1 editing pipeline, content revalidation.
**Avoids:** Pitfalls 1 (stale cache), 2 (.next/ conflict), 9 (nginx buffering).

### Phase 3: UI Components (Section Components + Navigation)
**Rationale:** Can proceed once routing and content loading work. Architecture research shows components have no infra dependency -- they just receive content as props. This is the highest-volume phase (Hero, ModuleCards, Testimonials, PartnerLogos, Newsletter form, Footer, mega-menu navigation). Pitfall 6 (visual drift at breakpoints) applies to every component.
**Delivers:** All reusable section components: Hero, ModuleCards (4 service cards), Testimonials, PartnerLogos carousel, ClientLogos carousel, Newsletter form (UI only), Footer, Header with mega-menu, language switcher. All responsive at 375/768/1024/1440px.
**Addresses:** Responsive layout, navigation, logo carousels, testimonials, footer, hero section.
**Avoids:** Pitfall 6 (visual drift at breakpoints), 14 (Cornerstone CSS specificity).

### Phase 4: Content Extraction + Page Assembly
**Rationale:** Depends on both the content JSON structure (Phase 1) and section components (Phase 3). Pitfall 7 (multilingual structural mismatches) is the primary risk. All three locales must be audited on the live site before extraction.
**Delivers:** All 7 pages (homepage + 6 subpages) with real YAPU content in EN/FR/ES. Real assets (logos, partner logos, client logos) integrated. Content JSON files populated with extracted text. All pages render correctly in all 3 locales.
**Addresses:** All 6 subpages, three-language content, real YAPU assets, partner/client logos.
**Avoids:** Pitfall 7 (multilingual structural mismatches), 10 (missing generateStaticParams).

### Phase 5: Compliance + Integration (GDPR, Analytics, Newsletter)
**Rationale:** Cookie consent gates analytics (dependency noted in Features research). Newsletter requires third-party integration. These are table stakes but not on the critical path for the chatbot demo.
**Delivers:** GDPR cookie consent banner (vanilla-cookieconsent), Google Analytics (gated by consent), functional newsletter form with email provider endpoint.
**Addresses:** GDPR compliance, analytics, newsletter subscription.
**Avoids:** Pitfall 8 (env vars baked into build for analytics).

### Phase 6: Ember Integration + Live Preview (Tier 1)
**Rationale:** This is the demo payload. Everything before this phase builds toward this moment: Ember edits content JSON via the Content API, production serves updated content on next request, preview shows the result. Features research identifies this as P1 and the core Promptheus pitch.
**Delivers:** Ember can edit any content JSON file via natural language, changes appear on production within one page load, live preview works via iframe or tab link to production URL, change confirmation before writing, scoped edits (page/section context).
**Addresses:** Chatbot Tier 1 editing, live preview (Tier 1), change confirmation, scoped edits.
**Avoids:** Pitfall 1 (stale cache), 13 (file write race conditions).

### Phase 7 (Post-Validation): Tier 2 Editing + Deploy Flow
**Rationale:** Features research explicitly defers Tier 2 to post-validation. Architecture research includes the deploy flow as the final layer. Only pursue after YAPU confirms interest from the Tier 1 demo.
**Delivers:** Ember can edit component code and CSS via dev server with HMR preview, deploy script (`next build` + `pm2 restart`), preview iframe routing for Tier 2.
**Addresses:** Chatbot Tier 2 editing, live preview (Tier 2), deploy workflow.
**Avoids:** Pitfall 2 (.next/ conflict -- must already be solved), 13 (file write races).

### Phase Ordering Rationale

- **Phases 1-2 are non-negotiable foundations.** Architecture dependencies are strict: routing before content, content before components, infrastructure before chatbot integration. Skipping infrastructure validation (Phase 2) risks discovering the `.next/` conflict during demo preparation.
- **Phases 3-4 are the bulk of visual work** and can overlap partially. Components can be built with placeholder content, then populated with real content in Phase 4.
- **Phase 5 is independent** of the chatbot story and can be done in parallel with Phase 4 or 6.
- **Phase 6 is the demo moment.** Everything before it is preparation. This phase should be treated as a milestone with explicit demo rehearsal.
- **Phase 7 is gated on business validation.** Do not build until Tier 1 demo proves the concept.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Infrastructure):** The two-instance `.next/` directory separation has no established prior art. Needs a technical spike to validate the approach (separate directories? symlinks? `NEXT_PRIVATE_OUTPUT_DIR`?). LOW confidence area.
- **Phase 6 (Ember Integration):** Ember's current capabilities and API for file writes need investigation. The preview feature is not yet built -- scope and approach need definition during planning.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Next.js 16 + Tailwind v4 + next-intl setup is thoroughly documented with official guides. HIGH confidence.
- **Phase 3 (UI Components):** Standard React component development with shadcn/ui. Patterns are well-established. HIGH confidence.
- **Phase 5 (Compliance):** Cookie consent, GA integration, newsletter forms are commodity patterns. HIGH confidence.

## Definition of Done

The project is complete when:
1. A non-technical person at YAPU can open Ember, type "change the hero headline to X," and see the change on the live site within seconds
2. All 7 pages render faithfully in EN, FR, and ES with real YAPU content and assets
3. The site passes a side-by-side visual comparison with yapu.solutions at mobile and desktop viewports for the 5 key sections (Hero, Module Cards, Logo Carousels, Navigation, Footer)
4. GDPR cookie consent, analytics, and newsletter form are functional
5. The two-instance architecture is running on the Promptheus VPS with production isolated from editing

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against official docs (Next.js 16.1, React 19.2, Tailwind v4.1, next-intl v4.8.3). No experimental dependencies. |
| Features | MEDIUM | YAPU site directly inspected. Chatbot-editing features based on first-principles reasoning -- no prior art for the two-tier model. Competitor analysis limited (no WebSearch). |
| Architecture | HIGH | Core patterns (SSR, Route Handlers, PM2, nginx) verified against official Next.js self-hosting docs. Two-instance pattern is sound but novel. |
| Pitfalls | MEDIUM-HIGH | Framework pitfalls verified against official docs. Two-instance and Ember integration pitfalls are first-principles reasoning (LOW confidence for those specific items). |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Ember's current API and capabilities:** Research references Ember but does not detail its current file-write API, authentication model, or preview implementation status. This must be investigated before Phase 6 planning.
- **Two-instance `.next/` separation:** No verified solution exists. Needs a technical spike in Phase 2. Options: separate git worktrees, separate directories with shared `content/`, or `NEXT_PRIVATE_OUTPUT_DIR` (undocumented).
- **Newsletter email provider:** No provider selected. MailChimp, Resend, or similar must be chosen before Phase 5. Low risk -- commodity integration.
- **YAPU asset licensing:** Real logos and images must be extracted from the live site. Confirm YAPU is OK with their assets being used in the demo (likely yes, but explicit confirmation needed).
- **VPS resource constraints:** Running two Next.js instances + nginx on a single Hostinger VPS. Memory and CPU budget not assessed. Dev server with Turbopack may consume significant resources.

## Sources

### Primary (HIGH confidence)
- Next.js 16 official docs (nextjs.org/docs/app) -- version 16.1.6, verified 2026-02-24
- Next.js self-hosting guide (nextjs.org/docs/app/guides/self-hosting) -- PM2 + nginx patterns
- Next.js caching guide (nextjs.org/docs/app/guides/caching) -- four caching layers documented
- Tailwind CSS v4 official docs (tailwindcss.com/docs) -- v4.0 Jan 2025, v4.1 Apr 2025
- next-intl v4 official docs (next-intl.dev/docs) -- v4.8.3, App Router setup
- shadcn/ui official docs (ui.shadcn.com/docs) -- Tailwind v4 upgrade path, React 19 support
- Radix UI releases (radix-ui.com/primitives/docs/overview/releases) -- React 19 + RSC compatibility Jun 2024

### Secondary (MEDIUM confidence)
- YAPU Solutions live site (yapu.solutions) -- inspected via WebFetch 2026-02-26
- Ember chatbot (ember.promptheus.cloud) -- inspected via WebFetch 2026-02-26
- Competitor products (v0.dev, TinaCMS, Bolt.new) -- inspected for feature comparison
- GitHub release pages for embla-carousel, react-hook-form, lucide-react, Zod v4

### Tertiary (LOW confidence)
- Two-instance architecture with shared filesystem -- first-principles reasoning, no prior art found
- Ember file-write API and preview implementation -- referenced from PROJECT.md, not independently verified

---
*Research completed: 2026-02-26*
*Ready for roadmap: yes*
