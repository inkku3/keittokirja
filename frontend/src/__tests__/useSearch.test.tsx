import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';

jest.mock('../api/recipes', () => ({
  recipeAPI: {
    search: jest.fn(),
  },
}));

import { recipeAPI } from '../api/recipes';
import { useSearch } from '../hooks/useSearch';

function TestHarness() {
  const { results, query, setQuery, tags, setTags, isLoading, error } = useSearch();
  return (
    <div>
    <div data-testid="loading">{isLoading ? 'loading' : 'idle'}</div>
    <div data-testid="error">{error ?? ''}</div>
    <input
    data-testid="query"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    />
    <input
    data-testid="tags"
    value={tags}
    onChange={(e) => setTags(e.target.value)}
    />
    <ul data-testid="results">
    {(results || []).map((r) => (
      <li key={(r as any).url ?? (r as any).id}>{(r as any).name ?? (r as any).title}</li>
    ))}
    </ul>
    </div>
  );
}

describe('useSearch hook', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test('initial load populates results and sets loading flags', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'One', url: 'recipes/1' },
      { name: 'Two', url: 'recipes/2' },
    ]);

    render(<TestHarness />);

    expect(screen.getByTestId('loading').textContent).toBe('loading');

    await waitFor(() => expect(screen.getByText('One')).toBeInTheDocument());

    expect(screen.getByTestId('loading').textContent).toBe('idle');
  });

  test('setQuery triggers search and clears results when emptied after interaction', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'Initial', url: 'recipes/0' },
    ]);
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'Match', url: 'recipes/9' },
    ]);

    render(<TestHarness />);

    // Wait for the initial mount-time load (call #1) to resolve and render.
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText('Initial')).toBeInTheDocument());

    // type a query — this should trigger a NEW (2nd) call, not just "any" call
    const q = screen.getByTestId('query');
    await act(async () => {
      fireEvent.change(q, { target: { value: 'm' } });
    });
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledTimes(2));

    // ensure last call contained the query
    const lastCall = (recipeAPI.search as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0]).toMatchObject(expect.objectContaining({ q: 'm' }));

    await waitFor(() => expect(screen.getByText('Match')).toBeInTheDocument());

    // clear the query
    await act(async () => {
      fireEvent.change(q, { target: { value: '' } });
    });

    // after clearing (user has interacted), results should be hidden (empty list)
    await waitFor(() => expect(screen.queryByText('Match')).toBeNull());
  });

  test('setTags triggers search when user has interacted and query present', async () => {
    // Call #1: initial mount-time load
    // Call #2: triggered by setQuery('a')
    // Call #3: triggered by setTags('chicken') — returns the filtered list
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]);
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]);
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'Filtered', url: 'recipes/5' },
    ]);

    render(<TestHarness />);

    // Wait for the initial load (call #1) specifically, not just "any call ever".
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledTimes(1));

    const q = screen.getByTestId('query');
    // simulate user typing so hasInteracted becomes true — this must produce call #2
    await act(async () => {
      fireEvent.change(q, { target: { value: 'a' } });
    });
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledTimes(2));

    const tags = screen.getByTestId('tags');
    // set full tags value in one change event to avoid multiple incremental searches
    await act(async () => {
      fireEvent.change(tags, { target: { value: 'chicken' } });
    });
    // This must be call #3 specifically — not a stale truthy check left over
    // from call #1 or #2, which was the root cause of the original flakiness.
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledTimes(3));
    await waitFor(() => expect(screen.getByText('Filtered')).toBeInTheDocument());

    // last call should include both the query and the tags value
    expect((recipeAPI.search as jest.Mock).mock.calls.slice(-1)[0][0]).toMatchObject({
      q: 'a',
      tags: 'chicken',
    });
  });

  test('error during search surfaces error state but does not throw', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (recipeAPI.search as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    render(<TestHarness />);

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    expect(screen.getByTestId('error').textContent).toContain('Reseptien lataaminen epäonnistui');

    consoleSpy.mockRestore();
  });
});
