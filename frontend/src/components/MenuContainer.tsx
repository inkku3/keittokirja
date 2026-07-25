import { useState, useCallback } from 'react';
import { Recipe } from '../api/recipes';
import { HamburgerMenu } from './HamburgerMenu';
import { Navigation } from './Navigation';

interface MenuContainerProps {
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function MenuContainer({ onRecipeSelect }: MenuContainerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = useCallback((isOpen: boolean) => {
    setIsMenuOpen(isOpen);
  }, []);

  const handleClose = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleRecipeSelect = useCallback(
    (recipe: Recipe) => {
      onRecipeSelect?.(recipe);
      setIsMenuOpen(false);
    },
    [onRecipeSelect]
  );

  return (
    <>
      <HamburgerMenu isOpen={isMenuOpen} onToggle={handleMenuToggle} />
      <Navigation
        isOpen={isMenuOpen}
        onClose={handleClose}
        onRecipeSelect={handleRecipeSelect}
      />
    </>
  );
}
