import { useDarkMode } from '../hooks/useDarkMode';

interface DarkModeToggleProps {
  className?: string;
  id?: string;
}

export function DarkModeToggle({ className = 'toggleDark', id = 'toggleDark' }: DarkModeToggleProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      className={className}
      id={id}
      onClick={toggleDarkMode}
    >
      {isDarkMode ? 'Vaalea tila' : 'Tumma tila'}
    </button>
  );
}
