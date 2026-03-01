# Webstack — YAPU Experiments

Experimenteller Fork von yapu2. Gleicher Code, eigenes Repo, eigene Subdomain.

**Original:** https://yapu.solutions/
**Basis:** https://yapu.promptheus.cloud (yapu2)
**Live:** https://yapu-experiments.promptheus.cloud

## Kontext

Kopie des yapu2-Rebuilds für Experimente. Änderungen hier beeinflussen nicht die Haupt-Seite yapu.promptheus.cloud.

## Tech-Stack

- **Framework:** Next.js 16 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS v4 (OKLCH, `@theme inline {}` in globals.css)
- **UI-Komponenten:** shadcn/ui
- **i18n:** next-intl (EN/ES/FR), Middleware-basiertes Routing

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
| **App-Pfad** | `/home/yapu-experiments/` |
| **Port** | 3006 (PM2: `yapu-experiments`) |
| **Reverse Proxy** | nginx → 3006 |
| **SSL** | Let's Encrypt (certbot, auto-renew) |
| **GitHub** | promptheus-cloud/yapu-experiments |

### Deployment

```bash
ssh root@187.77.66.133 "cd /home/yapu-experiments && git pull origin master && npm run build && pm2 restart yapu-experiments"
```

Vor dem Push: `gh auth switch --user promptheus-cloud && gh auth setup-git`
Nach dem Push: `gh auth switch --user Marlin-hi`

## Content-Architektur

Inhalt lebt in JSON-Dateien unter `content/data/`, nicht in Markdown oder CMS.

- `loadContent<T>("features", "en")` → laedt `content/data/en/features.json`
- `loadSharedContent<T>("placeholder")` → laedt `content/data/shared/placeholder.json`

## Constraints

- Faithful rebuild von yapu.solutions
- Muss im Promptheus-Stack bleiben
- Kein Zugriff auf WordPress-Backend — alles von der Live-Site extrahiert
