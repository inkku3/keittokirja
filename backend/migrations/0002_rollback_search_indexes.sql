-- 0002_rollback_search_indexes.sql
-- Rollback script for 0002_add_search_indexes.sql
-- NOTE: In production, prefer running DROP INDEX CONCURRENTLY to avoid long locks.
-- Example (recommended, run manually via psql or a maintenance connection):
--   DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_title_trgm;
--   DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_title_tsv;
--   DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_tags_gin;

-- Non-concurrent drop (can be executed by the simple migration runner but may take locks):
DROP INDEX IF EXISTS idx_recipes_title_trgm;
DROP INDEX IF EXISTS idx_recipes_title_tsv;
DROP INDEX IF EXISTS idx_recipes_tags_gin;

-- Notes:
-- * If you created the pg_trgm extension specifically for this migration and no other code depends on it,
--   you may remove it with: DROP EXTENSION IF EXISTS pg_trgm;
--   Be cautious: dropping the extension will remove any dependent objects (indexes) and can fail if they still exist.
-- * Recommended rollback procedure in production:
--   1. Run the CONCURRENTLY DROP INDEX commands from psql as a superuser, e.g.:
--      psql "$DATABASE_URL" -c "DROP INDEX CONCURRENTLY IF EXISTS idx_recipes_title_trgm;"
--   2. Run VACUUM ANALYZE recipes;
--   3. Verify application behavior and monitoring for any regressions.

-- End of rollback script
