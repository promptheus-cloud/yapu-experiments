# Webstack — YAPU Solutions (yapu2)

Faithful rebuild von yapu.com auf dem Promptheus-Stack, designed to be editable via Ember.

**Original:** https://yapu.com/
**Live:** https://yapu.promptheus.cloud

## Kontext

**YAPU Solutions** ist ein Social-FinTech aus Berlin. Entwickelt digitale Tools fuer nachhaltige Finanzierung und Investor Reporting. Kunden: Entwicklungsbanken, Impact Investoren, Mikrofinanzinstitutionen.

## Promptheus-Kontext

Dieses Projekt ist Teil des Promptheus-Portfolios — einer Reihe von Website-Rebuilds, die zeigen, was der Promptheus-Stack mit Ember-Chatbot-Editing kann. Parallele Projekte: Bionexx, Nuru, Fenix International, FINCA.

## Tech-Stack

Siehe Promptheus Root-CLAUDE.md (`C:\Users\hmk\promptheus\CLAUDE.md`) fuer Stack-Details und Konventionen.

- **Framework:** Next.js 16 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS v4 (OKLCH, `@theme inline {}` in globals.css)
- **UI-Komponenten:** shadcn/ui
- **i18n:** next-intl (EN/ES/FR), Middleware-basiertes Routing
- **Theming:** next-themes (Light/Dark)

## Seiten

| Route | Inhalt |
|-------|--------|
| `/` | Startseite |
| `/about` | Ueber YAPU |
| `/investor-services` | Investor Services |
| `/data-insights` | Data Insights |
| `/digital-tools` | Digital Tools |
| `/impact` | Impact |
| `/news` | News |

Alle Routen sind locale-prefixed: `/en/...`, `/es/...`, `/fr/...`

## Server & Deployment

| | |
|---|---|
| **Server** | 187.77.66.133 (Hostinger) |
| **SSH** | `ssh root@187.77.66.133` |
| **App-Pfad** | `/home/yapu/yapu2/` |
| **Prod Port** | 3003 (PM2: `yapu-prod`) |
| **Dev Port** | 3008 (PM2: `yapu-dev`) |
| **Reverse Proxy** | nginx (Prod → 3003, Preview → 3008) |
| **SSL** | Let's Encrypt (certbot, auto-renew) |
| **Deploy Key** | `id_yapu2` auf Server, SSH-Host `github-yapu2` |
| **Deploy-Script** | `server/deploy.sh` |

### Deployment

```bash
ssh root@187.77.66.133 "APP_DIR=/home/yapu/yapu2 /home/yapu/yapu2/server/deploy.sh"
```

Options: `--prod` (nur Produktion), `--dev` (nur Preview), `--all` (default, beides).

## Content-Architektur

Inhalt lebt in JSON-Dateien unter `content/data/`, nicht in Markdown oder CMS.

- `loadContent<T>("features", "en")` → laedt `content/data/en/features.json`
- `loadSharedContent<T>("placeholder")` → laedt `content/data/shared/placeholder.json`

## Constraints

- Faithful rebuild von yapu.com — gleiche Seiten, gleiche Struktur, gleiche Inhalte
- Muss im Promptheus-Stack bleiben
- Kein Zugriff auf WordPress-Backend — alles von der Live-Site extrahiert
- Ember ersetzt CMS — kein Admin-Panel
