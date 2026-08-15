import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import { RecipeDetail } from '../components/RecipeDisplay';
import { BackButton } from '../components/Buttons';
import { trackEvent } from '../lib/trackEvent';

export function RecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const navigate = useNavigate();
  const { recipe, isLoading, error, notFound } = useRecipeDetail({ recipeId });

  useEffect(() => {
    if (recipe) {
      trackEvent('Recipe', 'view', recipe.id);
    }
  }, [recipe]);

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
    // Intentionally render nothing here instead of a "Loading" placeholder.
    // A short loading string occupies a different amount of space than the
    // real title/content, causing a layout "whiplash" the instant the
    // recipe data arrives. An empty container avoids that mismatch.
    return (
      <div className="recipe-page">
      <BackButton onClick={() => navigate('/')} />
      <div className="recipe" aria-busy="true" />
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
