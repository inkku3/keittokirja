import { useState, useEffect } from 'react';
import type { Recipe } from '../api/recipes';
import { MenuOverlayContent } from './MenuOverlayContent';

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function Navigation({
  isOpen = false,
  onClose,
  onRecipeSelect,
}: NavigationProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
  };

  return (
    <div
      id="myNav"
      className={`overlay-menu ${internalOpen ? 'open' : ''}`}
    >
      <span className="close-btn" onClick={handleClose}>
        &times;
      </span>
      <div className="overlay-content">
        <MenuOverlayContent
          onClose={handleClose}
          onRecipeSelect={onRecipeSelect}
        />
      </div>
    </div>
  );
}


