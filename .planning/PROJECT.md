# YAPU Solutions Website Rebuild

## What This Is

A faithful rebuild of yapu.solutions using the Promptheus tech stack (Next.js 16, Tailwind v4, shadcn/ui, next-intl), designed to be editable via Ember — Promptheus' chatbot interface. The project serves as a sales demo to convince YAPU Solutions GmbH to switch to a modern, chatbot-editable website. Starting point is a 1:1 recreation of their current site, demonstrating what the Promptheus stack can deliver.

## Core Value

YAPU's existing website content and structure must be faithfully reproduced — every page, every section, every language — so YAPU sees their own site running on superior technology with chatbot-editing as a bonus.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Faithful visual recreation of yapu.solutions homepage (Hero, Module Cards, Testimonials, Partner Logos, Client Logos, Newsletter, Footer)
- [ ] All subpages rebuilt: Investor Services, Data Insights, Digital Tools, Impact, News, About
- [ ] Full navigation with dropdown mega-menus matching YAPU's current structure
- [ ] Three-language support (EN/FR/ES) with content extracted from the live site
- [ ] Real YAPU assets (logos, partner logos, client logos) integrated
- [ ] Functional newsletter subscription form
- [ ] Functional cookie consent (GDPR-compliant)
- [ ] Analytics integration (Google Analytics or equivalent)
- [ ] Chatbot editing Tier 1: Content-only editing via Ember — changes to JSON content files, visible via SSR on next page load
- [ ] Chatbot editing Tier 2: Full code/design/color editing via Ember — changes via dev server with HMR, deployed to production when done
- [ ] Live preview for both editing tiers
- [ ] Two-instance architecture: Dev server (HMR, for Ember editing) + Production server (SSR, for visitors)
- [ ] Responsive design matching YAPU's current breakpoints (mobile, tablet, desktop)
- [ ] YAPU color scheme: Dark Teal (#1E5A64), Mint (#45B5B4), Orange-Red (#FF2A13)
- [ ] System fonts (no paid font licensing needed)
- [ ] Deployment on Promptheus VPS (Hostinger)

### Out of Scope

- YAPU App login functionality — the "try the APP now" button links to YAPU's existing app, no auth integration needed
- Backend/API for YAPU's actual financial tools — this is a marketing website, not their product
- Payment processing — no e-commerce
- CMS admin panel — Ember replaces traditional CMS
- Looking at or reusing code from `promptheus/yapu` — clean rebuild from scratch

## Context

- **Promptheus** is a web stack for building chatbot-editable websites. The core product.
- **Ember** (ember.promptheus.cloud) is the chatbot interface that lets clients edit their websites. It exists but the preview feature is not yet functional — building preview is part of this project.
- **YAPU Solutions GmbH** is a Berlin-based impact fintech offering digital tools for risk management and climate indicators for financial service providers in the global South. Their current site runs on WordPress with Cornerstone page builder.
- The current YAPU site has: Hero section, 4 main service modules (Investor Services, Data Insights, Digital Tools, Impact), client testimonials, partner/client logo carousels, newsletter signup, multi-language support (EN/FR/ES), and detailed subpages for each service area.
- Project lives at `C:\Users\hmk\promptheus\yapu2`, must not reference `promptheus/yapu`.

## Constraints

- **Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind v4 (OKLCH, inline theme), shadcn/ui, next-intl, lucide-react — must stay within Promptheus ecosystem
- **No yapu reference**: Cannot look at or copy from `promptheus/yapu` directory
- **Content source**: All content extracted from live yapu.solutions (EN/FR/ES versions)
- **Hosting**: Promptheus VPS (Hostinger, ssh root@187.77.66.133), PM2 + nginx
- **Chatbot**: Must integrate with existing Ember chatbot — no custom chatbot UI
- **Fonts**: System fonts only (no Museo Sans Rounded license)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SSR for Tier 1 (Content editing) | JSON changes appear instantly on next request, no rebuild needed | — Pending |
| Dev server + HMR for Tier 2 (Code editing) | Instant preview for design/layout changes, clean separation from production | — Pending |
| Two-instance architecture | Editing doesn't affect live visitors, clean deploy workflow | — Pending |
| Extract real translations from live site | Professional translations, domain-specific terminology, polished demo | — Pending |
| System fonts over Museo Sans Rounded | No licensing cost, acceptable visual difference for demo stage | — Pending |
| Functional forms/analytics | Demonstrates production-readiness, not just a visual mockup | — Pending |

---
*Last updated: 2026-02-26 after initialization*
