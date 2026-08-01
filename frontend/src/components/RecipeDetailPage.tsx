import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { RecipeDetail } from './RecipeDetail';
import { DarkModeButton } from './DarkModeButton';

export function RecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { recipe, isLoading, error, notFound } = useRecipeDetail({ recipeId });

  if (error) {
    return (
      <div className="content">
        <div className="recipe">
          <div className="title">Virhe</div>
          <div className="info">{error}</div>
          <div className="buttons">
            <button
              className="toggleDark"
              onClick={() => navigate('/')}
            >
              Takaisin alkuun
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="content">
        <div className="recipe">
          <div id="header" className="title">Loading</div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="content">
        <div className="recipe">
          <div id="header" className="title"><p> Could not load recipe.</p></div>
          <div className="buttons">
            <button className="toggleDark" onClick={() => navigate('/')}>Takaisin alkuun</button>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="content">
        <div className="recipe">
          <div id="header" className="title">Reseptiä ei löytynyt</div>
        </div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="buttons">
        <DarkModeButton />
      </div>
      <RecipeDetail recipe={recipe} />
    </div>
  );
}
