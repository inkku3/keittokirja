import type { Recipe } from '../api/recipes';

interface RecipeListProps {
  recipes: Recipe[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRecipeClick?: (recipe: Recipe) => void;
}

export function RecipeList({
  recipes,
  isLoading = false,
  emptyMessage = 'Ei reseptejä',
  onRecipeClick,
}: RecipeListProps) {
  if (isLoading) {
    return <div className="recipelist">Ladataan reseptejä...</div>;
  }

  if (recipes.length === 0) {
    return <div className="recipelist">{emptyMessage}</div>;
  }

  return (
    <div className="recipelist">
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <a
            href={`/recipe/${recipe.id}`}
            onClick={(e) => {
              if (onRecipeClick) {
                e.preventDefault();
                onRecipeClick(recipe);
              }
            }}
          >
            {recipe.title}
          </a>
        </div>
      ))}
    </div>
  );
}
