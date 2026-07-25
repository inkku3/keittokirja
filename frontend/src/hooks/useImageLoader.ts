import { useState, useCallback } from 'react';

export interface ImageLoadConfig {
  sources: string[];
  fallbackImage?: string;
  onError?: (error: Error) => void;
}

export function useImageLoader(config: ImageLoadConfig) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sources = [
    ...config.sources.filter(Boolean),
    ...(config.fallbackImage ? [config.fallbackImage] : []),
  ];

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    const nextIndex = currentImageIndex + 1;
    if (nextIndex < sources.length) {
      setCurrentImageIndex(nextIndex);
    } else {
      setHasError(true);
      setIsLoading(false);
      config.onError?.(new Error('All image sources failed'));
    }
  }, [currentImageIndex, sources, config]);

  return {
    currentImageSrc: sources[currentImageIndex],
    isLoading,
    hasError,
    handleImageLoad,
    handleImageError,
    currentIndex: currentImageIndex,
    totalSources: sources.length,
  };
}
