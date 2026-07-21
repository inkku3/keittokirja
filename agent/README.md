# Cookbook Migration Agent

An interactive CLI agent (built on the GitHub Copilot SDK) that plans and
executes the migration of a legacy PHP + JavaScript cookbook app to
React + TypeScript on the frontend and FastAPI + PostgreSQL on the backend.


## Directory layout

The agent assumes this structure:

```
/                (PROJECT_ROOT - the parent of /agent)
├── agent/        <- this project (run npm commands from here)
├── frontend/
├── backend/
└── legacy/
```

`PROJECT_ROOT` is computed automatically as the parent of wherever the
agent is run from. If you ever run it from somewhere else, override it
explicitly:

```bash
PROJECT_ROOT=/path/to/project/root npm run dev
```

## Requirements

- Node.js 20+
- A GitHub account with Copilot access, authenticated for the Copilot SDK
  (either run `gh auth login` first, or set a `COPILOT_GITHUB_TOKEN`
  environment variable — see the [Copilot SDK docs](https://docs.github.com/en/copilot/how-tos/copilot-sdk/getting-started)
  for current setup steps).
- Run the agent from inside the root of the repo you want to migrate.
  It expects (and checks for) `frontend/`, `backend/`, and `legacy/`
  folders alongside a `package.json`.

## Install

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

## Run (production build)

```bash
npm run build
npm start
```

## Using the agent

Once connected, you get a `>` prompt. Available commands:

| Command                | What it does                                              |
|-------------------------|------------------------------------------------------------|
| `/plan <goal>`          | Asks the model for a numbered step-by-step migration plan for `<goal>` and stores it |
| `/migrate`              | Runs every remaining step in the current plan, one at a time, showing the model's output for each |
| `/status`               | Shows the current goal, how many steps are done, and what's next |
| `/build`                | Runs `npm run build` in `frontend/` and `pytest` in `backend/`, printing results |
| `/reset`                | Clears the saved plan, progress, and history |
| `help`                  | Shows this command list |
| `exit` (or `quit`)      | Saves progress and quits |
| anything else           | Sent straight to the assistant as a normal chat message |

**Example session:**

```
> /plan Migrate the recipe list page from legacy PHP to React
Planning...

Plan:
  1. Inventory the legacy recipe list page and its data fields
  2. Create a FastAPI endpoint that returns recipes from PostgreSQL
  3. Build a React RecipeList component matching the existing layout
  ...

> /migrate
================================
1. Inventory the legacy recipe list page and its data fields
================================
...

> /status
Goal:     Migrate the recipe list page from legacy PHP to React
Progress: 1/6 tasks
Next:     2. Create a FastAPI endpoint that returns recipes from PostgreSQL

> /build
Building frontend...
...
```

Progress is saved automatically to `.agent-state.json` after every
planning step and every completed task, and is restored automatically the
next time you run the agent — so you can stop and resume a migration
across sessions. `/reset` deletes this file and clears in-memory state if
you want to start over.
