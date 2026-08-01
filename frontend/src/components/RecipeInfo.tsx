interface RecipeInfoProps {
  info: string;
  className?: string;
}

export function RecipeInfo({ info, className = 'info' }: RecipeInfoProps) {
  if (!info) return null;
  return <div id="info" className={className}>{info}</div>;
}
