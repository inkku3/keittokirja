#!/usr/bin/env bash
set -euo pipefail

# Deploy frontend production build to a remote server using rsync over SSH.
# Usage (example):
# VITE_API_URL=https://api.example.com TARGET_USER=ubuntu TARGET_HOST=app.example.com TARGET_DIR=/var/www/html ./deploy_frontend.sh

: "Ensure required env vars are set";
: "VITE_API_URL, TARGET_USER, TARGET_HOST, TARGET_DIR";

if [ -z "${VITE_API_URL:-}" ]; then
  echo "ERROR: VITE_API_URL must be set (e.g. https://api.example.com)" >&2
  exit 2
fi
if [ -z "${TARGET_USER:-}" ] || [ -z "${TARGET_HOST:-}" ] || [ -z "${TARGET_DIR:-}" ]; then
  echo "ERROR: TARGET_USER, TARGET_HOST and TARGET_DIR must be set" >&2
  exit 2
fi

echo "Building frontend with VITE_API_URL=${VITE_API_URL}"
# Ensure node modules installed
if [ ! -d "node_modules" ]; then
  echo "node_modules not present; running npm ci"
  npm ci
fi

# Build (Vite reads VITE_ prefixed vars at build time)
export VITE_API_URL
npm run build

DIST_DIR="dist"
if [ ! -d "${DIST_DIR}" ]; then
  echo "ERROR: build output ${DIST_DIR} not found" >&2
  exit 3
fi

# Rsync to remote
RSYNC_OPTS=(--archive --compress --delete --omit-dir-times --info=progress2)
REMOTE="${TARGET_USER}@${TARGET_HOST}:${TARGET_DIR%/}/"

echo "Syncing ${DIST_DIR}/ -> ${REMOTE}"
rsync "${RSYNC_OPTS[@]}" "${DIST_DIR}/" "${REMOTE}"

# Optional remote reload (set REMOTE_RELOAD_CMD env to run custom command, e.g. 'sudo systemctl reload nginx')
if [ -n "${REMOTE_RELOAD_CMD:-}" ]; then
  echo "Running remote reload command: ${REMOTE_RELOAD_CMD}"
  ssh "${TARGET_USER}@${TARGET_HOST}" -- "${REMOTE_RELOAD_CMD}"
fi

echo "Deployment complete. Frontend available at: ${TARGET_HOST} (ensure DNS and TLS are configured)"
