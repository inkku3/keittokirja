interface RecipeTitleProps {
  title: string;
  className?: string;
}

export function RecipeTitle({ title, className = 'title' }: RecipeTitleProps) {
  return <div id="header" className={className}>{title}</div>;
}
