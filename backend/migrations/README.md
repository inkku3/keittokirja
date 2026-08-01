This folder contains lightweight SQL migrations for the backend.

How it works
- Migration files are plain SQL and named with a numeric prefix to ensure order (e.g. 0001_create_recipes.sql).
- Use the apply_migrations.py helper to run all unapplied migrations against the configured DATABASE_URL.

Applying migrations
- From the repository root (or backend/), run:

  python backend/apply_migrations.py

- The script will create a migrations tracking table ("applied_migrations") and record applied filenames.

Notes
- This is intentionally lightweight to avoid adding Alembic as a dependency. If you prefer Alembic, replace this with an Alembic environment and migration scripts.
- Migration SQL should be idempotent where feasible (use CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS).
