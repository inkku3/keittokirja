import type { Recipe } from '../api/recipes';
import { RecipeTitle } from './RecipeTitle';
import { RecipeInfo } from './RecipeInfo';
import { RecipeIngredients } from './RecipeIngredients';
import { RecipeInstructions } from './RecipeInstructions';

interface RecipeContentDisplayProps {
  recipe: Recipe;
  showTitle?: boolean;
  showInfo?: boolean;
  showIngredients?: boolean;
  showInstructions?: boolean;
  ingredientsTitle?: string;
  instructionsTitle?: string;
}

export function RecipeContentDisplay({
  recipe,
  showTitle = true,
  showInfo = true,
  showIngredients = true,
  showInstructions = true,
  ingredientsTitle = 'Ainesosat',
  instructionsTitle = 'Ohjeet',
}: RecipeContentDisplayProps) {
  return (
    <>
      {showTitle && <RecipeTitle title={recipe.title} />}

      {showInfo && recipe.info && <RecipeInfo info={recipe.info} />}

      <div className="content-container">
        {showIngredients && (
          <RecipeIngredients
            ingredients={recipe.ingredients}
            title={ingredientsTitle}
          />
        )}
        {showInstructions && (
          <RecipeInstructions
            instructions={recipe.instructions}
            title={instructionsTitle}
          />
        )}
      </div>
    </>
  );
}
