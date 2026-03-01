# Feature Research

**Domain:** Chatbot-editable corporate marketing website (impact fintech / B2B SaaS context)
**Researched:** 2026-02-26
**Confidence:** MEDIUM — YAPU site directly inspected via WebFetch; Promptheus/Ember architecture read from source; chatbot CMS landscape based on comparator products (v0, TinaCMS, Bolt, Cursor) inspected but WebSearch unavailable. No LOW-confidence claims presented as fact.

---

## Context

This research covers two nested domains simultaneously:

1. **End-user website features** — what the rebuilt yapu.solutions needs to have as a corporate marketing site
2. **Chatbot-editing features** — what Ember must support so a non-technical user can edit the site via chat

Both are scoped to the Promptheus stack (Next.js 16, Tailwind v4, shadcn/ui, next-intl) and the two-tier editing model defined in PROJECT.md.

---

## Feature Landscape

### A. End-User Website Features

#### Table Stakes (Users Expect These)

Features a corporate marketing site must have. Missing = site feels broken or unprofessional.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Responsive layout (mobile/tablet/desktop) | Standard since ~2015; Google ranking signal | LOW | Tailwind v4 responsive utilities; YAPU has 3 breakpoints |
| Primary navigation with all top-level sections | Users need to find pages; mega-menu is YAPU's current pattern | MEDIUM | Investor Services, Data Insights, Digital Tools, Impact, News, About — 6 items |
| Hero section with headline + CTA | First impression; defines purpose in 3 seconds | LOW | YAPU: "YAPU facilitates resilience finance..." + "try the APP now" |
| Service/product overview cards | B2B visitors scan for relevance; card grid is the standard pattern | LOW | YAPU has 4 cards matching their 4 service modules |
| Footer with contact, legal, social | Legal compliance (DE law requires Impressum); navigation fallback | LOW | Berlin + Ecuador addresses, Privacy Policy, Legal Notice, social links |
| Multi-language support (EN/FR/ES) | YAPU's market is global South; FR/ES required for client communications | HIGH | next-intl already in Promptheus stack; 3 locale sets of all content JSON |
| Cookie consent / GDPR banner | Legal requirement (GDPR, German law) for any EU-registered entity | MEDIUM | Granular category consent; YAPU has it currently |
| SSL / HTTPS | Browser warning if missing; SEO penalty; basic trust signal | LOW | Handled by nginx + certbot in Promptheus deployment |
| SEO basics (meta titles, descriptions, OG tags) | Findability; social share previews | LOW | Next.js `metadata` API handles this natively |
| Partner/client logo section | Trust signal; B2B visitors look for social proof from known names | LOW | YAPU has 2 carousels: ~12 partners + 24+ clients |
| Testimonials section | Social proof; B2B standard | LOW | YAPU has 1 testimonial (Tina Livingston, COK Sodality) |
| Contact information visible | Users must be able to reach the company | LOW | Addresses in footer and About page |
| Page load performance (< 3s) | Core Web Vitals; Google ranking; bounce rate | MEDIUM | Next.js SSG/SSR + image optimization handles this |
| Accessible markup (ARIA, semantic HTML) | Legal exposure in EU; screen readers; Google ranking | MEDIUM | shadcn/ui is Radix-based, inherits good accessibility |

#### Differentiators (Competitive Advantage)

Features that set the rebuilt site apart from the WordPress original and demonstrate Promptheus value.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Chatbot content editing (Tier 1) | Non-technical YAPU staff can update copy without touching code or CMS UI; changes appear on next SSR request | HIGH | Core Promptheus pitch; JSON content files + Ember chat interface |
| Chatbot code/design editing (Tier 2) | Deeper changes (layout, colors, new sections) without a developer; dev server + HMR gives instant preview | HIGH | Requires two-instance architecture; live preview is the key UX unlock |
| Live preview during editing | Editors see changes before publishing; reduces error-and-fix cycles | HIGH | Not yet built in Ember; defined as in-scope for this project |
| Two-instance architecture (dev + prod) | Editing never affects live visitors; clean separation of concerns | MEDIUM | PM2 manages both; nginx routes traffic |
| Content-as-JSON (structured, no CMS lock-in) | No database, no CMS license, no vendor lock-in; content is readable/auditable files | LOW | Established Promptheus pattern: `content/data/{locale}/filename.json` |
| Turbopack-based HMR | Sub-100ms code updates during Tier 2 editing; editor sees results instantly | LOW | Next.js 15 ships stable Turbopack dev; 76.7% faster startup vs webpack |
| SDG alignment visualization | Resonates with impact finance audience; not on most corporate sites | LOW | YAPU has 8 SDG cards on About page; good demo of structured content |
| Newsletter subscription (functional) | Demonstrates production-readiness beyond visual mockup | MEDIUM | Requires integration with email provider (MailChimp/similar); form exists on YAPU |
| Analytics integration | Shows stakeholder reporting; differentiates from static mockup | LOW | Google Analytics or Plausible; Next.js instrumentation hook available |

#### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Traditional CMS admin panel | "We need a way to manage content" | Adds backend complexity (auth, DB, UI) that duplicates what Ember does; undermines the Promptheus pitch | Ember chatbot IS the CMS UI — lean into this |
| WYSIWYG visual editor in browser | Familiar to WordPress users | Requires complex DOM diffing, serialization, sync with JSON files; breaks the content-as-code model | Tier 1 JSON editing via Ember + live preview achieves same outcome |
| Client-side search with full-text index | "Nice to have" | Fuse.js adds bundle weight; news section is small; crawling + Google handles search for a marketing site | Pagination + category filter (already on YAPU news page) is sufficient |
| User accounts / authentication | Sometimes requested for "member area" | Out of scope; YAPU app login links to their existing app — do not recreate | External link to YAPU's existing app (`try the APP now`) |
| E-commerce / payment processing | Rarely but sometimes requested for conference tickets | Zero need for a marketing site; adds PCI scope and complexity | Explicitly out of scope per PROJECT.md |
| Real-time collaborative editing | "Multiple people editing at once" | Conflict resolution across JSON files is complex; not needed for a small team | Sequential editing via Ember is sufficient for YAPU's team size |
| Dark mode | Modern UX expectation | YAPU's brand is specific (dark teal, mint, orange-red); dark mode would require designing a second color system | Strong light-mode brand identity is a feature, not a bug |
| Paid fonts (Museo Sans Rounded) | Visual accuracy | Licensing cost; no ROI for demo stage | System font stack approximating Museo Sans; explicitly decided in PROJECT.md |

---

### B. Chatbot-Editing Features

These are the features Ember must provide to deliver the Promptheus value proposition.

#### Table Stakes (Editors Expect These)

Features a chatbot editor must have for the demo to be credible.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Natural language content updates | Core promise: "tell Ember what to change" | MEDIUM | Ember reads content JSON, writes changes, triggers SSR revalidation |
| Change confirmation before writing | Editor must understand what will change; prevents accidents | LOW | Chatbot describes proposed change, awaits confirmation |
| Live preview (Tier 1) | Without preview, the editing loop is blind; editors won't trust it | HIGH | SSR page reload shows changes; iframe preview or tab link |
| Live preview (Tier 2) | HMR-based preview in dev instance; editor sees design changes instantly | HIGH | Key differentiator; defined as in-scope and not yet built |
| Scoped edits (which page, which section) | Ambiguous instructions cause wrong files to be modified | MEDIUM | Ember needs context: current page URL + section identifier |
| Multi-language edit support | YAPU content is in 3 languages; editing EN only while FR/ES stays stale is confusing | MEDIUM | Either update all locales or clearly signal which locale was changed |
| Undo / revert capability | Editors will make mistakes; no undo = fear of editing | MEDIUM | Git history is the safety net; Ember can run `git revert` or restore from previous commit |

#### Differentiators (Competitive Advantage for Ember)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Two-tier editing model (content vs. code) | Non-developers get content editing; developers get full code access — one tool, appropriate power level | HIGH | Architecturally clean; Tier 1 = JSON writes, Tier 2 = code writes + dev server |
| Structured change preview (diff view) | Editor sees exactly what text changed, not just "updated" | MEDIUM | JSON diff rendered in chat before applying |
| Contextual editing (Ember knows current page) | Reduces the need to explain "I'm on the about page" | MEDIUM | URL passed as context to Ember session |
| Batch edits across locales | "Update the hero headline in all languages" | HIGH | Requires Ember to understand translation equivalence across locale JSON files |
| Image replacement via Ember | "Change the hero image to this one" | HIGH | File upload → public/ directory → JSON reference update |
| Component scaffolding via chat | "Add a new testimonial card" | HIGH | Ember generates component + adds entry to content JSON; Tier 2 territory |

