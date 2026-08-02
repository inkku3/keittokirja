Deployment checklist — backend + frontend (staging / production)

Overview
- Run migrations and import legacy recipes before exposing the API to the frontend.
- Ensure recipe images are available either via backend StaticFiles (IMAGES_STATIC_DIR) or a CDN; frontend expects /recipes/img/<id>.<ext> and /fallback.png.
- Configure CORS to allow the frontend origin(s).

Environment variables (important)
- DATABASE_URL: SQLAlchemy DB URL (postgresql://user:pass@host:port/dbname)
- CORS_ORIGINS: comma-separated list of allowed origins (or set via config file)
- SERVE_IMAGES_FROM_BACKEND: boolean (true/false). If true, backend will mount StaticFiles at IMAGES_URL_PREFIX.
- IMAGES_STATIC_DIR: path on disk containing recipe images (files named <id>.png/.jpg/.jpeg) and fallback.png.
- IMAGES_URL_PREFIX: URL prefix where images are mounted (default: /recipes/img)
- API_HOST, API_PORT, API_DEBUG: uvicorn binding and reload options.

Steps
1) Prepare DB and environment
   - Export DATABASE_URL and other env vars (example):
     export DATABASE_URL="postgresql://user:pass@db:5432/keittokirja"
     export CORS_ORIGINS="https://example.com"
     export IMAGES_STATIC_DIR="/var/www/keittokirja/images"
     export IMAGES_URL_PREFIX="/recipes/img"
     export SERVE_IMAGES_FROM_BACKEND=true

Caching & CORS guidance for search endpoint:
- CORS: set CORS_ORIGINS to the exact frontend origin(s) (e.g., https://app.example.com). Avoid using '*' in production.
- Cache-Control: the search endpoint sets conservative headers by default (Cache-Control: private, max-age=0, no-store). If you want edge caching for repeated queries, consider configuring selective CDN caching rules keyed by query string and only for non-user-specific queries.
- If enabling CDN caching, ensure Vary and query-string-based cache keys are configured so live per-keystroke UX isn't negatively affected.

2) Apply migrations
   - Run migrations using the bundled runner:
     python3 backend/apply_migrations.py --database-url "$DATABASE_URL"
   - Verify the recipes table exists.

3) Import legacy recipes
   - Dry-run first (prints transformed rows):
     python3 backend/tools/import_legacy_recipes.py
   - Full import (writes to DB):
     IMPORT_DRY_RUN=0 python3 backend/tools/import_legacy_recipes.py
   - Confirm counts and spot-check a few rows (see backend/README_IMPORT.md checklist).

4) Populate image assets
   Option A — Serve from backend (recommended for small deployments):
     - Copy legacy image files into IMAGES_STATIC_DIR. Filenames should follow <id>.png, <id>.jpg, etc.
     - Ensure fallback.png and icons are present in the served directory or frontend/public.
     - Backend will mount StaticFiles at IMAGES_URL_PREFIX if SERVE_IMAGES_FROM_BACKEND is true.
   Option B — CDN/static hosting:
     - Upload images to CDN and ensure image_path returned by import points to CDN URLs (or serve via frontend/public).
     - Update import or DB rows if using absolute CDN image URLs.

5) Start backend
   - With uvicorn (example):
     cd backend
     uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
   - Verify health:
     curl -sS http://127.0.0.1:8000/health

6) Configure frontend
   - Build with VITE_API_URL pointing to the backend: e.g.
     export VITE_API_URL="https://api.example.com"
     cd frontend
     npm ci
     npm run build
   - Deploy built assets to static host (S3, Netlify, or a simple webserver);
     ensure origin matches CORS_ORIGINS in backend.

Verification (quick)
- API:
  curl -sS "${API_BASE:-http://127.0.0.1:8000}/api/recipes/" | jq '.[0]'
  curl -sS "${API_BASE:-http://127.0.0.1:8000}/api/recipes/smoke1" | jq
- Images:
  curl -I "${IMAGE_BASE:-http://127.0.0.1:8000}${IMAGES_URL_PREFIX}/smoke1.png"
- Frontend:
  Open https://frontend-host/recipe/smoke1 and confirm page shows header, ingredients, instructions.

Automated smoke tests
- Playwright tests are in frontend/tests/e2e. Run after frontend is served and backend is up:
  npx playwright test frontend/tests/e2e/recipe_detail.smoke.spec.ts

Rollback and safety
- Backup DB before large imports.
- Test import on staging DB and run the smoke tests there before production.

Rollback for search indexes
- A rollback SQL script is provided at backend/migrations/0002_rollback_search_indexes.sql. Review it before running.
- Recommended safe production rollback (use psql to run these CONCURRENTLY to avoid locks):
  psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_title_trgm;"
  psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_title_tsv;"
  psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_tags_gin;"
  # Optional: drop extension if no other features depend on it
  psql "$DATABASE_URL" -c "DROP EXTENSION IF EXISTS pg_trgm;"
- If you must use the provided rollback SQL file (it uses non-CONCURRENT drops), run it during a maintenance window and expect potential table locks on large datasets.
- After rollback, run: VACUUM ANALYZE recipes; and monitor query plans and app performance.

