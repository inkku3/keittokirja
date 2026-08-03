import { useState, useCallback, useEffect, useRef } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';

// ----- HighlightedText -----
function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function HighlightedText({ text, query = '' }: { text: string; query?: string }) {
    if (!query) return <>{text}</>;
    const escaped = escapeRegExp(query);
    const regex = new RegExp(`(${escaped})`, 'ig');
    const parts = text.split(regex);
    return (
        <>
        {parts.map((part, i) =>
            regex.test(part) ? (
                <mark key={i} className="search-highlight">
                {part}
                </mark>
            ) : (
                <span key={i}>{part}</span>
            )
        )}
        </>
    );
}

// ----- SearchBar -----
export function SearchBar({
    placeholder = 'Etsi reseptejä...',
    debounceMs = 0,
    tags,
    onSearchResults,
    onTermChange,
}: {
    placeholder?: string;
    debounceMs?: number;
    tags?: string;
    onSearchResults?: (recipes: Recipe[]) => void;
    onTermChange?: (term: string) => void;
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const abortRef = useRef<AbortController | null>(null);
    const timerRef = useRef<number | null>(null);

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

    useEffect(() => {
        let mounted = true;
        const ac = new AbortController();
        abortRef.current = ac;

        (async () => {
            try {
                setInitialLoading(true);
                const data = await recipeAPI.search(undefined, tags, ac.signal);
                if (!mounted) return;
                const coerced = coerceToRecipes(data);
                setResults(coerced);
                setShowResults(true);
                onSearchResults?.(coerced);
            } catch (err: any) {
                if (err?.name === 'CanceledError' || err?.message === 'canceled') {
                    // ignore
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
    }, []);

    const doSearch = useCallback(
        async (query: string) => {
            if (abortRef.current) {
                try {
                    abortRef.current.abort();
                } catch {}
                abortRef.current = null;
            }

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
                setShowResults(Array.isArray(coerced) && coerced.length > 0);
                onSearchResults?.(coerced);
            } catch (err: any) {
                if (err?.name === 'CanceledError' || err?.message === 'canceled') {
                    // ignore
                } else {
                    console.error('Search failed:', err);
                    setResults([]);
                    setShowResults(false);
                    onSearchResults?.([]);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [onSearchResults, tags]
    );

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
