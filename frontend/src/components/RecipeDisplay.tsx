import React from 'react';
import type { Recipe } from '../api/recipes';
import { useImageLoader } from '../hooks/useImageLoader';
import { recipeImageCandidates } from '../config/images';

// ----- RecipeTitle -----
export function RecipeTitle({ title, className = 'title' }: { title: string; className?: string }) {
    return <div id="header" className={className}>{title}</div>;
}

// ----- RecipeInfo -----
export function RecipeInfo({ info, className = 'info' }: { info: string; className?: string }) {
    if (!info) return null;
    return <div id="info" className={className}>{info}</div>;
}

// ----- RecipeIngredients -----
export function RecipeIngredients({
    ingredients,
    className = 'ingredients',
    title = 'Ainesosat',
}: {
    ingredients: string;
    className?: string;
    title?: string;
}) {
    if (!ingredients) return null;
    return (
        <div id="ingredients" className={className}>
        {title && <h3>{title}</h3>}
        <pre>{ingredients}</pre>
        </div>
    );
}

// ----- RecipeInstructions -----
export function RecipeInstructions({
    instructions,
    className = 'instructions',
    title = 'Ohjeet',
}: {
    instructions: string;
    className?: string;
    title?: string;
}) {
    if (!instructions) return null;
    return (
        <div id="instructions" className={className}>
        {title && <h3>{title}</h3>}
        <pre>{instructions}</pre>
        </div>
    );
}

// ----- RecipeContentDisplay -----
export function RecipeContentDisplay({
    recipe,
    showTitle = true,
    showInfo = true,
    showIngredients = true,
    showInstructions = true,
    ingredientsTitle = 'Ainesosat',
    instructionsTitle = 'Ohjeet',
}: {
    recipe: Recipe;
    showTitle?: boolean;
    showInfo?: boolean;
    showIngredients?: boolean;
    showInstructions?: boolean;
    ingredientsTitle?: string;
    instructionsTitle?: string;
}) {
    return (
        <>
        {showTitle && <RecipeTitle title={recipe.title} />}
        {showInfo && recipe.info && <RecipeInfo info={recipe.info} />}
        <div className="content-container">
        {showIngredients && <RecipeIngredients ingredients={recipe.ingredients} title={ingredientsTitle} />}
        {showInstructions && <RecipeInstructions instructions={recipe.instructions} title={instructionsTitle} />}
        </div>
        </>
    );
}

// ----- RecipeImage (simple fallback, still used standalone/in tests) -----
export function RecipeImage({
    recipeId,
    title,
    imagePath,
}: {
    recipeId: string;
    title: string;
    imagePath?: string;
}) {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [hasError, setHasError] = React.useState(false);

    const imageSources = recipeImageCandidates(recipeId, imagePath);

    const handleImageError = () => {
        const nextIndex = currentImageIndex + 1;
        if (nextIndex < imageSources.length) {
            setCurrentImageIndex(nextIndex);
        } else {
            setHasError(true);
        }
    };

    if (hasError) return null;

    return (
        <div className="image-container">
        <img
        className="foodpic"
        id="image"
        src={imageSources[currentImageIndex]}
        alt={title}
        onError={handleImageError}
        />
        </div>
    );
}

// ----- ResponsiveRecipeImage (with useImageLoader) -----
// Used by RecipeDetail. Reserves a fixed aspect-ratio box (see global.css
// .image-container) so nothing shifts size when the image finishes loading —
// this is what fixes the load-time layout jitter. The image fades in via the
// "is-loaded" class rather than popping in abruptly.
export function ResponsiveRecipeImage({
    recipeId,
    title,
    imagePath,
    className = 'foodpic',
}: {
    recipeId: string;
    title: string;
    imagePath?: string;
    className?: string;
}) {
    const { currentImageSrc, isLoading, hasError, handleImageLoad, handleImageError } = useImageLoader({
        sources: recipeImageCandidates(recipeId, imagePath),
    });

    if (hasError) return null;

    return (
        <div className="image-container">
        <img
        className={isLoading ? className : `${className} is-loaded`}
        id="image"
        src={currentImageSrc ?? undefined}
        alt={title}
        onLoad={handleImageLoad}
        onError={handleImageError}
        />
        </div>
    );
}

// ----- RecipeDetail -----
export function RecipeDetail({ recipe }: { recipe: Recipe }) {
    return (
        <div className="recipe">
        <ResponsiveRecipeImage recipeId={recipe.id} title={recipe.title} imagePath={recipe.image_path} />
        <RecipeTitle title={recipe.title} />
        <RecipeInfo info={recipe.info || ''} />
        <div className="content-container">
        <RecipeIngredients ingredients={recipe.ingredients} />
        <RecipeInstructions instructions={recipe.instructions} />
        </div>
        </div>
    );
}
