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
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!recipeId) {
      setError('Reseptin ID puuttuu');
      setIsLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await recipeAPI.getById(recipeId);
        // Defensive validation of expected shape
        const valid = data && typeof data.title === 'string' && typeof data.ingredients === 'string' && typeof data.instructions === 'string';
        if (!valid) {
          console.error('Malformed recipe data received for id', recipeId, data);
          setError('Reseptin tiedot ovat virheelliset');
          setRecipe(null);
          setIsLoading(false);
          return;
        }

        setRecipe(data);
        
        // Update page title
        document.title = `${data.title} resepti`;
      } catch (err: any) {
        // Detect 404 from Axios-like error
        const status = err?.response?.status;
        if (status === 404) {
          setNotFound(true);
        } else {
          const message = err instanceof Error ? err.message : 'Reseptiä ei voitu ladata';
          setError(`Reseptin lataus epäonnistui: ${message}`);
          console.error('Failed to fetch recipe:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  return { recipe, isLoading, error, notFound };
}
