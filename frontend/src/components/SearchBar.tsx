import { useState, useCallback } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';
import HighlightedText from './HighlightedText';

interface SearchBarProps {
  placeholder?: string;
  onSearchResults?: (recipes: Recipe[]) => void;
  onTermChange?: (term: string) => void;
  allRecipes?: Recipe[];
}

export function SearchBar({
  placeholder = "Etsi reseptejä...",
  onSearchResults,
  onTermChange,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);
    onTermChange?.(query);

    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      onSearchResults?.([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchResults = await recipeAPI.search(query);
      setResults(searchResults);
      setShowResults(true);
      onSearchResults?.(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
      onSearchResults?.([]);
    } finally {
      setIsLoading(false);
    }
  }, [onSearchResults, onTermChange]);

  const handleResultClick = (recipe: Recipe) => {
    setSearchTerm('');
    onTermChange?.('');
    setResults([]);
    setShowResults(false);
    window.location.href = `/recipe/${recipe.id}`;
  };

  return (
    <div className="search-wrapper">
      <div className="search-container">
        <input
          id="search"
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={isLoading}
        />
      </div>
      {showResults && (
        <div className="recipelist" id="recipes">
          {isLoading ? (
            <div>Etsitään...</div>
          ) : results.length === 0 ? (
            <div>Ei tuloksia</div>
          ) : (
            results.map((recipe) => (
              <div key={recipe.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleResultClick(recipe);
                  }}
                >
                  <HighlightedText text={recipe.title} query={searchTerm} />
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

