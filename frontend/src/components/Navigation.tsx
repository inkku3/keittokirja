import { useState, useEffect } from 'react';
import type { Recipe } from '../api/recipes';
import { MenuOverlayContent } from './MenuOverlayContent';

interface NavigationProps {
  isOpen?: boolean;
  onClose?: () => void;
  onRecipeSelect?: (recipe: Recipe) => void;
  returnFocusRef?: React.RefObject<HTMLElement>;
}

export function Navigation({
  isOpen = false,
  onClose,
  onRecipeSelect,
  returnFocusRef,
}: NavigationProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setInternalOpen(false);
    onClose?.();
    // return focus to the hamburger after closing
    setTimeout(() => {
      try {
        returnFocusRef?.current?.focus();
      } catch (e) {
        /* ignore */
      }
    }, 0);
  };

  return (
    <div
      id="myNav"
      className={`overlay-menu ${internalOpen ? 'open' : ''}`}
    >
      <span
        className="close-btn"
        role="button"
        tabIndex={0}
        onClick={handleClose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            handleClose();
          }
        }}
        aria-label="Close menu"
      >
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


