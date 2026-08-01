Legacy recipes import and API shape

This document explains the legacy API JSON shapes and how to re-import legacy recipes into PostgreSQL.

Legacy endpoint shapes

1) Legacy recipe list (GET /api/recipes/)
- Returns an array of simple objects used by the legacy site:
  - name: string (recipe title)
  - url: string (relative link, e.g. "recipes/<id>")
  - image_path: optional string (relative or absolute URL)

  Example:
  [
    { "name": "Karjalanpaisti", "url": "recipes/abc123", "image_path": "/recipes/img/abc123.png" },
    { "name": "Lohikeitto", "url": "recipes/def456" }
  ]

2) Legacy recipe detail (GET /api/recipes/{id})
- Returns a full recipe object compatible with the legacy recipelookup.js usage (keys returned by Pydantic LegacyRecipeDetail):
  - title: string
  - ingredients: string (rendered inside <pre>)
  - instructions: string (rendered inside <pre>)
  - info: optional string
  - image_path: optional string

  Example:
  {
    "title": "Karjalanpaisti",
    "ingredients": "1 kg lihaa\nSuolaa",
    "instructions": "1. Laita pataan\n2. Hauduta",
    "info": "Annoksia: 4",
    "image_path": "/recipes/img/abc123.png"
  }

Re-importing legacy recipes (one-off)

Script location:
- backend/tools/import_legacy_recipes.py

Pre-conditions:
- DATABASE_URL environment variable points to the target Postgres DB.
- Migrations must be applied before import: run python backend/apply_migrations.py
- Firebase credentials configured (either firebase_credentials.json in backend/ or environment variables/GOOGLE_APPLICATION_CREDENTIALS) if importing from Firebase. If Firebase is not available, edit the script to read from local files.

Dry-run:
- By default the script performs a dry-run and prints transformed rows.
- To run a dry-run: python backend/tools/import_legacy_recipes.py

Full import:
- Run with environment variable IMPORT_DRY_RUN=0 to write to DB:
  IMPORT_DRY_RUN=0 python backend/tools/import_legacy_recipes.py

Idempotency:
- The script skips rows whose id already exists in the recipes table.
- Review logs and the DB to confirm counts.

Image handling:
- The import script sets image_path to recipes/img/<id> by default when no explicit image_path exists in the source.
- Ensure the images are copied into IMAGES_STATIC_DIR (or served by the frontend/CDN) at the expected paths (e.g., /recipes/img/<id>.png).

Rollback and safety:
- Backup the target DB before running the import in production.
- Test import in a staging DB first.

If you need the import adapted to read from file-based sources instead of Firebase or to update existing rows instead of skipping, open a ticket or edit backend/tools/import_legacy_recipes.py accordingly.
