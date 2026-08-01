import { useState } from 'react';
import type { Recipe } from '../api/recipes';
import { FilterManager } from './FilterManager';

interface MenuOverlayContentProps {
  onClose?: () => void;
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function MenuOverlayContent({
  onClose,
  onRecipeSelect,
}: MenuOverlayContentProps) {
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleFilterChange = (recipes: Recipe[], filters: string[]) => {
    setDisplayedRecipes(recipes);
    setSelectedFilters(filters);
  };

  const handleRecipeClick = (recipe: Recipe) => {
    onRecipeSelect?.(recipe);
    onClose?.();
  };

  return (
    <>
      {/* Filter Dropdown */}
      <FilterManager onResultsChange={handleFilterChange} />

      {/* Recipe Menu */}
      <div className="recipeMenu" id="recipeMenu">
        {displayedRecipes.length === 0 ? (
          <div>
            {selectedFilters.length > 0 ? 'Ei reseptejä valituilla suodattimilla' : 'Ei reseptejä'}
          </div>
        ) : (
          displayedRecipes.map((recipe) => (
            <div key={recipe.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleRecipeClick(recipe);
                }}
              >
                {recipe.title}
              </a>
            </div>
          ))
        )}
      </div>
    </>
  );
}
