# Cookbook Migration Agent

An interactive CLI agent (built on the GitHub Copilot SDK) that plans and
executes the migration of a legacy PHP + JavaScript cookbook app to
React + TypeScript on the frontend and FastAPI + PostgreSQL on the backend.

## What was fixed

The version you had would not run at all, and most of its own building
blocks were unused:

- It crashed immediately on startup because it tried to read
  `prompts/migration.md`, a file that doesn't exist. It now uses the
  `SYSTEM_GOAL` prompt already defined in `prompts.ts`.
- `Workflow`, `Planner`, `Executor`, `State`, `History`, `checkpoint.ts`,
  `repository.ts` and the `/plan`, `/migrate`, `/status`, `/reset` commands
  in `commands.ts` were all written but never connected to the running
  agent — it was really just a plain chat loop. They're now wired together
  end to end.
- `Executor.execute()` never returned the model's answer, so nothing could
  be logged to history. Fixed.
- `package.json` had a `start` script pointing at `dist/index.js` but no
  `build` script and no `tsconfig.json`, so a production build was
  impossible. Both are now included.
- **Path layout bug:** the agent lives in `/agent`, while `/frontend`,
  `/backend`, and `/legacy` are siblings of it, not children. Two things
  assumed otherwise: `repository.ts` was checking for
  `frontend`/`backend`/`legacy` relative to the agent's own working
  directory (so it always reported them "missing"), and — more
  importantly — the Copilot session's `workingDirectory` was set to the
  agent's own folder, meaning the model's file-editing tools could never
  actually reach `/frontend`, `/backend`, or `/legacy` at all. Both now
  use a shared `PROJECT_ROOT` (the parent of `/agent`, i.e. wherever
  `/agent`, `/frontend`, `/backend`, `/legacy` all live side by side).

- **Fixed a hang on long tasks:** the SDK's `sendAndWait()` has a flat 60s
  timeout that doesn't reset while the assistant is actively working - a
  task like "read every file in /legacy" easily takes longer than that,
  threw an uncaught error, and killed the whole input loop (so the CLI
  looked hung and stopped responding even to `/status`). `chat.ts` now
  drives the session itself with an inactivity timeout that resets on
  every event, and every command is wrapped so one failure just prints an
  error and re-prompts instead of taking the whole process down. A failed
  task is not marked complete, so running `/migrate` again simply retries it.

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
