interface RecipeIngredientsProps {
  ingredients: string;
  className?: string;
  title?: string;
}

export function RecipeIngredients({
  ingredients,
  className = 'ingredients',
  title = 'Ainesosat',
}: RecipeIngredientsProps) {
  if (!ingredients) return null;

  return (
    <div id="ingredients" className={className}>
      {title && <h3>{title}</h3>}
      <pre>{ingredients}</pre>
    </div>
  );
}
