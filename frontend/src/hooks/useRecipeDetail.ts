import { useEffect, useState } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';

interface UseRecipeDetailProps {
  recipeId?: string;
}

export function useRecipeDetail({ recipeId }: UseRecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setError('Reseptin ID puuttuu');
      setIsLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await recipeAPI.getById(recipeId);
        setRecipe(data);
        
        // Update page title
        document.title = `${data.title} resepti`;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Reseptiä ei voitu ladata';
        setError(`Reseptiä ei löytynyt: ${message}`);
        console.error('Failed to fetch recipe:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  return { recipe, isLoading, error };
}
