interface RecipeTitleProps {
  title: string;
  className?: string;
}

export function RecipeTitle({ title, className = 'title' }: RecipeTitleProps) {
  return <div className={className}>{title}</div>;
}
