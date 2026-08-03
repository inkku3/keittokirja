import { SearchBar } from './Search';
import { ActionButtons } from './Buttons';
import type { Recipe } from '../api/recipes';

export function MainContent({
    onSearchResults,
    onSearchTermChange,
}: {
    onSearchResults?: (recipes: Recipe[]) => void;
    onSearchTermChange?: (term: string) => void;
}) {
    return (
        <div className="home">
        <div className="main-header">KEITTOKIRJA</div>
        <SearchBar
        placeholder="Etsi reseptejä..."
        onSearchResults={(r) => onSearchResults?.(r)}
        onTermChange={(t) => onSearchTermChange?.(t)}
        />
        <ActionButtons />
        </div>
    );
}
