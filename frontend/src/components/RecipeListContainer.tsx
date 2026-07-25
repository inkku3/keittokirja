interface Recipe {
  id: string;
  name: string;
  url: string;
}

interface RecipeListContainerProps {
  recipes?: Recipe[];
  isVisible?: boolean;
}

export function RecipeListContainer({ 
  recipes = [],
  isVisible = false 
}: RecipeListContainerProps) {
  return (
    <div 
      className="recipelist" 
      id="recipes"
      style={{ display: isVisible ? 'flex' : 'none' }}
    >
      {recipes.map((recipe) => (
        <div key={recipe.id}>
          <a href={recipe.url}>{recipe.name}</a>
        </div>
      ))}
    </div>
  )
}
