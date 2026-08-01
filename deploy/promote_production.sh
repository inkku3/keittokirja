#!/usr/bin/env bash
set -euo pipefail

# deploy/promote_production.sh
# Promote staged changes to production. This script is a template and performs non-destructive
# verification steps. It DOES NOT perform the deployment itself — that step should be executed
# by your CI/CD system (ArgoCD, GitHub Actions, manual kubectl/docker commands).

# Usage:
# 1) Ensure staging checks passed and you have a production maintenance window.
# 2) Configure production env vars (DATABASE_URL, IMAGES_STATIC_DIR, etc.).
# 3) Run this script to apply migrations and perform smoke tests.

if [ -z "${DATABASE_URL-}" ]; then
  echo "ERROR: DATABASE_URL not set. Set production DATABASE_URL and re-run." >&2
  exit 2
fi

echo "Promote to production: apply migrations and run smoke checks"

# 1) Apply migrations
echo "==> Applying migrations"
python3 backend/apply_migrations.py || { echo "Migrations failed" >&2; exit 3; }

# 2) (Optional) Run importer in full mode if you need to import new legacy data
if [ "${IMPORT_PROD-}" = "1" ]; then
  echo "==> Running importer in full mode (production)"
  IMPORT_DRY_RUN=0 python3 backend/tools/import_legacy_recipes.py || { echo "Importer failed" >&2; exit 4; }
fi

# 3) Restart production backend (manual or via deployment system)
cat <<'ACTION'
==> Next: perform your production deployment step (CI/CD or manual)
Examples:
  # Docker Compose
  docker compose -f docker-compose.prod.yml up -d --no-deps --build backend

  # Kubernetes
  kubectl rollout restart deployment/keittokirja-backend -n production

  # systemd
  sudo systemctl restart keittokirja.service

Wait until health check is OK: curl -fsS $PROD_API_BASE/health
ACTION

# 4) Run production smoke checks (non-destructive)
PROD_BASE=${PROD_BASE:-http://127.0.0.1:8000}

echo "Running smoke API checks against $PROD_BASE"
set +e
curl -fsS "$PROD_BASE/health" -o /dev/null
if [ $? -ne 0 ]; then
  echo "Health check failed against $PROD_BASE" >&2
  exit 5
fi

curl -sS "$PROD_BASE/api/search" | jq '.[:3]'
curl -sS "$PROD_BASE/api/recipes/" | jq '.[:3]'
set -e

echo "Promotion script completed. Monitor logs and metrics closely after promotion."

exit 0
