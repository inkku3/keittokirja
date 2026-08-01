import { useState, useCallback } from 'react';
import type { Recipe } from '../api/recipes';

export interface SortConfig {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterState {
  selectedTags: string[];
  searchQuery: string;
}

export interface RecipeViewState {
  recipes: Recipe[];
  filteredRecipes: Recipe[];
  sort: SortConfig;
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
}

export function useSortFilterState(initialRecipes: Recipe[] = []) {
  const [state, setState] = useState<RecipeViewState>({
    recipes: initialRecipes,
    filteredRecipes: initialRecipes,
    sort: { field: 'title', order: 'asc' },
    filters: { selectedTags: [], searchQuery: '' },
    isLoading: false,
    error: null,
  });

  const updateRecipes = useCallback((recipes: Recipe[]) => {
    setState((prev) => ({
      ...prev,
      recipes,
      filteredRecipes: applyFiltersAndSort(recipes, prev.filters, prev.sort),
    }));
  }, []);

  const updateSort = useCallback((field: string, order: 'asc' | 'desc') => {
    setState((prev) => {
      const newSort = { field, order };
      return {
        ...prev,
        sort: newSort,
        filteredRecipes: applyFiltersAndSort(
          prev.filteredRecipes,
          prev.filters,
          newSort
        ),
      };
    });
  }, []);

  const updateFilters = useCallback((filters: FilterState) => {
    setState((prev) => {
      const filtered = applyFiltersAndSort(prev.recipes, filters, prev.sort);
      return {
        ...prev,
        filters,
        filteredRecipes: filtered,
      };
    });
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setState((prev) => {
      const newFilters = { ...prev.filters, searchQuery: query };
      return {
        ...prev,
        filters: newFilters,
        filteredRecipes: applyFiltersAndSort(prev.recipes, newFilters, prev.sort),
      };
    });
  }, []);

  const updateSelectedTags = useCallback((tags: string[]) => {
    setState((prev) => {
      const newFilters = { ...prev.filters, selectedTags: tags };
      return {
        ...prev,
        filters: newFilters,
        filteredRecipes: applyFiltersAndSort(prev.recipes, newFilters, prev.sort),
      };
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const clearFilters = useCallback(() => {
    setState((prev) => {
      const clearedFilters = { selectedTags: [], searchQuery: '' };
      return {
        ...prev,
        filters: clearedFilters,
        filteredRecipes: applyFiltersAndSort(prev.recipes, clearedFilters, prev.sort),
      };
    });
  }, []);

  return {
    state,
    updateRecipes,
    updateSort,
    updateFilters,
    updateSearchQuery,
    updateSelectedTags,
    setLoading,
    setError,
    clearFilters,
  };
}

function applyFiltersAndSort(
  recipes: Recipe[],
  filters: FilterState,
  sort: SortConfig
): Recipe[] {
  let result = [...recipes];

  // Apply tag filters (AND logic - recipe must have all selected tags)
  if (filters.selectedTags.length > 0) {
    result = result.filter((recipe) => {
      if (!recipe.tags) return false;
      const recipeTags = recipe.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase());
      return filters.selectedTags.every((selectedTag) =>
        recipeTags.includes(selectedTag.toLowerCase())
      );
    });
  }

  // Apply search query filter
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter((recipe) =>
      recipe.title.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  result.sort((a, b) => {
    const aVal = a[sort.field as keyof Recipe] || '';
    const bVal = b[sort.field as keyof Recipe] || '';

    let aCompare = aVal;
    let bCompare = bVal;

    if (typeof aCompare === 'string') {
      aCompare = aCompare.toLowerCase();
      bCompare = (bCompare as string).toLowerCase();
    }

    if (aCompare < bCompare) return sort.order === 'asc' ? -1 : 1;
    if (aCompare > bCompare) return sort.order === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}
