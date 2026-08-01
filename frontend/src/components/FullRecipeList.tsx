import { useEffect, useState } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';
import { RecipeListContainer } from './RecipeListContainer';

interface FullRecipeListProps {
  showInitially?: boolean;
  onRecipeSelect?: (recipe: Recipe) => void;
  // If parent supplies recipes, use them instead of fetching
  recipes?: Recipe[];
  isLoading?: boolean;
  searchQuery?: string;
}

export function FullRecipeList({
  showInitially = true,
  onRecipeSelect,
  recipes: externalRecipes,
  isLoading: externalLoading,
  searchQuery = '',
}: FullRecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(externalRecipes ?? []);
  const [isLoading, setIsLoading] = useState<boolean>(externalLoading ?? true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If external recipes are provided, prefer them and skip fetching
    if (externalRecipes !== undefined) {
      setRecipes(externalRecipes);
      setIsLoading(!!externalLoading);
      return;
    }

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
  }, [externalRecipes, externalLoading]);

  if (error) {
    return <div className="recipelist error">{error}</div>;
  }

  return (
    <RecipeListContainer
      recipes={recipes}
      isVisible={showInitially}
      isLoading={isLoading}
      onRecipeClick={onRecipeSelect}
      searchQuery={searchQuery}
    />
  );
}
