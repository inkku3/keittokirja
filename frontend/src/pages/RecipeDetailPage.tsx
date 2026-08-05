import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { RecipeDetail } from '../components/RecipeDisplay';
import { BackButton } from '../components/Buttons';

export function RecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { recipe, isLoading, error, notFound } = useRecipeDetail({ recipeId });

  if (error) {
    return (
      <div className="recipe-page">
      <BackButton onClick={() => navigate('/')} />
      <div className="recipe">
      <div className="title">Virhe</div>
      <div className="info">{error}</div>
      </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="recipe-page">
      <div className="recipe">
      <div id="header" className="title">Loading</div>
      </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="recipe-page">
      <BackButton onClick={() => navigate('/')} />
      <div className="recipe">
      <div id="header" className="title"><p>Could not load recipe.</p></div>
      </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="recipe-page">
      <BackButton onClick={() => navigate('/')} />
      <div className="recipe">
      <div id="header" className="title">Reseptiä ei löytynyt</div>
      </div>
      </div>
    );
  }

  return (
    <div className="recipe-page">
    <BackButton onClick={() => navigate('/')} />
    <RecipeDetail recipe={recipe} />
    </div>
  );
}
