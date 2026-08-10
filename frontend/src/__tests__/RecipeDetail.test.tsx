import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../api/recipes', () => ({
  recipeAPI: {
    getById: vi.fn(),
  },
}));

import { recipeAPI } from '../api/recipes';
import { RecipeDetailPage } from '../pages/RecipeDetailPage';

describe('RecipeDetailPage', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });
  test('shows no placeholder while loading, then renders recipe details without a layout jump', async () => {
    (recipeAPI.getById as Mock).mockResolvedValueOnce({
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

    // Back button is present immediately...
    expect(screen.getByLabelText('Takaisin etusivulle')).toBeInTheDocument();
    // ...but no title/content placeholder is rendered while loading, so there's
    // nothing differently-sized for the real content to "jump" away from.
    expect(screen.queryByText('Pancake')).not.toBeInTheDocument();
    expect(document.querySelector('.recipe')).toHaveAttribute('aria-busy', 'true');

    await waitFor(() => expect(screen.getByText('Pancake')).toBeInTheDocument());
    expect(document.querySelector('.recipe')).not.toHaveAttribute('aria-busy');

    expect(screen.getByText(/Flour/)).toBeInTheDocument();
    expect(screen.getByText(/Mix and fry/)).toBeInTheDocument();

    const img = screen.getByAltText('Pancake') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/recipes/img/r1.png');
  });

  test('shows 404 UI when API returns 404', async () => {
    const err: any = new Error('Not found');
    err.response = { status: 404 };
    (recipeAPI.getById as Mock).mockRejectedValueOnce(err);

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
    (recipeAPI.getById as Mock).mockRejectedValueOnce(new Error('Network error'));

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
