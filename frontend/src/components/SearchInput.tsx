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
        setResults(searchResults);
        onResultsChange?.(searchResults, true);
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
