import { useImageLoader } from '../hooks/useImageLoader';

interface ResponsiveRecipeImageProps {
  recipeId: string;
  title: string;
  imagePath?: string;
  fallbackImage?: string;
  className?: string;
  showPlaceholder?: boolean;
  placeholderText?: string;
}

export function ResponsiveRecipeImage({
  recipeId,
  title,
  imagePath,
  fallbackImage = '/fallback.png',
  className = 'foodpic',
  showPlaceholder = true,
  placeholderText = 'No image available',
}: ResponsiveRecipeImageProps) {
  const { currentImageSrc, isLoading, hasError, handleImageLoad, handleImageError } =
    useImageLoader({
      sources: [imagePath, `recipes/img/${recipeId}.png`, `recipes/img/${recipeId}.jpg`, `recipes/img/${recipeId}.jpeg`].filter((s): s is string => !!s),
      fallbackImage,
    });

  if (hasError) {
    return showPlaceholder ? (
      <div className="image-container placeholder">
        <div className="image-placeholder">{placeholderText}</div>
      </div>
    ) : null;
  }

  return (
    <div className="image-container">
      {isLoading && <div className="image-loading">Loading image...</div>}
      <img
        className={className}
        id="image"
        src={currentImageSrc ?? fallbackImage}
        alt={title}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}
