import { useEffect, useState } from 'react';
import { recipeAPI } from '../api/recipes';
import type { LegacyListItem } from '../api/recipes';

/**
 * LegacyRecipeList
 * - Fetches GET /api/recipes/ (legacy list shape)
 * - Renders HTML structure identical to legacy/index.html:
 *   <div class="recipelist" id="recipes"> <div><a href="recipes/{id}">Name</a></div> ...</div>
 * - Uses same class names and IDs so existing styles apply without change.
 */
export function LegacyRecipeList() {
  const [items, setItems] = useState<LegacyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await recipeAPI.listLegacy();
        if (mounted) setItems(Array.isArray(data) ? data : []);
      } catch (err: any) {
        // Log and surface a friendly message without crashing the UI
        console.error('Failed to load legacy recipe list', err);
        if (mounted) {
          setError('Reseptien haku epäonnistui');
          setItems([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="recipelist" id="recipes">Ladataan reseptejä...</div>;
  }

  if (error) {
    return <div className="recipelist" id="recipes">{error}</div>;
  }

  if (!items || items.length === 0) {
    return <div className="recipelist" id="recipes">Ei reseptejä</div>;
  }

  const getImageSources = (it: LegacyListItem) => {
    const idFromUrl = it.url.replace(/^recipes\//, '');
    const normalized = (p?: string) => (p ? (p.startsWith('/') ? p : `/${p}`) : undefined);

    const sources: string[] = [];
    if (it.image_path) sources.push(normalized(it.image_path)!);
    // legacy fallback paths (no extension) — detail page will try extensions
    sources.push(`/recipes/img/${idFromUrl}.png`);
    sources.push(`/recipes/img/${idFromUrl}.jpg`);
    sources.push(`/recipes/img/${idFromUrl}.jpeg`);
    return sources;
  };

  return (
    <div className="recipelist" id="recipes">
      {items.map((it) => {
        const sources = getImageSources(it);
        // Expose primary and fallback sources as data attributes; this does not change visuals
        return (
          <div key={it.url}>
            <a href={it.url} data-image={sources[0]} data-image-fallbacks={JSON.stringify(sources.slice(1))}>
              {it.name}
            </a>
          </div>
        );
      })}
    </div>
  );
}

export default LegacyRecipeList;
