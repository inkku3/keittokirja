#!/usr/bin/env bash
set -euo pipefail

# deploy/stage_rollout.sh
# Helper script to perform a staged rollout for the search endpoint and associated changes.
# This script is intentionally conservative: it prints commands and performs non-destructive checks by default.

# Usage:
# 1) Configure staging environment variables (export or .env.staging):
#    export DATABASE_URL="postgresql://user:pass@staging-host:5432/keittokirja_staging"
#    export CORS_ORIGINS="https://staging.example.com"
#    export IMAGES_STATIC_DIR="/var/www/staging/keittokirja/images"
#    export SERVE_IMAGES_FROM_BACKEND=true
# 2) Run the script: ./deploy/stage_rollout.sh
#    Pass --import to perform full import (defaults to dry-run).

IMPORT=${IMPORT:-0}
DRY_RUN=1
if [ "$IMPORT" = "1" ]; then
  DRY_RUN=0
fi

echo "Staged rollout helper"
echo "DRY_RUN=$DRY_RUN (set IMPORT=1 or export IMPORT=1 to run full import)"

# 1) Apply migrations
echo "\n==> Applying migrations"
if [ -z "${DATABASE_URL-}" ]; then
  echo "ERROR: DATABASE_URL not set. Aborting." >&2
  exit 2
fi
python3 backend/apply_migrations.py || {
  echo "apply_migrations.py failed. Inspect and retry." >&2
  exit 3
}

# 2) (Optional) Run importer
if [ "$DRY_RUN" -eq 1 ]; then
  echo "\n==> Running importer in dry-run mode (no DB writes)"
  python3 backend/tools/import_legacy_recipes.py || echo "Importer dry-run failed (non-fatal)"
else
  echo "\n==> Running importer in full mode (will write to DB)"
  IMPORT_DRY_RUN=0 python3 backend/tools/import_legacy_recipes.py || { echo "Importer failed" >&2; exit 4; }
fi

# 3) Ensure images are available
if [ "${SERVE_IMAGES_FROM_BACKEND-}" = "true" ] || [ "${SERVE_IMAGES_FROM_BACKEND-}" = "True" ]; then
  echo "\n==> Verifying IMAGES_STATIC_DIR exists: ${IMAGES_STATIC_DIR:-<not-set>}"
  if [ -z "${IMAGES_STATIC_DIR-}" ]; then
    echo "WARNING: IMAGES_STATIC_DIR not set; image requests may 404" >&2
  elif [ ! -d "$IMAGES_STATIC_DIR" ]; then
    echo "WARNING: IMAGES_STATIC_DIR does not exist: $IMAGES_STATIC_DIR" >&2
  else
    echo "IMAGES_STATIC_DIR OK"
  fi
fi

# 4) Restart backend (manual step)
cat <<'ACTION'
\n==> Next (manual): restart the staging backend service so code/migrations take effect.
Examples:
  # systemd
  sudo systemctl restart keittokirja-staging.service

  # docker-compose (from deployment directory)
  docker compose -f docker-compose.staging.yml up -d --no-deps --build backend

  # kube: rollout restart
  kubectl rollout restart deployment/keittokirja-backend -n staging

Wait until health check is OK: curl -fsS $STAGING_API_BASE/health
ACTION

# 5) Run spot-checks comparing legacy site and staging
echo "\n==> Running spot-checks (legacy vs staging)"
# Expect environment variables:
LEGACY_BASE=${LEGACY_BASE:-http://localhost:8001/legacy}
STAGING_BASE=${STAGING_BASE:-http://127.0.0.1:8000}

SAMPLE_IDS=(smoke1 smoke2)

for id in "${SAMPLE_IDS[@]}"; do
  echo "\n-- Checking detail page for id=$id"
  echo "Legacy HTML snippet (first 200 chars):"
  curl -sS "$LEGACY_BASE/recipe/$id" | head -c 200 || true
  echo "\nStaging API detail (/api/recipes/$id):"
  curl -sS "$STAGING_BASE/api/recipes/$id" || true
done

# Search parity checks
echo "\n-- Search parity checks"
QUERIES=("lohi" "salaatti" "")
for q in "${QUERIES[@]}"; do
  echo "\nQuery: '$q'"
  echo "Staging /api/search?q=$q"
  curl -sS "$STAGING_BASE/api/search" --get --data-urlencode "q=$q" | jq '.[:10]' || true
done

echo "\nStaged rollout script completed. Review output above for parity. If results look good, proceed to promotion to production."
exit 0
