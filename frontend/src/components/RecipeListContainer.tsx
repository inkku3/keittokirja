import { useEffect, useState } from 'react';
import { recipeAPI, Recipe } from '../api/recipes';

interface RecipeListContainerProps {
  recipes?: Recipe[];
  isVisible?: boolean;
  isLoading?: boolean;
  onRecipeClick?: (recipe: Recipe) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export function RecipeListContainer({
  recipes = [],
  isVisible = true,
  isLoading = false,
  onRecipeClick,
  sortBy = 'title',
  sortOrder = 'asc',
}: RecipeListContainerProps) {
  const [sortedRecipes, setSortedRecipes] = useState<Recipe[]>(recipes);

  useEffect(() => {
    let sorted = [...recipes];
    
    // Sort by field
    sorted.sort((a, b) => {
      let aVal = a[sortBy as keyof Recipe] || '';
      let bVal = b[sortBy as keyof Recipe] || '';
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedRecipes(sorted);
  }, [recipes, sortBy, sortOrder]);

  const handleRecipeClick = (recipe: Recipe) => {
    if (onRecipeClick) {
      onRecipeClick(recipe);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="recipelist" id="recipes">
      {isLoading ? (
        <div>Ladataan reseptejä...</div>
      ) : sortedRecipes.length === 0 ? (
        <div>Ei reseptejä</div>
      ) : (
        sortedRecipes.map((recipe) => (
          <div key={recipe.id}>
            <a
              href={`/recipe/${recipe.id}`}
              onClick={(e) => {
                if (onRecipeClick) {
                  e.preventDefault();
                  handleRecipeClick(recipe);
                }
              }}
            >
              {recipe.title}
            </a>
          </div>
        ))
      )}
    </div>
  );
}

