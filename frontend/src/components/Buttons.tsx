import { useState } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';

// ----- DarkModeButton -----
export function DarkModeButton() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    return (
        <button
        className="toggleDark"
        id="toggleDark"
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
        {isDarkMode ? 'Vaalea tila' : 'Tumma tila'}
        </button>
    );
}

// ----- RandomRecipeButton -----
export function RandomRecipeButton({
    className = 'random-recipe',
    id = 'randomRecipe',
    onRecipeSelected,
}: {
    className?: string;
    id?: string;
    onRecipeSelected?: (recipe: Recipe) => void;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const recipe = await recipeAPI.getRandom();
            onRecipeSelected?.(recipe);
            if (!onRecipeSelected) {
                window.location.href = `/recipe/${recipe.id}`;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Reseptiä ei voitu ladata';
            setError(message);
            console.error('Failed to get random recipe:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <button
        className={className}
        id={id}
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        >
        {isLoading ? 'Ladataan...' : 'Yllätysresepti'}
        </button>
        {error && <div className="error-message">{error}</div>}
        </>
    );
}

// ----- ActionButtons -----
export function ActionButtons({ onRandomClick }: { onRandomClick?: () => void }) {
    return (
        <div className="buttons">
        <DarkModeButton />
        <RandomRecipeButton onRecipeSelected={() => onRandomClick?.()} />
        </div>
    );
}
