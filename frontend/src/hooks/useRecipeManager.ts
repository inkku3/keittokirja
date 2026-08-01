import { useState, useEffect } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';
import { useSortFilterState } from '../hooks/useSortFilterState';
import { useDarkMode } from '../hooks/useDarkMode';

interface RecipeManagerProps {
  onRecipesUpdate?: (recipes: Recipe[]) => void;
  onStateChange?: (state: any) => void;
}

export function useRecipeManager(props?: RecipeManagerProps) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const sortFilter = useSortFilterState(allRecipes);
  const darkMode = useDarkMode();

  // Load all recipes on mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        sortFilter.setLoading(true);
        const recipes = await recipeAPI.listAll('title', 'asc');
        setAllRecipes(recipes);
        sortFilter.updateRecipes(recipes);
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Failed to load recipes:', error);
        sortFilter.setError('Reseptien lataaminen epäonnistui');
      } finally {
        sortFilter.setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  useEffect(() => {
    props?.onRecipesUpdate?.(sortFilter.state.filteredRecipes);
    props?.onStateChange?.(sortFilter.state);
  }, [sortFilter.state, props]);

  const handleSearch = async (query: string) => {
    sortFilter.updateSearchQuery(query);
  };

  const handleFilterChange = async (tags: string[]) => {
    sortFilter.updateSelectedTags(tags);
  };

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    sortFilter.updateSort(field, order);
  };

  const handleRandomRecipe = async () => {
    try {
      const recipe = await recipeAPI.getRandom();
      return recipe;
    } catch (error) {
      console.error('Failed to get random recipe:', error);
      throw error;
    }
  };

  return {
    // State
    recipes: sortFilter.state.recipes,
    filteredRecipes: sortFilter.state.filteredRecipes,
    isLoading: sortFilter.state.isLoading,
    error: sortFilter.state.error,
    sort: sortFilter.state.sort,
    filters: sortFilter.state.filters,
    isDarkMode: darkMode.isDarkMode,
    initialLoadComplete,

    // Actions
    updateSearchQuery: handleSearch,
    updateFilters: handleFilterChange,
    updateSort: handleSort,
    getRandomRecipe: handleRandomRecipe,
    toggleDarkMode: darkMode.toggleDarkMode,
    clearFilters: sortFilter.clearFilters,

    // Raw state objects
    sortFilterState: sortFilter,
    darkModeState: darkMode,
  };
}
