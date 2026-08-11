import { useState, useCallback, useEffect, useRef } from 'react';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';

const FILTER_CATEGORIES = [
    { id: 'main', label: 'pääruoka' },
{ id: 'side', label: 'lisuke' },
{ id: 'dessert', label: 'jälkiruoka' },
{ id: 'soup', label: 'keitto' },
{ id: 'chicken', label: 'kana' },
{ id: 'duck', label: 'ankka' },
{ id: 'beef', label: 'nauta' },
{ id: 'fish', label: 'kala' },
{ id: 'mince', label: 'jauheliha' },
{ id: 'lamb', label: 'lammas' },
{ id: 'pork', label: 'sika' },
{ id: 'veggie', label: 'kasvis' },
{ id: 'sauce', label: 'kastike' },
{ id: 'marinade', label: 'marinadi' },
{ id: 'essay', label: 'essee' },
];

// ----- FilterDropdown -----
// Renders the toolbar (Suodata button) and the filter panel together as one
// sticky unit (see .dropdown-sticky in global.css), so the panel opens
// "attached" to the button rather than appearing as separate content below
// the scroll. Closes itself on scroll so it doesn't stay open and drift out
// of sync with what's sticky-pinned on screen.
export function FilterDropdown({
    onFilterChange,
    isOpen = false,
    onToggle,
}: {
    onFilterChange?: (selectedTags: string[]) => void;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(isOpen);
    const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set());

    const handleToggle = () => {
        const newState = !internalOpen;
        setInternalOpen(newState);
        onToggle?.(newState);
    };

    const handleFilterClick = (tagId: string) => {
        const newFilters = new Set(selectedFilters);
        if (newFilters.has(tagId)) {
            newFilters.delete(tagId);
        } else {
            newFilters.add(tagId);
        }
        setSelectedFilters(newFilters);

        // Translate UI ids -> DB tag values (Finnish) before sending upstream
        const dbTags = Array.from(newFilters).map(
            (id) => FILTER_CATEGORIES.find((c) => c.id === id)?.label ?? id
        );
        onFilterChange?.(dbTags);
    };

    const clearFilters = () => {
        setSelectedFilters(new Set());
        onFilterChange?.([]);
    };

    // Close the panel on scroll. The overlay itself is the scroll container
    // (see .overlay-menu.open { overflow-y: auto } in global.css), so we
    // listen there rather than on window.
    useEffect(() => {
        if (!internalOpen) return;

        const scrollContainer = document.getElementById('myNav');
        if (!scrollContainer) return;

        const handleScroll = () => {
            setInternalOpen(false);
            onToggle?.(false);
        };

        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }, [internalOpen, onToggle]);

    return (
        <div className="dropdown-sticky">
        <div className="dropdown-toolbar">
        <button className="dropbtn" onClick={handleToggle}>
        Suodata
        {selectedFilters.size > 0 && ` (${selectedFilters.size})`}
        </button>
        {selectedFilters.size > 0 && (
            <button className="sortButtons clear-filters" onClick={clearFilters}>
            Poista suodattimet
            </button>
        )}
        </div>
        {internalOpen && (
            <div className="dropdown-content show">
            {FILTER_CATEGORIES.map((category) => (
                <button
                key={category.id}
                className={`sortButtons ${selectedFilters.has(category.id) ? 'active' : ''}`}
                id={category.id}
                onClick={() => handleFilterClick(category.id)}
                >
                {category.label}
                </button>
            ))}
            </div>
        )}
        </div>
    );
}

// ----- FilterManager -----
export function FilterManager({
    onResultsChange,
    isOpen = false,
    onToggle,
}: {
    onResultsChange?: (recipes: Recipe[], activeFilters: string[]) => void;
    isOpen?: boolean;
    onToggle?: (isOpen: boolean) => void;
}) {
    const handleFilterChange = useCallback(
        async (newFilters: string[]) => {
            try {
                let results: Recipe[];
                if (newFilters.length === 0) {
                    results = await recipeAPI.listAll('title', 'asc');
                } else {
                    results = await recipeAPI.filterByTags(newFilters.join(','));
                }
                onResultsChange?.(results, newFilters);
            } catch (error) {
                console.error('Failed to filter recipes:', error);
                onResultsChange?.([], newFilters);
            }
        },
        [onResultsChange]
    );

    useEffect(() => {
        handleFilterChange([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <FilterDropdown
        onFilterChange={handleFilterChange}
        isOpen={isOpen}
        onToggle={onToggle}
        />
    );
}
