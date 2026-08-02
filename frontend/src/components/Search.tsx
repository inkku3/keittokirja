import { useSearch } from '../hooks/useSearch';
import { RandomRecipeButton } from './RandomRecipeButton';

export function Search() {
  const { results, query, setQuery, isLoading } = useSearch();

  const showList = Array.isArray(results) && results.length > 0;

  return (
    <div className="legacy-search">
      <div className="search-input">
        <input
          id="search"
          type="text"
          placeholder={isLoading ? 'Ladataan reseptejä...' : 'Etsi reseptejä...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <RandomRecipeButton id="randomRecipe" />
      </div>

      <div id="recipes" style={{ display: showList ? 'flex' : 'none' }}>
        {showList
          ? results.map((r) => (
              <div key={r.url}>
                <a href={r.url}>{r.name}</a>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
