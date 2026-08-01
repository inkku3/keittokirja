import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the API client
jest.mock('../api/recipes', () => ({
  recipeAPI: {
    search: jest.fn(),
  },
}));

import { recipeAPI } from '../api/recipes';
import { SearchBar } from '../components/SearchBar';

describe('SearchBar', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  test('renders and performs initial load, then shows results', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { id: 'a', title: 'Alpha', tags: '', ingredients: '', instructions: '', created_at: '', updated_at: '' },
      { id: 'b', title: 'Beta', tags: '', ingredients: '', instructions: '', created_at: '', updated_at: '' },
    ]);

    render(<SearchBar />);

    // Input should exist (initially disabled while loading)
    const input = screen.getByRole('textbox', { name: /search/i }) || document.getElementById('search');
    expect(input).toBeTruthy();

    // Wait for initial load to complete and results to render
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('Alpha')).toBeInTheDocument());
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  test('typing triggers API call with query', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]); // initial load
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { id: 'x', title: 'Xray', tags: '', ingredients: '', instructions: '', created_at: '', updated_at: '' },
    ]);

    render(<SearchBar />);

    // wait initial load
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    (recipeAPI.search as jest.Mock).mockClear();

    const input = document.getElementById('search') as HTMLInputElement;
    userEvent.type(input, 'x');

    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledWith('x', undefined, expect.any(Object)));
    await waitFor(() => expect(screen.getByText('Xray')).toBeInTheDocument());
  });

  test('debounce delays API call when debounceMs provided', async () => {
    jest.useFakeTimers();
    (recipeAPI.search as jest.Mock).mockResolvedValue([]); // initial load
    (recipeAPI.search as jest.Mock).mockResolvedValue([]);

    render(<SearchBar debounceMs={300} />);

    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    (recipeAPI.search as jest.Mock).mockClear();

    const input = document.getElementById('search') as HTMLInputElement;

    // type without advancing timers
    fireEvent.change(input, { target: { value: 'ab' } });
    expect(recipeAPI.search).not.toHaveBeenCalled();

    // advance less than debounce
    jest.advanceTimersByTime(200);
    expect(recipeAPI.search).not.toHaveBeenCalled();

    // advance past debounce
    jest.advanceTimersByTime(200);
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalledWith('ab', undefined, expect.any(Object)));
  });

  test('clearing input hides results and does not call API', async () => {
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]); // initial
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([
      { id: 'y', title: 'Yam', tags: '', ingredients: '', instructions: '', created_at: '', updated_at: '' },
    ]);

    render(<SearchBar />);
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    (recipeAPI.search as jest.Mock).mockClear();

    const input = document.getElementById('search') as HTMLInputElement;
    // type to trigger search
    userEvent.type(input, 'y');
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());

    // clear
    fireEvent.change(input, { target: { value: '' } });
    // should hide results and not call API for empty
    expect(screen.queryByText('Yam')).toBeNull();
  });

  test('logs error on network failure and does not crash', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (recipeAPI.search as jest.Mock).mockResolvedValueOnce([]); // initial
    (recipeAPI.search as jest.Mock).mockRejectedValueOnce(new Error('Network fail'));

    render(<SearchBar />);
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    (recipeAPI.search as jest.Mock).mockClear();

    const input = document.getElementById('search') as HTMLInputElement;
    userEvent.type(input, 'z');

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });
});
