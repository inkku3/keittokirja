-- 0001_create_recipes.sql
-- Creates the recipes table and supporting indexes

CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    tags TEXT,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    info TEXT,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster title searches (case-insensitive sorting/searching should use lower(title) where needed)
CREATE INDEX IF NOT EXISTS idx_recipes_title ON recipes (title);

-- Index for faster tag filtering
CREATE INDEX IF NOT EXISTS idx_recipes_tags ON recipes (tags);
