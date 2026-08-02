import { useState, useEffect, useRef } from 'react';
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

  // Keyboard & focus management for legacy parity
  const recipeMenuRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const menu = recipeMenuRef.current;
    if (!menu) return;
    const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('a'));
    if (!links.length) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = links.findIndex((a) => a === active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = links[(currentIndex + 1) % links.length];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = links[(currentIndex - 1 + links.length) % links.length];
      prev.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      links[0].focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      links[links.length - 1].focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  // When results change, move focus to first item to mimic legacy behavior
  useEffect(() => {
    const menu = recipeMenuRef.current;
    if (!menu) return;
    const first = menu.querySelector<HTMLAnchorElement>('a');
    if (first) {
      // defer to ensure element is present in DOM
      setTimeout(() => first.focus(), 0);
    }
  }, [displayedRecipes.length]);

  return (
    <>
      {/* Filter Dropdown */}
      <FilterManager onResultsChange={handleFilterChange} />

      {/* Recipe Menu */}
      <div
        className="recipeMenu"
        id="recipeMenu"
        ref={recipeMenuRef}
        role="menu"
        aria-label="Reseptivalikko"
        onKeyDown={handleKeyDown}
      >
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
                role="menuitem"
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
