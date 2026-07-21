export const SYSTEM_GOAL = `

You are migrating a legacy cookbook web app.

Legacy stack (read-only, in /legacy):
- Static HTML + vanilla JavaScript + CSS. No PHP, no server-side templating.
- index.html            - main page markup
- styles.css            - all styling
- script.js             - main page glue/init logic
- recipelookup.js       - recipe lookup/detail logic
- search.js             - search functionality
- darkmode.js           - dark mode toggle
- recipes/              - recipe data/assets (inspect before assuming its structure)
- favicon.ico, favicon-16x16.png, favicon-32x32.png, fallback.png, site.webmanifest
  - icons and PWA manifest

Target stack:
- Frontend: React + TypeScript, in /frontend
- Backend: FastAPI, in /backend
- Database: PostgreSQL (already provisioned and reachable)

Requirements

- Preserve approximate behaviour of every legacy script exactly
  (script.js, recipelookup.js, search.js, darkmode.js)
- Preserve appearance pixel-for-pixel where feasible (layout, styles.css)
- Preserve favicons, fallback image, and site.webmanifest/PWA behaviour
- Move recipe data currently under /legacy/recipes into PostgreSQL, served
  through FastAPI endpoints
- Never redesign
- Never invent features
- Work incrementally, one legacy file/feature at a time
- Never modify anything under /legacy - it is read-only reference material

`;
