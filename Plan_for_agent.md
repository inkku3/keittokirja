
1. Inventory (no changes yet)
~~
```
/plan Read every file in /legacy (index.html, styles.css, script.js, recipelookup.js, search.js, darkmode.js, the full contents of recipes/, site.webmanifest, and the favicon/fallback assets). Produce a written inventory describing: what each script does, what DOM elements/IDs/classes they depend on, what data format recipes/ actually contains, and how the files reference each other. Make no code changes.
```
~~
2. Static shell first

```
/plan Using the inventory, recreate index.html's structure and styles.css as a React + TypeScript app shell in /frontend, matching the current layout, fonts, colors, and spacing exactly. Copy over favicon.ico, favicon-16x16.png, favicon-32x32.png, fallback.png, and site.webmanifest so the PWA metadata is identical. Do not implement search, recipe lookup, or dark mode yet - static markup only.
```

3. Data migration
~~
```
/plan Using this schema:

CREATE TABLE recipes (
    id           text PRIMARY KEY,
    title        text NOT NULL,
    ingredients  text,
    instructions text,
    info         text
);

CREATE TABLE recipe_tags (
    recipe_id text NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag       text NOT NULL,
    PRIMARY KEY (recipe_id, tag)
);

CREATE INDEX recipe_tags_tag_idx ON recipe_tags (tag);

Set up the FastAPI app in /backend with SQLAlchemy models and Alembic migrations matching this schema exactly. Read the database connection string only from a DATABASE_URL environment variable - never hardcode, guess, or request real credentials.

I have not granted access to the production database yet, so for now: spin up a local, disposable PostgreSQL instance via Docker for development, and seed it with a handful of sample rows derived from the /legacy/recipes inventory (fake/representative data only, not real production data). All backend tests must run against this local disposable instance, never against a real production database.

When real credentials are supplied later, only the DATABASE_URL value should need to change - no code changes.

```

4. Recipe list endpoint + component
~~
```
/plan Add a FastAPI GET endpoint in /backend that returns the recipe list from PostgreSQL in the same shape that script.js and recipelookup.js currently expect. Then build a React component in /frontend that calls this endpoint and renders the recipe list identically to how legacy/script.js and legacy/index.html render it today.
```

5. Recipe detail / lookup
~~
```
/plan Migrate the behaviour of legacy/recipelookup.js: add a FastAPI endpoint to fetch a single recipe's full detail by id/slug from PostgreSQL, and a React component/route that displays it exactly as the legacy recipe lookup does, including any fallback/error states recipelookup.js currently handles.
```

6. Search
~~
```
/plan Migrate legacy/search.js: implement similar search behaviour (matching fields, matching filtering/sorting logic, matching how results update as the user types) using a FastAPI search endpoint against PostgreSQL and a React search component with identical UX to the legacy version.
```

7. Dark mode
~~
```
/plan Migrate legacy/darkmode.js into a React-based dark mode toggle in /frontend. Preserve the exact same visual dark/light theme colors from styles.css, the same toggle control placement and behavior, and the same persistence mechanism (check whether darkmode.js uses localStorage, a cookie, or prefers-color-scheme, and replicate that).
```

7.5 Bug fixes
~~

```
Read the file ../CI_FAILURE_REPORT.md at the project root — it documents real, verified build and test failures found by actually running the commands locally. Work through it in the order specified. Follow the ground rules at the bottom exactly: run the actual commands and paste real output before claiming anything is fixed, and do not commit or merge until all three (build, frontend tests, backend tests) pass together.
```

8. PWA/asset check
~~
```
/plan Verify site.webmanifest, favicons, and fallback.png work identically in the new React app (installability, icons, offline fallback behavior if any). Fix any discrepancies found against the legacy version.
```

9. Final diff pass

```
/plan Compare the migrated React + FastAPI + PostgreSQL app against the original /legacy site feature by feature (layout, recipe list, recipe lookup, search, dark mode, PWA behavior) and list every remaining visual or behavioral difference. Do not fix anything yet, just report.
```

