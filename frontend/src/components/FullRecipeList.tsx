import { useEffect, useState } from 'react';
import { recipeAPI, Recipe } from '../api/recipes';
import { RecipeListContainer } from './RecipeListContainer';

interface FullRecipeListProps {
  showInitially?: boolean;
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function FullRecipeList({
  showInitially = true,
  onRecipeSelect,
}: FullRecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await recipeAPI.listAll('title', 'asc');
        setRecipes(data);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
        setError('Reseptien lataaminen epäonnistui');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (error) {
    return <div className="recipelist error">{error}</div>;
  }

  return (
    <RecipeListContainer
      recipes={recipes}
      isVisible={showInitially}
      isLoading={isLoading}
      onRecipeClick={onRecipeSelect}
    />
  );
}
