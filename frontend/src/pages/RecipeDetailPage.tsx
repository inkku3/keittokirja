import { RecipeDetailPage as RecipeDetailPageComponent } from '../components/RecipeDetailPage';
import { DarkModeProvider } from '../components/DarkModeProvider';

export function RecipeDetailPage() {
  return (
    <DarkModeProvider>
      <div className="content">
        <RecipeDetailPageComponent />
      </div>
    </DarkModeProvider>
  );
}