#### Anti-Features (For Chatbot Editor)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Autonomous deployment from Ember | "Push to production automatically after any edit" | Zero review step means bugs go live; undermines trust | Explicit deploy confirmation step; show "publish" as a separate action |
| Ember writing arbitrary code without review | "Let Ember refactor whatever it wants" | Unreviewed code changes are risky; demo could break mid-presentation | Tier 2 changes happen in dev instance, reviewed before deploy |
| Ember managing secrets/credentials | Seems convenient | Security anti-pattern; Ember should never touch .env or API keys | Secrets management stays with developer; Ember only touches content and UI code |
| Inline editing overlay (visual CMS) | More intuitive than chat for some users | Requires complex frontend injection; conflicts with SSR; breaks with Tailwind v4 | Chat interface is the explicit design choice; lean into it rather than fight it |

---

## Feature Dependencies

```
[Live Preview (Tier 1)]
    └──requires──> [SSR-based page rendering]
                       └──requires──> [Content JSON architecture]

[Live Preview (Tier 2)]
    └──requires──> [Dev server instance running]
                       └──requires──> [Two-instance architecture]
                           └──requires──> [PM2 + nginx configured for 2 ports]

[Chatbot Tier 1 editing]
    └──requires──> [Content JSON architecture]
    └──requires──> [Ember has file system write access]

[Chatbot Tier 2 editing]
    └──requires──> [Dev server instance running]
    └──requires──> [HMR functional]
    └──requires──> [Ember has code file write access]

[Multi-language content]
    └──requires──> [next-intl routing]
    └──requires──> [Content JSON per locale (content/data/{locale}/)]
    └──requires──> [messages/{locale}.json for UI strings]

[Newsletter subscription]
    └──requires──> [Email provider integration (3rd party)]

[Analytics]
    └──requires──> [GA/Plausible script in layout]

[GDPR cookie consent]
    └──enhances──> [Analytics] (consent gates analytics initialization)

[Testimonials section] ──enhances──> [Partner/Client logos section]
    (both serve trust-building; together stronger than either alone)

[Chatbot multi-language edit] ──requires──> [Chatbot Tier 1 editing]
[Chatbot image replacement] ──requires──> [Chatbot Tier 1 editing]
[Chatbot component scaffolding] ──requires──> [Chatbot Tier 2 editing]
```

### Dependency Notes

- **Live Preview (Tier 2) requires two-instance architecture:** Editing must happen on a dev server with HMR; production instance must stay clean. PM2 and nginx must be configured before preview can work.
- **Content JSON architecture gates everything:** Tier 1 editing, multi-language support, and structured content all depend on the `content/data/{locale}/` pattern established in Promptheus. This must be in place before chatbot editing is buildable.
- **Cookie consent gates analytics:** GDPR requires consent before firing analytics scripts; consent banner must load before analytics initialize.
- **Multi-language gating:** `next-intl` middleware routing and per-locale content files must exist before any locale-specific editing can be tested.

---

## MVP Definition

### Launch With (v1) — The Demo

Minimum needed to demonstrate chatbot-editable website to YAPU.

- [ ] **Faithful visual recreation of yapu.solutions homepage** — YAPU must see their own site; without this the demo has no credibility
- [ ] **All 6 subpages rebuilt** (Investor Services, Data Insights, Digital Tools, Impact, News, About) — full site, not just homepage
- [ ] **Three-language support (EN/FR/ES)** — YAPU's multilingual identity is core; demo without languages misrepresents the product
- [ ] **Mega-menu navigation** — matches current site structure; missing nav = broken demo
- [ ] **Partner/client logo carousels** — high-visibility trust signals YAPU will notice immediately if missing
- [ ] **GDPR cookie consent** — legal requirement; YAPU is German-registered
- [ ] **Chatbot Tier 1 editing with live preview** — core Promptheus pitch; this is why the demo exists
- [ ] **Responsive design** — mobile/desktop parity is table stakes

### Add After Validation (v1.x)

Add once YAPU confirms interest.

- [ ] **Chatbot Tier 2 editing (code/design)** — powerful but complex; validate Tier 1 first
- [ ] **Functional newsletter subscription** — needs email provider setup; validate interest before integrating
- [ ] **Analytics integration** — add when YAPU wants tracking data, not before
- [ ] **Chatbot multi-language batch editing** — useful for YAPU but adds complexity; defer until core editing works

### Future Consideration (v2+)

Defer until product-market fit established.

