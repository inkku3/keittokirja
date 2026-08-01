import { useState } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';

interface RandomRecipeButtonProps {
  className?: string;
  id?: string;
  onRecipeSelected?: (recipe: Recipe) => void;
}

export function RandomRecipeButton({
  className = 'random-recipe',
  id = 'randomRecipe',
  onRecipeSelected,
}: RandomRecipeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const recipe = await recipeAPI.getRandom();
      onRecipeSelected?.(recipe);
      
      // If no callback, navigate directly
      if (!onRecipeSelected) {
        window.location.href = `/recipe/${recipe.id}`;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reseptiä ei voitu ladata';
      setError(message);
      console.error('Failed to get random recipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className={className}
        id={id}
        type="button"
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? 'Ladataan...' : 'Yllätysresepti'}
      </button>
      {error && <div className="error-message">{error}</div>}
    </>
  );
}
