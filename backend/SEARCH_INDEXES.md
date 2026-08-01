Search indexes and query patterns for legacy substring search

Overview
- The legacy site performs case-insensitive substring searches on recipe titles (title.toLowerCase().includes(keyword)).
- To support this efficiently in Postgres, use the pg_trgm (trigram) extension and a GIN trigram index on lower(title).
- Tag filtering in the legacy code uses comma-separated tag strings and requires AND semantics: a recipe matches if it contains every selected tag token.

Recommended indexes
1) Trigram index for substring search (fast "%keyword%" queries)
- SQL (create once per DB):
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX CONCURRENTLY idx_recipes_title_trgm ON recipes USING GIN (lower(title) gin_trgm_ops);
- If running from a migration runner that doesn't support CONCURRENTLY, create without CONCURRENTLY during maintenance windows:
  CREATE INDEX IF NOT EXISTS idx_recipes_title_trgm ON recipes USING GIN (lower(title) gin_trgm_ops);

2) Tags index for AND-semantics (CSV -> array expression index)
- For current CSV `tags` column (text):
  CREATE INDEX CONCURRENTLY idx_recipes_tags_gin ON recipes USING GIN ((string_to_array(tags, ',')));
- Recommended long-term: migrate tags to TEXT[] and create a standard GIN index:
  ALTER TABLE recipes ALTER COLUMN tags TYPE TEXT[] USING string_to_array(tags, ',');
  CREATE INDEX CONCURRENTLY idx_recipes_tags_gin_arr ON recipes USING GIN (tags);

Example query patterns (legacy semantics)
- Substring-only search (no tags):
  SELECT id, title, tags, image_path
  FROM recipes
  WHERE lower(title) LIKE '%' || lower(:q) || '%'
  ORDER BY lower(title) ASC
  LIMIT :limit OFFSET :offset;

- Substring + tags (AND semantics, tags param is comma-separated tokens):
  SELECT id, title, tags, image_path
  FROM recipes
  WHERE lower(title) LIKE '%' || lower(:q) || '%'
    AND (string_to_array(tags, ',') @> string_to_array(:tags, ','))
  ORDER BY lower(title) ASC
  LIMIT :limit OFFSET :offset;

- If q is empty or NULL, omit the title predicate to return the full alphabetically-sorted list (legacy initial load behavior).

Using a materialized search vector (optional)
- For higher performance or to enable full-text search features, add a search_vector column of type tsvector and populate it during import.
- Migration example to add the column (Postgres):
  ALTER TABLE recipes ADD COLUMN IF NOT EXISTS search_vector tsvector;
  UPDATE recipes SET search_vector = to_tsvector('simple', coalesce(title, ''));
  CREATE INDEX CONCURRENTLY idx_recipes_search_vector ON recipes USING GIN (search_vector);

- Keep search_vector up-to-date:
  - Option A (recommended): use a trigger to update search_vector on INSERT/UPDATE:
    CREATE FUNCTION recipes_search_vector_trigger() RETURNS trigger AS $$
    begin
      new.search_vector := to_tsvector('simple', coalesce(new.title, ''));
      return new;
    end
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER recipes_search_vector_update BEFORE INSERT OR UPDATE
    ON recipes FOR EACH ROW EXECUTE PROCEDURE recipes_search_vector_trigger();

  - Option B: populate during bulk import (the importer now attempts to populate search_vector if present) and periodically refresh with a scheduled job.

- Querying using search_vector (if available):
  SELECT id, title, tags, image_path
  FROM recipes
  WHERE search_vector @@ plainto_tsquery('simple', :q)
  ORDER BY lower(title) ASC
  LIMIT :limit OFFSET :offset;

Notes:
- Adding a search_vector and trigger increases write cost (small) but can significantly speed up complex search workflows.
- The importer was updated to detect and populate search_vector if the column exists in Postgres.

Notes and operational guidance
- Use parameterized queries; avoid building SQL with string concatenation.
- The planner will use the trigram index for ILIKE/LIKE patterns with surrounding % when pg_trgm is enabled and the index is on lower(title).
- Creating large indexes can take time; prefer CREATE INDEX CONCURRENTLY on production. Concurrency requires running outside a transaction.
- After index creation, run VACUUM ANALYZE recipes to refresh planner stats.

Maintenance
- Rebuild or REINDEX periodically if you bulk-update many rows.
- If search queries still perform poorly, consider:
  - Increasing work_mem for complex queries
  - Adding a materialized search view (precomputed tsvector) for heavier workloads
  - Introducing a short client-side debounce if traffic causes excessive load (note: this alters legacy per-keystroke UX)

Compatibility
- These instructions assume PostgreSQL (pg_trgm). SQLite does not support pg_trgm — use SQLite only for lightweight local tests.

End.
