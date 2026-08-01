import { useEffect, useState } from 'react';
import { MenuContainer } from '../components/MenuContainer';
import { MainContent } from '../components/MainContent';
import { FullRecipeList } from '../components/FullRecipeList';
import { DarkModeProvider } from '../components/DarkModeProvider';
import { recipeAPI } from '../api/recipes';
import type { Recipe } from '../api/recipes';

export function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [displayedRecipes, setDisplayedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const data = await recipeAPI.listAll('title', 'asc');
        setRecipes(data);
        setDisplayedRecipes(data);
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const handleRecipeSelect = (recipeId: string) => {
    window.location.href = `/recipe/${recipeId}`;
  };

  const handleFilterResults = (results: Recipe[], _filters: string[]) => {
    setDisplayedRecipes(results.length > 0 ? results : []);
  };

  const handleSearchResults = (results: Recipe[]) => {
    setDisplayedRecipes(results.length > 0 ? results : []);
  };

  const handleSearchTermChange = (term: string) => {
    setSearchQuery(term);
    if (!term) {
      // restore full list when search cleared
      setDisplayedRecipes(recipes);
    }
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
        <FullRecipeList
          recipes={displayedRecipes}
          isLoading={isLoading}
          onRecipeSelect={(r) => handleRecipeSelect(r.id)}
          searchQuery={searchQuery}
        />
        <div className="bottom-header">keittokirjaa ylläpitää @inkku2 (discord)</div>
      </div>
    </DarkModeProvider>
  );
}
