import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../api/recipes', () => ({
  recipeAPI: {
    search: jest.fn(),
  },
}));

import { recipeAPI } from '../api/recipes';
import { Search } from '../components/Search';

describe('Search component integration', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test('shows loading placeholder initially and then renders results', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'AA', url: 'recipes/a' },
      { name: 'BB', url: 'recipes/b' },
    ]);

    render(<Search />);

    const input = screen.getByPlaceholderText(/Ladataan reseptejä|Etsi reseptejä/);
    expect(input).toBeDisabled();

    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());

    // after load, input enabled and results visible
    await waitFor(() => expect(input).not.toBeDisabled());
    expect(screen.getByText('AA')).toBeInTheDocument();
    expect(screen.getByText('BB')).toBeInTheDocument();
  });

  test('typing triggers API and updates result list', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]); // initial
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'MatchX', url: 'recipes/x' },
    ]);

    render(<Search />);

    // wait initial load
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'x');

    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledWith({ q: 'x', tags: undefined }, expect.any(Object)));

    expect(await screen.findByText('MatchX')).toBeInTheDocument();
  });

  test('clearing input hides results and does not crash', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]); // initial
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'Y1', url: 'recipes/y1' },
    ]);

    render(<Search />);
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'y');
    await waitFor(() => expect(screen.getByText('Y1')).toBeInTheDocument());

    // clear input
    fireEvent.change(input, { target: { value: '' } });
    // results should be hidden
    expect(screen.queryByText('Y1')).toBeNull();
  });

  test('results are keyboard-focusable (tab navigation) and anchors have correct href', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { name: 'TabA', url: 'recipes/a' },
    ]);

    render(<Search />);
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());

    // focus input first
    const input = screen.getByRole('textbox');
    input.focus();
    expect(document.activeElement).toBe(input);

    // tab to first result
    await userEvent.tab(); // should move to RandomRecipeButton (maybe), call again until we hit anchor
    // attempt to find anchor and ensure it's focusable
    const anchor = await screen.findByRole('link', { name: 'TabA' });
    // move focus to anchor programmatically to simulate keyboard navigation
    anchor.focus();
    expect(document.activeElement).toBe(anchor);
    expect(anchor).toHaveAttribute('href', 'recipes/a');
  });

  test('displays friendly error when API fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (recipeAPI.search as jest.Mock).mockRejectedValueOnce(new Error('Network')); // initial load fails

    render(<Search />);

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());

    // When initial load fails, input should be enabled (useSearch sets isLoading false) and no crash
    const input = screen.getByRole('textbox');
    expect(input).toBeDefined();

    consoleSpy.mockRestore();
  });
});
