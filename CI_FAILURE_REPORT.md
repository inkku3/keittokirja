# CI Failure Report — verified locally, 2026-08-02

This documents real failures found by running the actual build/test commands
locally, not from CI logs. Read this fully before touching anything. Do not
mark any related task as done, commit, or merge until every item below has
been independently re-verified by actually running the command — not by
reasoning about what "should" work.

## 1. Backend: dependencies not actually installed

Running `python -m pytest` (from `backend/`, `.venv` active) produces
`ModuleNotFoundError` for `fastapi` and `sqlalchemy` across 8 test files —
these are core dependencies, not edge cases. Investigate:

- Open `backend/requirements.txt`. Confirm `fastapi`, `sqlalchemy`, `pytest`,
  `psycopg2-binary`, and `pydantic` are all listed with version pins.
- If they ARE listed: run `pip install -r requirements.txt` fresh in a clean
  venv and paste the FULL output (not just the tail) — something is silently
  failing partway through and later packages aren't being reached.
- If they are NOT listed: this means requirements.txt was never kept in
  sync with what the code actually imports. Audit every `import` across
  `backend/` and ensure requirements.txt lists all of them.
- Known related issue already fixed: pydantic-core / psycopg2-binary needed
  upgrading for Python 3.14 compatibility (old pins failed to build wheels).
  Confirm requirements.txt now reflects the working versions
  (check `pip freeze` in the working venv and update pins accordingly).

Do not consider backend tests "passing" until `python -m pytest` completes
a full collection and run with a real pass/fail count — not an import error
that prevents collection entirely.

## 2. Frontend: `npm run build` fails with 14 TypeScript errors

Full error list (from `tsc -b`):

### Trivial (11 errors) — unused React imports
Remove `import React from 'react';` from these files (new JSX transform
doesn't require it, and `noUnusedLocals` is enabled):
- src/__tests__/RecipeDetail.test.tsx
- src/__tests__/RecipeImage.test.tsx
- src/__tests__/Search.test.tsx
- src/__tests__/SearchBar.test.tsx
- src/__tests__/darkmode.test.tsx
- src/__tests__/useRecipeDetail.test.tsx
- src/__tests__/useSearch.test.tsx
- src/components/Search.tsx

### Real bug — src/components/MenuContainer.tsx:12
const hamburgerRef = (React as any).useRef<HTMLDivElement | null>(null);
This casts React to `any` instead of importing `useRef` properly. Fix:
```ts
import { useRef } from 'react';
// ...
const hamburgerRef = useRef<HTMLDivElement | null>(null);
```
Do not just suppress the type error — this is broken code, not a type
annotation issue.

### Needs investigation, not a quick patch — src/components/Search.tsx:6
```ts
const { results, query, setQuery, tags, setTags, isLoading } = useSearch();
```
`tags` and `setTags` are destructured but never used in this component.
Before removing them: check whether tag-filtering UI is supposed to be
wired into this component and is simply missing/incomplete, versus this
being genuinely dead code left over from a refactor. Report back which it
is before making a change.

### Real data-shape bug — src/components/SearchInput.tsx:33-34
Type 'LegacySearchItem[]' is not assignable to type 'Recipe[]'.
LegacySearchItem is missing: id, title, ingredients, instructions, and 2 more.
`SearchInput.tsx` is passing raw legacy API response shapes where the app
expects normalized `Recipe` objects. Find the existing `coerceToRecipes()`
(or equivalent) function already used elsewhere (referenced in
`SearchBar.tsx`) and apply the same normalization here, OR identify why
this component bypasses it and centralize the conversion in one place
(e.g. in the API client itself) so it can't be skipped again.

## 3. Frontend: 3 failing tests, all async/act-related

`npm test` → 2 failed suites, 3 failed tests, out of 27 total. Common thread:
`console.error` warnings about state updates not wrapped in `act(...)`,
tracing to async `setResults`/`setIsLoading` calls in `useSearch.ts` (lines
131, 140) and `SearchBar.tsx` (line 105).

Failing tests:
- `SearchBar › typing triggers API call with query` — mocked search never
  called (0 invocations expected ≥1). Trace points to a fake-timers /
  debounce timing mismatch.
- `SearchBar › logs error on network failure and does not crash` — same
  root cause, error-path assertion times out.
- `useSearch hook › setTags triggers search when user has interacted and
  query present` — expected "Filtered" text never renders.

This is very likely a test-authoring gap (missing `await act(async () => {})`
around timer advances, or `jest.advanceTimersByTimeAsync` needed instead of
the sync version) rather than a bug in the actual component behavior — but
confirm this by making the async flow actually complete in the test, not by
suppressing the act() warnings.

## Ground rules for this pass

1. Fix items in this order: backend deps → trivial frontend import cleanup →
   MenuContainer real bug → Search.tsx investigation → SearchInput type
   coercion → async test fixes.
2. After each fix, actually run the relevant command (`python -m pytest`,
   `npm run build`, `npm test`) and paste the real output before moving to
   the next item or claiming anything is "done."
3. Do not commit or merge anything until `npm run build`, `npm test`, and
   `python -m pytest` all pass cleanly, together, in one sitting.
4. Do not use `--legacy-peer-deps` or similar flags to silence errors as a
   permanent fix — only as a diagnostic stopgap, and flag it explicitly if
   used.
5. If you believe something is fixed, state exactly which command you ran
   and paste its exit output — a task is not complete on the basis of
   inspecting code and reasoning that it should work now.
