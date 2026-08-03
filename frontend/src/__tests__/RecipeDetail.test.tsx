import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

jest.mock('../api/recipes', () => ({
  recipeAPI: {
    getById: jest.fn(),
  },
}));

import { recipeAPI } from '../api/recipes';
import { RecipeDetailPage } from '../pages/RecipeDetailPage';

describe('RecipeDetailPage', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('shows loading then renders recipe details', async () => {
    (recipeAPI.getById as jest.Mock).mockResolvedValueOnce({
      id: 'r1',
      title: 'Pancake',
      ingredients: 'Flour\nEggs',
      instructions: 'Mix and fry',
      info: 'Serves 2',
      image_path: '/recipes/img/r1.png',
    });

    render(
      <MemoryRouter initialEntries={["/recipe/r1"]}>
        <Routes>
          <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Loading state present initially
    expect(screen.getByText('Loading')).toBeInTheDocument();

    // Wait for recipe title to appear
    await waitFor(() => expect(screen.getByText('Pancake')).toBeInTheDocument());

    // Check that ingredients and instructions are rendered
    expect(screen.getByText(/Flour/)).toBeInTheDocument();
    expect(screen.getByText(/Mix and fry/)).toBeInTheDocument();

    // Image should be present with provided src as alt text
    const img = screen.getByAltText('Pancake') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/recipes/img/r1.png');
  });

  test('shows 404 UI when API returns 404', async () => {
    const err: any = new Error('Not found');
    err.response = { status: 404 };
    (recipeAPI.getById as jest.Mock).mockRejectedValueOnce(err);

    render(
      <MemoryRouter initialEntries={["/recipe/notfound"]}>
        <Routes>
          <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the notFound UI
    await waitFor(() => expect(screen.getByText(/Could not load recipe/)).toBeInTheDocument());
  });

  test('shows friendly error and does not crash on network failure', async () => {
    (recipeAPI.getById as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={["/recipe/netfail"]}>
        <Routes>
          <Route path="/recipe/:recipeId" element={<RecipeDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Error UI shows "Virhe" title (as implemented) and a user-friendly message
    await waitFor(() => expect(screen.getByText('Virhe')).toBeInTheDocument());
    expect(screen.getByText(/Reseptin lataus epäonnistui/)).toBeInTheDocument();
  });
});
