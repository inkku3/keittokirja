import { useState, useCallback } from 'react';
import type { Recipe } from '../api/recipes';
import { HamburgerMenu } from './HamburgerMenu';
import { Navigation } from './Navigation';

interface MenuContainerProps {
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function MenuContainer({ onRecipeSelect }: MenuContainerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hamburgerRef = (React as any).useRef<HTMLDivElement | null>(null);

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
      <HamburgerMenu isOpen={isMenuOpen} onToggle={handleMenuToggle} buttonRef={hamburgerRef} />
      <Navigation
        isOpen={isMenuOpen}
        onClose={handleClose}
        onRecipeSelect={handleRecipeSelect}
        returnFocusRef={hamburgerRef}
      />
    </>
  );
}
