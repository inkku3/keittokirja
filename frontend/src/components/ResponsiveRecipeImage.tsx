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
  fallbackImage,
  className = 'foodpic',
  showPlaceholder = true,
  placeholderText = 'No image available',
}: ResponsiveRecipeImageProps) {
  const { currentImageSrc, isLoading, hasError, handleImageLoad, handleImageError } =
    useImageLoader({
      sources: [imagePath, `recipes/img/${recipeId}.png`, `recipes/img/${recipeId}.jpg`, `recipes/img/${recipeId}.jpeg`].filter((s): s is string => !!s),
    });

  // Match legacy: hide the image element if all sources fail
  if (hasError) {
    return null;
  }

  return (
    <div className="image-container">
      {isLoading && <div className="image-loading">Loading image...</div>}
      <img
        className={className}
        id="image"
        src={currentImageSrc ?? undefined}
        alt={title}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}
