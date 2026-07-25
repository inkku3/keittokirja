import { Recipe } from '../api/recipes';
import { RecipeImage } from './RecipeImage';
import { RecipeTitle } from './RecipeTitle';
import { RecipeInfo } from './RecipeInfo';
import { RecipeIngredients } from './RecipeIngredients';
import { RecipeInstructions } from './RecipeInstructions';

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  return (
    <div className="recipe">
      <RecipeImage
        recipeId={recipe.id}
        title={recipe.title}
        imagePath={recipe.image_path}
      />

      <RecipeTitle title={recipe.title} />

      <RecipeInfo info={recipe.info || ''} />

      <div className="content-container">
        <RecipeIngredients ingredients={recipe.ingredients} />
        <RecipeInstructions instructions={recipe.instructions} />
      </div>
    </div>
  );
}
