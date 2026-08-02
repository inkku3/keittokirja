import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

    await waitFor(() => expect(screen.getByText('Initial')).toBeInTheDocument());

    // type a query
    const q = screen.getByTestId('query');
    await act(async () => userEvent.type(q, 'm'));

    // recipeAPI.search should be called for the query
    await waitFor(() => expect((recipeAPI.search as jest.Mock)).toHaveBeenCalled());
    // ensure last call contained the query
    const lastCall = (recipeAPI.search as jest.Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0]).toMatchObject(expect.objectContaining({ q: 'm' }));

    // clear the query
    await act(async () => userEvent.clear(q));

    // after clearing (user has interacted), results should be hidden (empty list)
    expect(screen.queryByText('Match')).toBeNull();
  });

  test('setTags triggers search when user has interacted and query present', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]); // initial
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'Filtered', url: 'recipes/5' },
    ]);

    render(<TestHarness />);

    await waitFor(() => expect((recipeAPI.search as jest.Mock)).toHaveBeenCalled());

    const q = screen.getByTestId('query');
    // simulate user typing so hasInteracted becomes true
    await act(async () => userEvent.type(q, 'a'));

    const tags = screen.getByTestId('tags');
    await act(async () => userEvent.type(tags, 'chicken'));

    await waitFor(() => expect((recipeAPI.search as jest.Mock)).toHaveBeenCalled());
    // last call should include the tags value
    expect((recipeAPI.search as jest.Mock).mock.calls.slice(-1)[0][0]).toMatchObject({ q: 'a', tags: 'chicken' });

    expect(screen.getByText('Filtered')).toBeInTheDocument();
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