- [ ] **Component scaffolding via Ember** — powerful differentiator but high complexity; requires robust Tier 2 to be stable first
- [ ] **Chatbot image replacement** — file upload handling adds scope; defer
- [ ] **Structured change diff view in Ember** — improves trust in editing but not blocking for demo
- [ ] **Undo/revert UI in Ember** — git safety net exists; explicit UI can wait

---

## Feature Prioritization Matrix

### End-User Website Features

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Responsive layout | HIGH | LOW | P1 |
| Hero section + CTA | HIGH | LOW | P1 |
| Service module cards (4) | HIGH | LOW | P1 |
| Primary navigation + mega-menu | HIGH | MEDIUM | P1 |
| Multi-language (EN/FR/ES) | HIGH | HIGH | P1 |
| Partner/client logo carousels | HIGH | LOW | P1 |
| Footer with legal + contact | HIGH | LOW | P1 |
| GDPR cookie consent | HIGH | MEDIUM | P1 |
| All 6 subpages | HIGH | HIGH | P1 |
| Testimonials section | MEDIUM | LOW | P1 |
| SEO meta tags | MEDIUM | LOW | P1 |
| Newsletter subscription | MEDIUM | MEDIUM | P2 |
| Analytics | MEDIUM | LOW | P2 |
| Performance optimization | MEDIUM | MEDIUM | P2 |
| Search (news) | LOW | MEDIUM | P3 |

### Chatbot-Editing Features

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Tier 1 content editing | HIGH | MEDIUM | P1 |
| Live preview (Tier 1) | HIGH | HIGH | P1 |
| Change confirmation before writing | HIGH | LOW | P1 |
| Scoped edits (page/section context) | HIGH | MEDIUM | P1 |
| Two-instance architecture | HIGH | MEDIUM | P1 |
| Live preview (Tier 2) | HIGH | HIGH | P1 |
| Tier 2 code/design editing | HIGH | HIGH | P2 |
| Undo/revert (git-backed) | MEDIUM | LOW | P2 |
| Multi-language batch editing | MEDIUM | HIGH | P2 |
| Structured diff view | MEDIUM | MEDIUM | P2 |
| Image replacement via Ember | LOW | HIGH | P3 |
| Component scaffolding via Ember | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

Reference products: v0.dev (AI code editor + preview), TinaCMS (Git-backed CMS with live editing), Bolt.new (AI full-stack builder), Cursor (AI IDE), Squarespace/Webflow (traditional website builders).

| Feature | v0.dev | TinaCMS | Promptheus/Ember |
|---------|--------|---------|-----------------|
| Chat-based editing | Yes (code-level) | No (visual form UI) | Yes (natural language) |
| Live preview | Yes (in-browser) | Yes (inline visual) | In-scope (not yet built) |
| Content-as-code (Git-backed) | Yes | Yes | Yes (JSON files) |
| Non-developer accessible | No (dev tool) | Yes (visual forms) | Yes (natural language) |
| Design/layout changes via chat | Yes (full code) | No | Yes (Tier 2) |
| Multi-language support | No (generates code) | Yes | Yes (next-intl) |
| Deployment workflow | One-click Vercel | CI/CD via Git | PM2 + nginx (manual trigger) |
| Two-tier editing model | No | No | **Yes (unique to Promptheus)** |
| Corporate marketing focus | No (generic) | Partially | Yes (YAPU demo is the playbook) |

**Key insight:** No competitor combines natural-language editing with a two-tier model (content-only vs. full code access) designed specifically for non-developers on a production marketing site. That combination is Promptheus' differentiator.

---

## Sources

- YAPU Solutions live site (yapu.solutions, /about, /news, /impact) — inspected via WebFetch 2026-02-26
- Ember (ember.promptheus.cloud) — inspected via WebFetch 2026-02-26
- Promptheus base CLAUDE.md — read from `C:/Users/hmk/promptheus/CLAUDE.md`
- v0.app — inspected via WebFetch 2026-02-26
- TinaCMS (tina.io/docs/setup-overview/) — inspected via WebFetch 2026-02-26
- Next.js 15 blog post (nextjs.org/blog/next-15) — inspected via WebFetch 2026-02-26 [HIGH confidence for framework capabilities]
- Squarespace website builder page — inspected via WebFetch 2026-02-26
- WordPress.com features page — inspected via WebFetch 2026-02-26
- PROJECT.md (`C:/Users/hmk/promptheus/yapu2/.planning/PROJECT.md`) — primary requirements source

---
*Feature research for: Chatbot-editable corporate marketing website (yapu.solutions rebuild on Promptheus stack)*
*Researched: 2026-02-26*
