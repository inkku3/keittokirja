import { MenuContainer } from '../components/Menu';
import { MainContent } from '../components/MainContent';

export function HomePage() {
  const handleRecipeSelect = (recipe: { id: string }) => {
    window.location.href = `/recipe/${recipe.id}`;
  };

  const handleSearchResults = (_results: any[]) => {
    // Legacy list manages search internally
  };

  const handleSearchTermChange = (_term: string) => {
    // intentionally unused
  };

  return (
    <div className="content">
    <MenuContainer onRecipeSelect={handleRecipeSelect} />
    <MainContent
    onSearchResults={handleSearchResults}
    onSearchTermChange={handleSearchTermChange}
    />
    <div className="bottom-header">keittokirjaa ylläpitää @inkku2 (discord)</div>
    </div>
  );
}