Notes
- If images are served from a CDN, update DB.image_path to absolute URLs or let the client fall back to CDN paths by configuring import to write full URLs.
- CORS: allow the exact frontend origin(s); wildcard '*' is not recommended for production.

Further reading
- API shapes and import instructions: backend/README_IMPORT.md

Search endpoint: shape & tuning
- Endpoint: GET /api/search
  - Query params:
    - q (optional): substring query to match title (case-insensitive). If omitted or empty, returns full alphabetically-sorted list (legacy initial load).
    - tags (optional): comma-separated tokens; recipe must contain all tokens (AND semantics) — tokens compared against CSV `tags` column.
    - limit, offset: pagination controls (limit default 100, server-max 1000).
  - Response: 200 OK with array of LegacySearchItem: { name, url, tags?, image_path? }
  - Headers: responses include conservative caching headers (Cache-Control: private, max-age=0, no-store) to avoid stale per-keystroke results. Adjust CDN/edge configuration if you enable caching by query string.

Index maintenance & performance tips
- Create indexes using migration 0002_add_search_indexes.sql. In production, create the indexes using CONCURRENTLY to avoid locks:
  psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
  psql "$DATABASE_URL" -c "CREATE INDEX CONCURRENTLY idx_recipes_title_trgm ON recipes USING GIN (lower(title) gin_trgm_ops);"
  psql "$DATABASE_URL" -c "CREATE INDEX CONCURRENTLY idx_recipes_tags_gin ON recipes USING GIN ((string_to_array(tags, ',')));"
- After index creation run: VACUUM ANALYZE recipes;
- If you add a search_vector column and index (optional), populate it via the importer or a migration and add a trigger to keep it up-to-date. See backend/SEARCH_INDEXES.md for details.

Query tuning tips
- For substring searches, pg_trgm GIN index on lower(title) yields the best performance for LIKE '%%' patterns;
- For heavy write workloads, consider keeping tags as TEXT[] instead of CSV for simpler queries and indexing (migration recommended).
- Monitor slow queries (pg_stat_statements) and tune work_mem / planner settings if necessary.
- If traffic causes per-keystroke load spikes, consider adding a small client-side debounce (e.g., 150-300ms) — this changes legacy UX but reduces load.

Operational checklist
- Apply migrations (apply_migrations.py) and verify indexes exist.
- Run importer (dry-run then full import) and spot-check data.
- Ensure IMAGES_STATIC_DIR is populated and accessible, or set DB.image_path to CDN URLs.
- Configure CORS_ORIGINS to the frontend origin(s).
- Run smoke tests (backend/tests and frontend/tests/e2e) in staging before production rollout.

Consolidated reference (endpoint shapes, image strategy, env vars, rollback)

1) Endpoint shapes
- GET /api/recipes/
  - 200: JSON array of legacy list items: { name: string, url: string, image_path?: string }
- GET /api/recipes/{id}
  - 200: LegacyRecipeDetail: { title: string, ingredients: string, instructions: string, info?: string, image_path?: string }
  - 404: recipe not found
  - 500: unexpected server error (stack trace logged)
- GET /api/search?q={query}&tags={csv}&limit={n}&offset={o}
  - 200: array of legacy-compatible search items

2) Image serving strategy (exact behavior)
- When importing, prefer storing absolute or relative image_path in DB.
- If DB.image_path is NULL the API returns `/recipes/img/{id}` (no extension). The frontend attempts in order: {image_path}, /recipes/img/{id}.png, .jpg, .jpeg, then /fallback.png. If all fail the frontend hides the <img id="image"> element.
- Deployment options:
  - Serve from backend: set SERVE_IMAGES_FROM_BACKEND=true, ensure IMAGES_STATIC_DIR contains <id>.<ext> and fallback.png. Backend mounts StaticFiles at IMAGES_URL_PREFIX.
  - Serve from CDN: import/patch DB rows to use CDN URLs in image_path.

3) Required environment variables (minimum)
- DATABASE_URL: required (SQLAlchemy URL)
- CORS_ORIGINS: recommended (comma-separated frontend origins)
- SERVE_IMAGES_FROM_BACKEND: true|false
- IMAGES_STATIC_DIR: path containing served images (if SERVE_IMAGES_FROM_BACKEND=true)
- IMAGES_URL_PREFIX: URL prefix used for images (default /recipes/img)
- API_HOST/API_PORT/API_DEBUG: uvicorn options
- Optional: Firebase credentials if using the importer against Firebase

4) Rollback steps (safe approach)
- Backup the DB before making changes.
- For dropping search indexes in production use CONCURRENTLY to avoid locks:
  psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_title_trgm;"
  psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_tags_gin;"
  psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_title_tsv;"
  psql "$DATABASE_URL" -c "DROP EXTENSION IF EXISTS pg_trgm;"
- If using the provided SQL rollback file, run it during a maintenance window and be prepared for non-CONCURRENT drops on large datasets.
- After rollback: VACUUM ANALYZE recipes; monitor query plans and app performance.

For more details see backend/README_IMPORT.md and backend/SEARCH_INDEXES.md
