#!/bin/bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/yapu/yapu2}"
ECOSYSTEM="$APP_DIR/server/ecosystem.config.js"
TARGET="${1:---all}"

log() { echo "[deploy] $(date '+%H:%M:%S') $*"; }

deploy_prod() {
  log "Deploying production..."
  cd "$APP_DIR"
  git pull origin master
  if ! git diff HEAD~1 --quiet -- package-lock.json 2>/dev/null; then
    log "package-lock.json changed — running npm ci"
    npm ci
  fi
  log "Building production (output: .next-prod/)..."
  npm run build
  pm2 restart "$ECOSYSTEM" --only yapu-prod
  log "Production deployed."
}

deploy_dev() {
  log "Deploying dev/preview..."
  cd "$APP_DIR"
  git pull origin master
  if ! git diff HEAD~1 --quiet -- package-lock.json 2>/dev/null; then
    log "package-lock.json changed — running npm ci"
    npm ci
  fi
  pm2 restart "$ECOSYSTEM" --only yapu-dev
  log "Dev/preview deployed (no build needed — next dev serves from source)."
}

case "$TARGET" in
  --prod) deploy_prod ;;
  --dev)  deploy_dev ;;
  --all)  deploy_prod && deploy_dev ;;
  *)
    echo "Usage: deploy.sh [--prod|--dev|--all]"
    echo "  --prod  Build and restart production instance"
    echo "  --dev   Restart dev/preview instance (no build)"
    echo "  --all   Deploy both (default)"
    exit 1
    ;;
esac

pm2 save
log "Deploy complete. PM2 process list saved."
