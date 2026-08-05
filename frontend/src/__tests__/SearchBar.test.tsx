import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, Mock } from 'vitest';

vi.mock('../api/recipes', () => ({
  recipeAPI: {
    search: vi.fn(),
  },
}));

import { recipeAPI } from '../api/recipes';
import { SearchBar } from '../components/Search'; // ← updated path

describe('SearchBar', () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  test('typing triggers API call with query', async () => {
    (recipeAPI.search as Mock).mockResolvedValueOnce([]); // initial load
    (recipeAPI.search as Mock).mockResolvedValueOnce([
      { id: 'x', title: 'Xray', tags: '', ingredients: '', instructions: '', created_at: '', updated_at: '' },
    ]);

    render(<SearchBar />);

    // wait initial load
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    (recipeAPI.search as Mock).mockClear();

    const input = document.getElementById('search') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'x' } }); });

    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    const lastCall = (recipeAPI.search as Mock).mock.calls.slice(-1)[0];
    expect(lastCall[0]).toBe('x');
    await waitFor(() => expect(screen.getAllByText((_, el) => el?.textContent === 'Xray')[0]).toBeInTheDocument());
  });

  test('clearing input hides results and does not call API', async () => {
    (recipeAPI.search as Mock).mockResolvedValueOnce([]); // initial
    (recipeAPI.search as Mock).mockResolvedValueOnce([
      { id: 'y', title: 'Yam', tags: '', ingredients: '', instructions: '', created_at: '', updated_at: '' },
    ]);

    render(<SearchBar />);
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    (recipeAPI.search as Mock).mockClear();

    const input = document.getElementById('search') as HTMLInputElement;
    // type to trigger search
    await act(async () => { fireEvent.change(input, { target: { value: 'y' } }); });
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());

    // clear
    fireEvent.change(input, { target: { value: '' } });
    // should hide results and not call API for empty
    expect(screen.queryByText('Yam')).toBeNull();
  });

  test('logs error on network failure and does not crash', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (recipeAPI.search as Mock).mockResolvedValueOnce([]); // initial
    (recipeAPI.search as Mock).mockRejectedValueOnce(new Error('Network fail'));

    render(<SearchBar />);
    await waitFor(() => expect(recipeAPI.search).toHaveBeenCalled());
    (recipeAPI.search as Mock).mockClear();

    const input = document.getElementById('search') as HTMLInputElement;
    await act(async () => { fireEvent.change(input, { target: { value: 'z' } }); });

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });
});
