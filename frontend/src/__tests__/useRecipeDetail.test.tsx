import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock the API client used by the hook
jest.mock('../api/recipes', () => ({
  recipeAPI: {
    getById: jest.fn(),
  },
}));

import { recipeAPI } from '../api/recipes';
import { useRecipeDetail } from '../hooks/useRecipeDetail';

function TestHarness({ id }: { id?: string }) {
  const { recipe, isLoading, error, notFound } = useRecipeDetail({ recipeId: id });
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="notfound">{notFound ? 'notfound' : ''}</div>
      <div data-testid="error">{error || ''}</div>
      <div data-testid="title">{recipe ? recipe.title : ''}</div>
    </div>
  );
}

describe('useRecipeDetail hook', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('loads recipe and updates title and document.title', async () => {
    (recipeAPI.getById as jest.Mock).mockResolvedValueOnce({
      id: 'r1',
      title: 'Pancake',
      ingredients: 'Flour\nEggs',
      instructions: 'Mix and fry',
      info: 'Serves 2',
      image_path: '/recipes/img/r1.png',
    });

    render(<TestHarness id="r1" />);

    // initially loading
    expect(screen.getByTestId('loading').textContent).toBe('loading');

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('idle'));
    expect(screen.getByTestId('title').textContent).toBe('Pancake');
    expect(document.title).toBe('Pancake resepti');
  });

  test('sets notFound when API returns 404', async () => {
    const err: any = new Error('Not found');
    err.response = { status: 404 };
    (recipeAPI.getById as jest.Mock).mockRejectedValueOnce(err);

    render(<TestHarness id="doesnotexist" />);

    await waitFor(() => expect(screen.getByTestId('notfound').textContent).toBe('notfound'));
  });

  test('sets error and logs on network failure', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (recipeAPI.getById as jest.Mock).mockRejectedValueOnce(new Error('Network fail'));

    render(<TestHarness id="netfail" />);

    await waitFor(() => expect(screen.getByTestId('error').textContent).toMatch(/Reseptin lataus epäonnistui/));
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('handles malformed data without crashing', async () => {
    // return object missing required fields
    (recipeAPI.getById as jest.Mock).mockResolvedValueOnce({ id: 'bad', title: null });

    render(<TestHarness id="bad" />);

    await waitFor(() => expect(screen.getByTestId('error').textContent).toMatch(/Reseptin tiedot ovat virheelliset/));
  });
});
