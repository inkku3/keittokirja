import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeImage } from '../components/RecipeImage';

describe('RecipeImage', () => {
  test('uses provided image_path first and falls back through candidates then hides image', () => {
    render(<RecipeImage recipeId="r2" title="Toast" imagePath={"/custom/toast.png"} fallbackImage={'/fallback.png'} />);

    const img = screen.getByAltText('Toast') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    // Initially should use provided imagePath
    expect(img.src).toContain('/custom/toast.png');

    // Simulate error -> should try next candidate
    fireEvent.error(img);
    // Next candidate is recipes/img/r2.png
    expect(img.src).toContain('recipes/img/r2.png');

    // Simulate error -> recipes/img/r2.jpg
    fireEvent.error(img);
    expect(img.src).toContain('recipes/img/r2.jpg');

    // Simulate error -> recipes/img/r2.jpeg
    fireEvent.error(img);
    expect(img.src).toContain('recipes/img/r2.jpeg');

    // Simulate error -> fallback
    fireEvent.error(img);
    expect(img.src).toContain('/fallback.png');

    // Simulate final error -> component should hide image (null)
    fireEvent.error(img);
    // After final error, image should no longer be in the document
    expect(screen.queryByAltText('Toast')).toBeNull();
  });

  test('constructs candidate list when imagePath is undefined', () => {
    render(<RecipeImage recipeId="r3" title="Salad" />);
    const img = screen.getByAltText('Salad') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    // First candidate in absence of imagePath should be recipes/img/{id}.png
    expect(img.src).toContain('recipes/img/r3.png');
  });
});
