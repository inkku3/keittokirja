import { useState, useCallback } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';

interface SearchInputProps {
  placeholder?: string;
  onResultsChange?: (recipes: Recipe[], hasSearchTerm: boolean) => void;
  disabled?: boolean;
}

export function SearchInput({
  placeholder = "Etsi reseptejä...",
  onResultsChange,
  disabled = false,
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const coerceToRecipes = (data: any[]): Recipe[] => {
    return (data || []).map((item) => {
      if (item && typeof item.id === 'string' && typeof item.title === 'string') {
        return item as Recipe;
      }
      const idMatch = typeof item?.url === 'string' ? item.url.replace(/^recipes\//, '') : undefined;
      return {
        id: idMatch ?? String(item?.id ?? ''),
        title: item?.name ?? item?.title ?? '',
        ingredients: item?.ingredients ?? '',
        instructions: item?.instructions ?? '',
        created_at: item?.created_at ?? '',
        updated_at: item?.updated_at ?? '',
      } as Recipe;
    });
  };

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchTerm(query);

      if (!query.trim()) {
        setResults([]);
        onResultsChange?.([], false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await recipeAPI.search(query);
        const coerced = coerceToRecipes(searchResults);
        setResults(coerced);
        onResultsChange?.(coerced, true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        onResultsChange?.([], true);
      } finally {
        setIsLoading(false);
      }
    },
    [onResultsChange]
  );


  return (
    <div className="search-wrapper">
      <div className="search-container">
        <input
          id="search"
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={disabled || isLoading}
        />
      </div>
      {searchTerm && (
        <div className="recipelist">
          {isLoading ? (
            <div>Etsitään...</div>
          ) : results.length === 0 ? (
            <div>Ei tuloksia</div>
          ) : (
            results.map((recipe) => (
              <div key={recipe.id}>
                <a href={`/recipe/${recipe.id}`}>{recipe.title}</a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
