-- Recipes table for storing recipe data
CREATE TABLE recipes (
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

-- Index for faster title searches
CREATE INDEX idx_recipes_title ON recipes (title);

-- Index for faster tag filtering
CREATE INDEX idx_recipes_tags ON recipes (tags);
