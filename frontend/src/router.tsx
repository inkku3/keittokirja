import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { RecipeDetailPage } from '../pages/RecipeDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/recipe/:recipeId',
    element: <RecipeDetailPage />,
    errorElement: <ErrorPage />,
  },
]);

function ErrorPage() {
  return (
    <div className="content">
      <div className="recipe">
        <div className="title">Virhe</div>
        <div className="info">Sivua ei löytynyt</div>
        <div className="buttons">
          <a href="/" className="toggleDark">
            Takaisin alkuun
          </a>
        </div>
      </div>
    </div>
  );
}
