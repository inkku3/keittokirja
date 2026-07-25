import { useState } from 'react';

const FILTER_CATEGORIES = [
  // Categories (type)
  { id: 'main', label: 'pääruoka' },
  { id: 'side', label: 'lisuke' },
  { id: 'dessert', label: 'jälkiruoka' },
  { id: 'soup', label: 'keitto' },
  // Proteins
  { id: 'chicken', label: 'kana' },
  { id: 'duck', label: 'ankka' },
  { id: 'beef', label: 'nauta' },
  { id: 'fish', label: 'kala' },
  { id: 'mince', label: 'jauheliha' },
  { id: 'lamb', label: 'lammas' },
  { id: 'pork', label: 'sika' },
  { id: 'veggie', label: 'kasvis' },
  // Other
  { id: 'sauce', label: 'kastike' },
  { id: 'marinade', label: 'marinadi' },
  { id: 'essay', label: 'essee' },
];

interface FilterDropdownProps {
  onFilterChange?: (selectedTags: string[]) => void;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export function FilterDropdown({
  onFilterChange,
  isOpen = false,
  onToggle,
}: FilterDropdownProps) {
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
    onFilterChange?.(Array.from(newFilters));
  };

  const clearFilters = () => {
    setSelectedFilters(new Set());
    onFilterChange?.([]);
  };

  return (
    <div className="dropdown">
      <button className="dropbtn" onClick={handleToggle}>
        Suodata
        {selectedFilters.size > 0 && ` (${selectedFilters.size})`}
      </button>
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
          {selectedFilters.size > 0 && (
            <button className="sortButtons clear-filters" onClick={clearFilters}>
              Poista suodattimet
            </button>
          )}
        </div>
      )}
    </div>
  );
}
