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

Notes
- If images are served from a CDN, update DB.image_path to absolute URLs or let the client fall back to CDN paths by configuring import to write full URLs.
- CORS: allow the exact frontend origin(s); wildcard '*' is not recommended for production.

Further reading
- API shapes and import instructions: backend/README_IMPORT.md
