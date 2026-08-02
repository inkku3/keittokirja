Keittokirja (Cookbook) — migration repository

Purpose
- Migrates a legacy static cookbook into a React+TypeScript frontend and FastAPI+Postgres backend while preserving legacy behavior and appearance.

Quick links
- Backend deployment & import instructions: backend/DEPLOYMENT.md
- Legacy import and API shapes: backend/README_IMPORT.md
- Frontend build & tests: frontend/
- Tests: frontend/tests and backend/tests

API endpoint shapes (summary)
- Legacy list (used by legacy site):
  GET /api/recipes/
  Response: 200 OK
  Body: JSON array of objects: [{ "name": string, "url": string, "image_path"?: string }, ...]

- Legacy detail (used by legacy detail page):
  GET /api/recipes/{id}
  Response: 200 OK with { "title", "ingredients", "instructions", "info"?, "image_path"? } or 404 if not found.

- Search (new, legacy-compatible):
  GET /api/search?q={query}&tags={csv_tags}&limit={n}&offset={o}
  Response: 200 OK
  Body: JSON array of LegacySearchItem: [{ "name": string, "url": string, "tags"?: string, "image_path"?: string }, ...]
  Notes: q is optional — omitted/empty returns the full alphabetically-sorted list (legacy initial load). Matching is case-insensitive substring on title. Tags use AND semantics and are matched against CSV tag strings stored in the DB.

Environment & deployment notes
- See backend/DEPLOYMENT.md for full deployment, migrations, image hosting, CORS and caching guidance.

Legacy detail endpoint shape (GET /api/recipes/{id})
- Response 200: JSON object with keys:
  - title: string
  - ingredients: string (rendered inside <pre> by the client)
  - instructions: string (rendered inside <pre>)
  - info?: string
  - image_path?: string (preferred absolute or relative path; if null the API returns a legacy fallback path `/recipes/img/{id}` without extension)
- 404 if recipe not found

Image serving strategy
- Prefer DB.image_path when present. If image_path is null the API returns `/recipes/img/{id}` (no extension); the frontend will try .png → .jpg → .jpeg → /fallback.png and hide the <img> if all fail.
- For deployments, either copy legacy images into the backend IMAGES_STATIC_DIR and enable SERVE_IMAGES_FROM_BACKEND, or store absolute CDN URLs in image_path during import.

Required environment variables (backend)
- DATABASE_URL: SQLAlchemy DB URL (postgresql://user:pass@host:port/dbname)
- CORS_ORIGINS: comma-separated list of allowed origins for the frontend
- SERVE_IMAGES_FROM_BACKEND: true/false (if true backend mounts StaticFiles at IMAGES_URL_PREFIX)
- IMAGES_STATIC_DIR: path to on-disk images (defaults to ./static/recipes/img)
- IMAGES_URL_PREFIX: URL prefix for images (default /recipes/img)
- (Optional for migrations/import) Firebase credentials or env vars used by the importer

Rollback & safety
- Always backup the DB before running imports or index changes.
- To rollback search indexes in production use CONCURRENTLY to avoid locks (see backend/DEPLOYMENT.md for example psql commands).

If you need assistance running migrations, imports, or the smoke tests locally or in CI, ask for a Docker Compose or GitHub Actions workflow to automate them.
