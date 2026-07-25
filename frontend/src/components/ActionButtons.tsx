import { DarkModeButton } from './DarkModeButton';
import { RandomRecipeButton } from './RandomRecipeButton';

interface ActionButtonsProps {
  onRandomClick?: () => void;
}

export function ActionButtons({
  onRandomClick,
}: ActionButtonsProps) {
  return (
    <div className="buttons">
      <DarkModeButton />
      <RandomRecipeButton
        onRecipeSelected={() => onRandomClick?.()}
      />
    </div>
  );
}

