import { SearchBar } from './SearchBar'
import { ActionButtons } from './ActionButtons'
import { FilterManager } from './FilterManager'
import type { Recipe } from '../api/recipes';

interface MainContentProps {
  onFilterResults?: (recipes: Recipe[], filters: string[]) => void;
  onSearchResults?: (recipes: Recipe[]) => void;
  onSearchTermChange?: (term: string) => void;
}

export function MainContent({ onFilterResults, onSearchResults, onSearchTermChange }: MainContentProps) {
  return (
    <div className="home">
      <div className="main-header">KEITTOKIRJA</div>

      <SearchBar
        placeholder="Etsi reseptejä..."
        onSearchResults={(r) => onSearchResults?.(r)}
        onTermChange={(t) => onSearchTermChange?.(t)}
      />

      {/* Filter dropdown (multi-select tags) */}
      <FilterManager onResultsChange={(recipes, filters) => onFilterResults?.(recipes, filters)} />

      <ActionButtons />
    </div>
  )
}
