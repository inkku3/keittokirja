import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { RootLayout } from './components/RootLayout';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/recipe/:recipeId',
        element: <RecipeDetailPage />,
      },
    ],
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
