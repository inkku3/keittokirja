## AI-Assisted Development

To support the migration, I built a TypeScript CLI agent around the **GitHub Copilot SDK**. The agent executes tasks from a structured migration plan, tracks progress across sessions, and assists with generating application code and tests.

The initial AI-generated scaffold was not immediately usable. It required debugging to fix missing prompt files, broken workflow logic, and incorrect directory assumptions before it became a productive tool.

Generated code was reviewed, tested, and refined before being committed.

### Testing & Deployment

The project includes automated testing at the unit/component level, favoring a smaller set of well-maintained tests over broad, brittle coverage — appropriate for an application of this size:

* Backend unit and integration tests using **pytest**
* Frontend unit and component tests with **Jest** and React Testing Library, covering hooks (dark mode, image loading, recipe fetching), search behavior, filtering, and the recipe detail page
* GitHub Actions CI on every push

An earlier iteration of the project also ran end-to-end tests with **Playwright**. These were deprecated during the React migration: the e2e specs had drifted out of sync with the app (mismatched ports, stale localStorage keys, hardcoded backend fixtures) and largely duplicated coverage that the RTL component tests already provide more reliably and without needing a live server or seeded data. For an app this size, the maintenance cost of a parallel e2e suite outweighed the marginal coverage it added.

### Security

* Database schema managed through migrations
* Production data excluded from version control
* Secrets injected via Kubernetes Secrets
* API responses validated with Pydantic
