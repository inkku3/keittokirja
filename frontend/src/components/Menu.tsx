import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Recipe } from '../api/recipes';
import { FilterManager } from './Filter';

export function HamburgerMenu({
    isOpen = false,
    onToggle,
    buttonRef,
}: {
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
    buttonRef?: React.RefObject<HTMLDivElement | null>;
}) {
    const [internalOpen, setInternalOpen] = useState(isOpen);

    // Sync internal state with the prop from parent
    useEffect(() => {
        setInternalOpen(isOpen);
    }, [isOpen]);

    const handleToggle = () => {
        const newState = !internalOpen;
        setInternalOpen(newState);
        onToggle?.(newState);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle();
        }
    };

    return (
        <div
        className={`menu-icon ${internalOpen ? 'change' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Toggle menu"
        aria-expanded={internalOpen}
        ref={buttonRef}
        >
        <span className="bar bar1"></span>
        <span className="bar bar2"></span>
        <span className="bar bar3"></span>
        </div>
    );
}
// ----- MenuOverlayContent -----
export function MenuOverlayContent({
    onClose,
    onRecipeSelect,
}: {
    onClose?: () => void;
    onRecipeSelect?: (recipe: Recipe) => void;
}) {
    const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
    const recipeMenuRef = useRef<HTMLDivElement | null>(null);

    const handleFilterChange = (recipes: Recipe[], filters: string[]) => {
        setDisplayedRecipes(recipes);
        setSelectedFilters(filters);
    };

    const handleRecipeClick = (recipe: Recipe) => {
        onRecipeSelect?.(recipe);
        onClose?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const menu = recipeMenuRef.current;
        if (!menu) return;
        const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('a'));
        if (!links.length) return;

        const active = document.activeElement as HTMLElement | null;
        const currentIndex = links.findIndex((a) => a === active);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = links[(currentIndex + 1) % links.length];
            next.focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = links[(currentIndex - 1 + links.length) % links.length];
            prev.focus();
        } else if (e.key === 'Home') {
            e.preventDefault();
            links[0].focus();
        } else if (e.key === 'End') {
            e.preventDefault();
            links[links.length - 1].focus();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose?.();
        }
    };

    useEffect(() => {
        const menu = recipeMenuRef.current;
        if (!menu) return;
        const first = menu.querySelector<HTMLAnchorElement>('a');
        if (first) {
            setTimeout(() => first.focus(), 0);
        }
    }, [displayedRecipes.length]);

    return (
        <>
        <FilterManager onResultsChange={handleFilterChange} />
        <div
        className="recipeMenu"
        id="recipeMenu"
        ref={recipeMenuRef}
        role="menu"
        aria-label="Reseptivalikko"
        onKeyDown={handleKeyDown}
        >
        {displayedRecipes.length === 0 ? (
            <div>
            {selectedFilters.length > 0 ? 'Ei reseptejä valituilla suodattimilla' : 'Ei reseptejä'}
            </div>
        ) : (
            displayedRecipes.map((recipe) => (
                <div key={recipe.id}>
                <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    handleRecipeClick(recipe);
                }}
                role="menuitem"
                >
                {recipe.title}
                </a>
                </div>
            ))
        )}
        </div>
        </>
    );
}

// ----- Navigation -----
export function Navigation({
    isOpen = false,
    onClose,
    onRecipeSelect,
    returnFocusRef,
}: {
    isOpen?: boolean;
    onClose?: () => void;
    onRecipeSelect?: (recipe: Recipe) => void;
    returnFocusRef?: React.RefObject<HTMLElement | null>;
}) {
    const [internalOpen, setInternalOpen] = useState(isOpen);

    useEffect(() => {
        setInternalOpen(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setInternalOpen(false);
        onClose?.();
        setTimeout(() => {
            try {
                returnFocusRef?.current?.focus();
            } catch (e) {
                /* ignore */
            }
        }, 0);
    };

    return (
        <div id="myNav" className={`overlay-menu ${internalOpen ? 'open' : ''}`}>
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
        <MenuOverlayContent onClose={handleClose} onRecipeSelect={onRecipeSelect} />
        </div>
        </div>
    );
}

// ----- MenuContainer -----
export function MenuContainer({ onRecipeSelect }: { onRecipeSelect?: (recipe: Recipe) => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const hamburgerRef = useRef<HTMLDivElement | null>(null);

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

// ----- Header (optional wrapper) -----
export function Header({
    onMenuToggle,
    isMenuOpen = false,
}: {
    onMenuToggle?: (isOpen: boolean) => void;
    isMenuOpen?: boolean;
}) {
    return <HamburgerMenu isOpen={isMenuOpen} onToggle={onMenuToggle} />;
}
