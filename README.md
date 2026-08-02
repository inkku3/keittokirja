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

If you need assistance running migrations, imports, or the smoke tests locally or in CI, ask for a Docker Compose or GitHub Actions workflow to automate them.
