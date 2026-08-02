import { useState, useCallback, useEffect, useRef } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';
import HighlightedText from './HighlightedText';

interface SearchBarProps {
  placeholder?: string;
  debounceMs?: number; // default 0 to match legacy immediate behavior
  tags?: string; // optional comma-separated tags to include in search
  onSearchResults?: (recipes: Recipe[]) => void;
  onTermChange?: (term: string) => void;
}

export function SearchBar({
  placeholder = 'Etsi reseptejä...',
  debounceMs = 0,
  tags,
  onSearchResults,
  onTermChange,
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  // Load initial full list (legacy displays full list on load)
  const coerceToRecipes = (data: any[]): Recipe[] => {
    return (data || []).map((item) => {
      // If already full Recipe, return as-is (assert minimal fields)
      if (item && typeof item.id === 'string' && typeof item.title === 'string') {
        return item as Recipe;
      }
      // LegacySearchItem shape: { name, url }
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

  useEffect(() => {
    let mounted = true;
    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        // while loading, follow legacy placeholder/disabled behavior externally via initialLoading
        setInitialLoading(true);
        const data = await recipeAPI.search(undefined, tags, ac.signal);
        if (!mounted) return;
        const coerced = coerceToRecipes(data);
        setResults(coerced);
        setShowResults(true);
        onSearchResults?.(coerced);
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.message === 'canceled') {
          // aborted - ignore
        } else {
          console.error('Initial recipe load failed:', err);
        }
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();

    return () => {
      mounted = false;
      ac.abort();
    };
    // tags intentionally not in deps to avoid reloading initial list on tag changes here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSearch = useCallback(async (query: string) => {
    // cancel previous request
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
      abortRef.current = null;
    }

    // If empty, follow legacy: hide results and don't call API
    if (!query.trim()) {
      setResults([]);
      setShowResults(false);
      onSearchResults?.([]);
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    abortRef.current = ac;

    setIsLoading(true);
    try {
      const data = await recipeAPI.search(query, tags, ac.signal);
      const coerced = coerceToRecipes(data);
      setResults(coerced);
      // show only when there are results — legacy hides when filtered.length === 0
      setShowResults(Array.isArray(coerced) && coerced.length > 0);
      onSearchResults?.(coerced);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.message === 'canceled') {
        // request was aborted; no action
      } else {
        console.error('Search failed:', err);
        setResults([]);
        setShowResults(false);
        onSearchResults?.([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onSearchResults, tags]);

  const handleChange = (value: string) => {
    setSearchTerm(value);
    onTermChange?.(value);

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (debounceMs > 0) {
      timerRef.current = window.setTimeout(() => doSearch(value), debounceMs);
    } else {
      void doSearch(value);
    }
  };

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

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
          placeholder={initialLoading ? 'Ladataan reseptejä...' : placeholder}
          value={searchTerm}
          onChange={(e) => handleChange(e.target.value)}
          disabled={initialLoading}
        />
      </div>

      {/* Legacy expects #recipes container — create it but control display via showResults and length */}
      {showResults && (
        <div className="recipelist" id="recipes" style={{ display: showResults ? 'flex' : 'none' }}>
          {isLoading ? (
            <div>Ladataan...</div>
          ) : results.length === 0 ? null : (
            results.map((recipe) => (
              <div key={recipe.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleResultClick(recipe);
                  }}
                >
                  {/* Highlight matches if any */}
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

