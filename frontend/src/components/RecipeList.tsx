import { useEffect, useState } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe, LegacyListItem } from '../api/recipes';
import { HighlightedText } from './Search';

// ----- RecipeList (simple) -----
export function RecipeList({
    recipes,
    isLoading = false,
    emptyMessage = 'Ei reseptejä',
    onRecipeClick,
}: {
    recipes: Recipe[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRecipeClick?: (recipe: Recipe) => void;
}) {
    if (isLoading) {
        return <div className="recipelist">Ladataan reseptejä...</div>;
    }
    if (recipes.length === 0) {
        return <div className="recipelist">{emptyMessage}</div>;
    }
    return (
        <div className="recipelist">
        {recipes.map((recipe) => (
            <div key={recipe.id}>
            <a
            href={`/recipe/${recipe.id}`}
            onClick={(e) => {
                if (onRecipeClick) {
                    e.preventDefault();
                    onRecipeClick(recipe);
                }
            }}
            >
            {recipe.title}
            </a>
            </div>
        ))}
        </div>
    );
}

// ----- RecipeListContainer (with sorting and highlighting) -----
export function RecipeListContainer({
    recipes = [],
    isVisible = true,
    isLoading = false,
    onRecipeClick,
    sortBy = 'title',
    sortOrder = 'asc',
    searchQuery = '',
}: {
    recipes?: Recipe[];
    isVisible?: boolean;
    isLoading?: boolean;
    onRecipeClick?: (recipe: Recipe) => void;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchQuery?: string;
}) {
    const [sortedRecipes, setSortedRecipes] = useState<Recipe[]>(recipes);

    useEffect(() => {
        let sorted = [...recipes];
        sorted.sort((a, b) => {
            let aVal = a[sortBy as keyof Recipe] || '';
            let bVal = b[sortBy as keyof Recipe] || '';
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = (bVal as string).toLowerCase();
        }
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
        });
        setSortedRecipes(sorted);
    }, [recipes, sortBy, sortOrder]);

    if (!isVisible) return null;

    return (
        <div className="recipelist" id="recipes">
        {isLoading ? (
            <div>Ladataan reseptejä...</div>
        ) : sortedRecipes.length === 0 ? (
            <div>Ei reseptejä</div>
        ) : (
            sortedRecipes.map((recipe) => (
                <div key={recipe.id}>
                <a
                href={`/recipe/${recipe.id}`}
                onClick={(e) => {
                    if (onRecipeClick) {
                        e.preventDefault();
                        onRecipeClick(recipe);
                    }
                }}
                >
                <span>
                {searchQuery ? (
                    <HighlightedText text={recipe.title} query={searchQuery} />
                ) : (
                    recipe.title
                )}
                </span>
                </a>
                </div>
            ))
        )}
        </div>
    );
}

// ----- FullRecipeList (fetches all) -----
export function FullRecipeList({
    showInitially = true,
    onRecipeSelect,
    recipes: externalRecipes,
    isLoading: externalLoading,
    searchQuery = '',
}: {
    showInitially?: boolean;
    onRecipeSelect?: (recipe: Recipe) => void;
    recipes?: Recipe[];
    isLoading?: boolean;
    searchQuery?: string;
}) {
    const [recipes, setRecipes] = useState<Recipe[]>(externalRecipes ?? []);
    const [isLoading, setIsLoading] = useState<boolean>(externalLoading ?? true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (externalRecipes !== undefined) {
            setRecipes(externalRecipes);
            setIsLoading(!!externalLoading);
            return;
        }

        const fetchRecipes = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await recipeAPI.listAll('title', 'asc');
                setRecipes(data);
            } catch (err) {
                console.error('Failed to fetch recipes:', err);
                setError('Reseptien lataaminen epäonnistui');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRecipes();
    }, [externalRecipes, externalLoading]);

    if (error) {
        return <div className="recipelist error">{error}</div>;
    }

    return (
        <RecipeListContainer
        recipes={recipes}
        isVisible={showInitially}
        isLoading={isLoading}
        onRecipeClick={onRecipeSelect}
        searchQuery={searchQuery}
        />
    );
}

// ----- LegacyRecipeList (legacy shape) -----
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
        sources.push(`/recipes/img/${idFromUrl}.png`);
        sources.push(`/recipes/img/${idFromUrl}.jpg`);
        sources.push(`/recipes/img/${idFromUrl}.jpeg`);
        return sources;
    };

    return (
        <div className="recipelist" id="recipes">
        {items.map((it) => {
            const sources = getImageSources(it);
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
