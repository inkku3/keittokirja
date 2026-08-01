-- 0002_add_search_indexes.sql
-- Adds indexes to support fast case-insensitive substring searches (legacy behavior) and tag filtering.
-- Run against PostgreSQL only. Create extension once per database.

-- Enable trigram extension (required for GIN trigram indexes)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram GIN index on lower(title) to accelerate "%keyword%" substring searches
-- Used by queries like: WHERE lower(title) LIKE '%' || lower(:q) || '%'
-- Use CONCURRENTLY in production to avoid locking large tables (run outside a transaction):
-- CREATE INDEX CONCURRENTLY idx_recipes_title_trgm ON recipes USING GIN (lower(title) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON recipes USING GIN (lower(title) gin_trgm_ops);

-- Optional: full-text GIN index for future relevance-based search (not used for legacy substring semantics)
CREATE INDEX IF NOT EXISTS idx_recipes_title_tsv ON recipes USING GIN (to_tsvector('simple', coalesce(title, '')));

-- Tags: current schema stores tags as comma-separated text (e.g. 'keitto,kala').
-- To support AND semantics (recipe must include all requested tags) create an expression GIN index on the array produced by string_to_array(tags, ',')
-- Example query will use: string_to_array(tags, ',') @> string_to_array(:requested_tags, ',')
CREATE INDEX IF NOT EXISTS idx_recipes_tags_gin ON recipes USING GIN ( (string_to_array(tags, ',')) );

-- Notes:
-- * Prefer to create indexes CONCURRENTLY in production to avoid long locks:
--   CREATE INDEX CONCURRENTLY idx_recipes_title_trgm ON recipes USING GIN (lower(title) gin_trgm_ops);
-- * After creating indexes, run ANALYZE on the table for correct planner statistics:
--   VACUUM ANALYZE recipes;
-- * If you migrate tags to TEXT[] (recommended long-term), use:
--   ALTER TABLE recipes ALTER COLUMN tags TYPE TEXT[] USING string_to_array(tags, ',');
--   CREATE INDEX CONCURRENTLY idx_recipes_tags_gin_arr ON recipes USING GIN (tags);

-- End of migration
