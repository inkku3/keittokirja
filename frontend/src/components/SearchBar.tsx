import { useState, useCallback, useEffect } from 'react';
import { recipeAPI, Recipe } from '../api/recipes';

interface SearchBarProps {
  placeholder?: string;
  onSearchResults?: (recipes: Recipe[]) => void;
  allRecipes?: Recipe[];
}

export function SearchBar({
  placeholder = "Etsi reseptejä...",
  onSearchResults,
  allRecipes = [],
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);

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
    } finally {
      setIsLoading(false);
    }
  }, [onSearchResults]);

  const handleResultClick = (recipe: Recipe) => {
    setSearchTerm('');
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
                  {recipe.title}
                </a>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

