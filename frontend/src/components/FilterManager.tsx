import { useState, useCallback } from 'react';
import { recipeAPI, Recipe } from '../api/recipes';
import { FilterDropdown } from './FilterDropdown';

interface FilterManagerProps {
  onResultsChange?: (recipes: Recipe[], activeFilters: string[]) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function FilterManager({
  onResultsChange,
  isOpen = false,
  onToggle,
}: FilterManagerProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = useCallback(
    async (newFilters: string[]) => {
      setSelectedFilters(newFilters);
      setIsLoading(true);

      try {
        let results: Recipe[];

        if (newFilters.length === 0) {
          // If no filters selected, get all recipes
          results = await recipeAPI.listAll('title', 'asc');
        } else {
          // Filter by tags - API expects comma-separated tags
          results = await recipeAPI.filterByTags(newFilters.join(','));
        }

        onResultsChange?.(results, newFilters);
      } catch (error) {
        console.error('Failed to filter recipes:', error);
        onResultsChange?.([], newFilters);
      } finally {
        setIsLoading(false);
      }
    },
    [onResultsChange]
  );

  return (
    <FilterDropdown
      onFilterChange={handleFilterChange}
      isOpen={isOpen}
      onToggle={onToggle}
    />
  );
}
