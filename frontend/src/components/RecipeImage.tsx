import { useState } from 'react';

interface RecipeImageProps {
  recipeId: string;
  title: string;
  imagePath?: string;
  fallbackImage?: string;
}

export function RecipeImage({
  recipeId,
  title,
  imagePath,
}: RecipeImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Try multiple image formats; hide image if all fail
  const imageSources = [
    imagePath,
    `recipes/img/${recipeId}.png`,
    `recipes/img/${recipeId}.jpg`,
    `recipes/img/${recipeId}.jpeg`,
  ].filter(Boolean);

  const handleImageError = () => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < imageSources.length) {
      setCurrentImageIndex(nextIndex);
    } else {
      // All sources failed, hide image
      setHasError(true);
    }
  };

  if (hasError) {
    return null;
  }

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

