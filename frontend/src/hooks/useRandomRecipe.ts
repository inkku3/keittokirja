import { useState, useCallback } from 'react';
import { recipeAPI, Recipe } from '../api/recipes';

export function useRandomRecipe() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRandomRecipe = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const randomRecipe = await recipeAPI.getRandom();
      setRecipe(randomRecipe);
      return randomRecipe;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Reseptiä ei voitu ladata';
      setError(message);
      console.error('Failed to get random recipe:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const navigate = useCallback((recipe: Recipe) => {
    window.location.href = `/recipe/${recipe.id}`;
  }, []);

  const getAndNavigate = useCallback(async () => {
    try {
      const randomRecipe = await getRandomRecipe();
      navigate(randomRecipe);
    } catch (err) {
      console.error('Failed to get and navigate to random recipe:', err);
    }
  }, [getRandomRecipe, navigate]);

  return {
    recipe,
    isLoading,
    error,
    getRandomRecipe,
    navigate,
    getAndNavigate,
  };
}
