import { MenuContainer } from '../components/MenuContainer';
import { MainContent } from '../components/MainContent';
import { FullRecipeList } from '../components/FullRecipeList';
import { DarkModeProvider } from '../components/DarkModeProvider';

export function HomePage() {
  const handleRecipeSelect = (recipeId: string) => {
    window.location.href = `/recipe/${recipeId}`;
  };

  return (
    <DarkModeProvider>
      <div className="content">
        <MenuContainer onRecipeSelect={(recipe) => handleRecipeSelect(recipe.id)} />
        <MainContent />
        <FullRecipeList />
        <div className="bottom-header">keittokirjaa ylläpitää @inkku2 (discord)</div>
      </div>
    </DarkModeProvider>
  );
}
