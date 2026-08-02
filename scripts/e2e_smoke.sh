#!/usr/bin/env bash
set -euo pipefail

# e2e_smoke.sh
# Run a local E2E smoke test:
# - Start backend (uvicorn)
# - Build frontend and serve via vite preview on port 3000
# - Run Playwright smoke test frontend/tests/e2e/recipe-detail.spec.ts
# Requirements: node/npm, python, uvicorn, npx, playwright

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Configurable env vars (set before running):
# DATABASE_URL - Postgres DB to use for migrations/import and backend
# IMPORT_DRY_RUN - set to 0 to perform real import if importer can access Firebase
# E2E_SAMPLE_ID - recipe id to test (defaults to r1)

BACKEND_LOG=logs/backend.log
FRONTEND_LOG=logs/frontend.log
PIDS_DIR=tmp/pids
mkdir -p logs "$PIDS_DIR"

function ensure_cmd() {
  command -v "$1" >/dev/null 2>&1 || { echo "Required command '$1' not found. Install it first."; exit 1; }
}

ensure_cmd python
ensure_cmd uvicorn
ensure_cmd npm
ensure_cmd npx

# Apply migrations
echo "Applying migrations..."
python backend/apply_migrations.py

# Optionally import legacy recipes (dry-run by default)
if [ "${IMPORT_DRY_RUN:-1}" = "0" ]; then
  echo "Running full import (IMPORT_DRY_RUN=0)"
  IMPORT_DRY_RUN=0 python backend/tools/import_legacy_recipes.py
else
  echo "Running importer in dry-run mode (no DB writes). Set IMPORT_DRY_RUN=0 to write." 
  python backend/tools/import_legacy_recipes.py || true
fi

# Start backend
echo "Starting backend (uvicorn)"
# run uvicorn in background, bind to 127.0.0.1:8000
nohup uvicorn backend.main:app --host 127.0.0.1 --port 8000 > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$PIDS_DIR/backend.pid"

# Wait for backend readiness
echo "Waiting for backend to be ready at http://127.0.0.1:8000/api/recipes/"
for i in {1..30}; do
  if curl -sSf http://127.0.0.1:8000/api/recipes/ > /dev/null 2>&1; then
    echo "Backend ready"
    break
  fi
  sleep 1
done

# Build frontend
echo "Building frontend"
cd frontend
npm ci --silent
npm run build --silent
cd ..

# Start frontend preview on port 3000
echo "Starting frontend preview on port 3000"
nohup npx vite preview --port 3000 > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PIDS_DIR/frontend.pid"

# Wait for frontend readiness
echo "Waiting for frontend to be ready at http://127.0.0.1:3000/"
for i in {1..30}; do
  if curl -sSf http://127.0.0.1:3000/ > /dev/null 2>&1; then
    echo "Frontend ready"
    break
  fi
  sleep 1
done

# Run Playwright smoke test
echo "Running Playwright smoke test"
# Ensure browsers are installed
npx playwright install --with-deps
npx playwright test frontend/tests/e2e/recipe-detail.spec.ts --reporter=list
TEST_EXIT=$?

# Cleanup
echo "Stopping services"
if [ -f "$PIDS_DIR/frontend.pid" ]; then kill "$(cat $PIDS_DIR/frontend.pid)" || true; fi
if [ -f "$PIDS_DIR/backend.pid" ]; then kill "$(cat $PIDS_DIR/backend.pid)" || true; fi

exit $TEST_EXIT
