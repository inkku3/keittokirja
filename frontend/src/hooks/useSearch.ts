import { useEffect, useRef, useState } from 'react';
import { recipeAPI } from '../api/recipes';
import type { LegacySearchItem } from '../api/recipes';

export function useSearch() {
  const [results, setResults] = useState<LegacySearchItem[]>([]);
  const [query, setQueryState] = useState('');
  const [tags, setTagsState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the initial full list to show on mount (legacy displayed full list initially)
  const initialLoaded = useRef(false);
  const initialResults = useRef<LegacySearchItem[]>([]);

  // Abort controller for cancelling in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  // Track whether user has interacted (typing). Legacy hides list when input is empty after interaction.
  const hasInteracted = useRef(false);

  useEffect(() => {
    let mounted = true;
    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await recipeAPI.search({}, undefined);
        if (!mounted) return;
        initialResults.current = items;
        initialLoaded.current = true;
        // Show initial list until user interacts
        setResults(items);
      } catch (err: any) {
        console.error('Failed to load initial search list', err);
        setError('Reseptien lataaminen epäonnistui');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadInitial();

    return () => {
      mounted = false;
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch (_) {}
        abortRef.current = null;
      }
    };
  }, []);

  const setQuery = (q: string) => {
    hasInteracted.current = true;
    setQueryState(q);

    // If query is empty after user interaction, legacy hides the list — clear results
    if (!q) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      // cancel in-flight
      if (abortRef.current) {
        try { abortRef.current.abort(); } catch (_) {}
        abortRef.current = null;
      }
      return;
    }

    // perform search immediately (legacy has no debounce)
    doSearch(q, tags);
  };

  const setTags = (t: string) => {
    setTagsState(t);
    // If user has interacted with search query, re-run search with new tags
    if (hasInteracted.current) {
      // if query is empty, legacy would keep list hidden — don't run
      if (!query) return;
      doSearch(query, t);
    }
  };

  const doSearch = async (q: string, t: string) => {
    // Cancel previous
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch (_) {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const items = await recipeAPI.search({ q, tags: t }, controller.signal);
      setResults(items);
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') {
        // Request was aborted — ignore
        return;
      }
      console.error('Search request failed', err);
      setError('Hakutulos epäonnistui');
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  return {
    results,
    query,
    setQuery,
    tags,
    setTags,
    isLoading,
    error,
  } as const;
}
