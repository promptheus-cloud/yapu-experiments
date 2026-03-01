---
phase: 04-page-assembly
plan: 02
subsystem: content-pages
tags: [content, pages, i18n, investor-services, data-insights, digital-tools]
dependency_graph:
  requires: [04-01]
  provides: [investor-services-page, data-insights-page, digital-tools-page]
  affects: [navigation-links, site-completeness]
tech_stack:
  added: []
  patterns: [typed-json-content, server-components, lucide-icon-maps, sdg-color-badges, alternating-sections]
key_files:
  created:
    - content/data/en/investor-services.json
    - content/data/fr/investor-services.json
    - content/data/es/investor-services.json
    - content/data/en/data-insights.json
    - content/data/fr/data-insights.json
    - content/data/es/data-insights.json
    - content/data/en/digital-tools.json
    - content/data/fr/digital-tools.json
    - content/data/es/digital-tools.json
  modified:
    - app/[locale]/investor-services/page.tsx
    - app/[locale]/data-insights/page.tsx
    - app/[locale]/digital-tools/page.tsx
decisions:
  - "sdg-color-map: SDG badge colors hardcoded as Record<number, string> in page.tsx — no external SDG library needed, styled divs render correctly"
  - "ContentSection helper: inline functional component in digital-tools/page.tsx reduces repetition for 5 alternating content sections"
  - "Icon maps as Record<string, LucideIcon>: allows JSON to reference icon name as string, resolved at render time with fallback"
metrics:
  duration: 6 min
  completed: 2026-02-26
  tasks_completed: 2
  files_created: 9
  files_modified: 3
---

# Phase 4 Plan 02: Service Page Assembly Summary

**One-liner:** 9 content JSON files (3 pages x 3 locales) plus 3 full-section server components replacing placeholder stubs for Investor Services, Data Insights, and Digital Tools pages.

## What Was Built

### Task 1: Content JSON (9 files)

**investor-services.json** (EN/FR/ES):
- `hero` — locale-correct titles (EN: "Investor Services", FR: "Services aux Investisseurs", ES: "Servicios para Inversores")
- `approach` — text block about thriving resilience finance market
- `services` — 6 cards: Strategy Development, Operational Consulting, Portfolio Certification, Portfolio Generation, Impact Measurement, Investor Value Proposition
- `pathToResilience` — 3 stages: Reaction, Disclosure, Promotion
- `impactMeasurement` — environmental + social dimensions with "0%" placeholder metrics
- `sdgs` — [1, 2, 5, 7, 8, 10, 12, 13, 15]
- `useCases` — 4 entries (Agricultural MFI, Green SME, Women's Financial Inclusion, Climate-Smart Agriculture) with social/environmental percentages and SDG refs
- `greenFinanceRadar` — CTA block with title, text, ctaText, ctaHref

**data-insights.json** (EN/FR/ES):
- `hero` — locale-correct titles
- `categories` — 6 cards: Financial Projections, Algorithm-based Decisions, Climate Risks, Social Impact, Taxonomies, Staff Performance
- `sections.creditRisk` — title, text, 5 features
- `sections.financialRisks` — title, text, 5 features (CIAT partnership)
- `sections.resilienceFinance` — title, text, 5 features
- `sections.performanceMonitoring` — title, text, 5 features
- `sections.capacityBuilding` — title, text + 3 pillars (Institutional Assessment, Consultancy, Training)

**digital-tools.json** (EN/FR/ES):
- `hero` — locale-correct titles
- `sections.frontOffice/teamManagement/loanDecision/apiIntegration/learningOrganization` — each with title, text, 5 features
- `sections.features` — 6 feature grid items: Workflow Management, Team Connectivity, Offline Function, Improved Scoring, Geo-Localization, Security
- `testimonial` — Abou Baker, Pan African Microfinance Agency

### Task 2: Page Components (3 files)

**investor-services/page.tsx:**
- `InvestorServicesContent` interface matching JSON schema
- 8 distinct sections: Hero, Approach, Services Grid (3-col), Path to Resilience (3-stage flex), Impact Measurement (environmental + social cards), SDGs (badge row with color map), Use Cases (2x2 grid), Green Finance Radar CTA (bg-brand)
- SDG color map: Record<number, string> for SDG numbers [1,2,5,7,8,10,12,13,15]
- Icon map: `Record<string, LucideIcon>` resolves service icons from JSON string names

**data-insights/page.tsx:**
- `DataInsightsContent` interface matching JSON schema
- Categories grid (3-col, 6 cards), 5 content sections (alternating bg), Capacity Building pillars (3-col grid)
- Feature lists rendered as bullet points with accent-colored dot markers

**digital-tools/page.tsx:**
- `DigitalToolsContent` interface matching JSON schema
- Inline `ContentSection` helper component for 5 alternating sections
- Features grid (3-col, 6 cards with icon map)
- `Testimonial` component reused from components/

## Verification Results

- Build: `npx next build` passes without errors
- No `Placeholder` references in any page.tsx
- All 3 pages use React fragment (no nested `<main>`)
- `readContent` typed calls verified in all 3 pages
- FR and ES hero titles differ from EN (locale-correct content)
- All 9 JSON files parse correctly with full schema

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

Verified files exist:
- content/data/en/investor-services.json: FOUND
- content/data/fr/investor-services.json: FOUND
- content/data/es/investor-services.json: FOUND
- content/data/en/data-insights.json: FOUND
- content/data/fr/data-insights.json: FOUND
- content/data/es/data-insights.json: FOUND
- content/data/en/digital-tools.json: FOUND
- content/data/fr/digital-tools.json: FOUND
- content/data/es/digital-tools.json: FOUND
- app/[locale]/investor-services/page.tsx: FOUND
- app/[locale]/data-insights/page.tsx: FOUND
- app/[locale]/digital-tools/page.tsx: FOUND

Commits verified:
- a230144: feat(04-02): create full content JSON
- 95174ad: feat(04-02): build full page components

## Self-Check: PASSED
