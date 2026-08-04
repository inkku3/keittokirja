# Keittokirja | AI-Assisted Modernization

**Live site:** https://keittokirja.inkku.xyz

A modernization of a production PHP + JavaScript cookbook application into a **React (TypeScript) + FastAPI** stack. The project explores practical AI-assisted software development through a custom TypeScript CLI agent built on the GitHub Copilot SDK, with all generated code manually reviewed, tested, and refined.

The objective was to preserve existing functionality while improving maintainability, testing, deployment, and developer experience using modern tooling. The legacy application remains in the repository, allowing behaviour to be compared incrementally throughout the migration.

### Technical Highlights

* Migration from **PHP/JavaScript → React + FastAPI**
* Built a **custom TypeScript AI agent** using the GitHub Copilot SDK
* Comprehensive automated testing with **pytest, Jest, and Playwright**
* GitHub Actions CI with GitOps deployment to a personal **K3s** cluster
* Legacy and modern implementations coexist during migration for incremental verification

```
├── agent/                  # Copilot SDK orchestration CLI
├── backend/                # FastAPI API + tests
├── frontend/               # React application + tests
├── legacy/                 # Original application
├── Plan_for_agent.md       # Migration plan
└── .github/workflows/      # CI/CD pipelines
```


## AI-Assisted Development

To support the migration, I built a TypeScript CLI agent around the **GitHub Copilot SDK**. The agent executes tasks from a structured migration plan, tracks progress across sessions, and assists with generating application code and tests.

The initial AI-generated scaffold was not immediately usable. It required debugging to fix missing prompt files, broken workflow logic, and incorrect directory assumptions before it became a productive tool. 

Generated code was reviewed, tested, and refined before being committed.

### Testing & Deployment

The project includes automated testing at multiple levels:

* Backend unit and integration tests using **pytest**
* Frontend unit tests with **Jest** and React Testing Library
* End-to-end testing using **Playwright**
* GitHub Actions CI on every push


### Security

* Database schema managed through migrations
* Production data excluded from version control
* Secrets injected via Kubernetes Secrets
* API responses validated with Pydantic


