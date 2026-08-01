interface RecipeInstructionsProps {
  instructions: string;
  className?: string;
  title?: string;
}

export function RecipeInstructions({
  instructions,
  className = 'instructions',
  title = 'Ohjeet',
}: RecipeInstructionsProps) {
  if (!instructions) return null;

  return (
    <div id="instructions" className={className}>
      {title && <h3>{title}</h3>}
      <pre>{instructions}</pre>
    </div>
  );
}
