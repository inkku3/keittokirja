import { useDarkMode } from '../hooks/useDarkMode';

export function DarkModeButton() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      className="toggleDark"
      id="toggleDark"
      onClick={toggleDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? 'Vaalea tila' : 'Tumma tila'}
    </button>
  );
}
