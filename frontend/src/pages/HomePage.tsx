import { useState } from 'react';
import { MenuContainer } from '../components/MenuContainer';
import { MainContent } from '../components/MainContent';
import { DarkModeProvider } from '../components/DarkModeProvider';
import { LegacyRecipeList } from '../components/LegacyRecipeList';

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleRecipeSelect = (recipeId: string) => {
    window.location.href = `/recipe/${recipeId}`;
  };

  const handleFilterResults = (_results: any[], _filters: string[]) => {
    // Legacy list component manages its own data; filter interaction kept for menu behavior
  };

  const handleSearchResults = (_results: any[]) => {
    // Legacy list manages search internally; keep signature for MainContent
  };

  const handleSearchTermChange = (term: string) => {
    setSearchQuery(term);
  };

  return (
    <DarkModeProvider>
      <div className="content">
        <MenuContainer onRecipeSelect={(recipe) => handleRecipeSelect(recipe.id)} />
        <MainContent
          onFilterResults={handleFilterResults}
          onSearchResults={handleSearchResults}
          onSearchTermChange={handleSearchTermChange}
        />
        <LegacyRecipeList />
        <div className="bottom-header">keittokirjaa ylläpitää @inkku2 (discord)</div>
      </div>
    </DarkModeProvider>
  );
}
