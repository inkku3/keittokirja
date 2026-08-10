import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { DarkModeButton } from '../components/Buttons';
import { DarkModeProvider } from '../components/DarkModeProvider';
import { useDarkMode } from '../hooks/useDarkMode';

const STORAGE_KEY = 'darkMode'; // must match hooks/useDarkMode.ts

function TestHookUser() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <div>
    <span data-testid="state">{String(isDarkMode)}</span>
    <button onClick={toggleDarkMode}>toggle</button>
    </div>
  );
}

describe('useDarkMode hook (state + persistence only)', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('defaults to true when localStorage is empty', () => {
    render(<TestHookUser />);
    expect(screen.getByTestId('state')).toHaveTextContent('true');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  test('respects an existing localStorage value of false', () => {
    window.localStorage.setItem(STORAGE_KEY, 'false');
    render(<TestHookUser />);
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  test('toggle flips state and persists to localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'false');
    render(<TestHookUser />);

    const toggleBtn = screen.getByText('toggle');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('state')).toHaveTextContent('true');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true');

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('state')).toHaveTextContent('false');
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('false');
  });

  // Note: this hook intentionally does NOT touch document.body/html anymore —
  // that DOM side effect belongs to DarkModeProvider, which is the single
  // source of truth every dark-mode-aware component shares. See the
  // integration tests below for that behavior.
});

describe('DarkModeProvider + DarkModeButton integration', () => {
  beforeEach(() => {
    document.documentElement.className = '';
    document.body.className = '';
    window.localStorage.removeItem(STORAGE_KEY);
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('DarkModeButton requires a DarkModeProvider ancestor', () => {
    // Rendering it standalone should throw — this is intentional: it's what
    // guarantees the button can never drift out of sync with the class
    // applied to the page (the original bug this fix addresses).
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DarkModeButton />)).toThrow(
      /useDarkModeContext must be used within a DarkModeProvider/
    );
    consoleSpy.mockRestore();
  });

  test('button reflects and toggles the class applied to the document', () => {
    window.localStorage.removeItem(STORAGE_KEY); // defaults to dark

    render(
      <DarkModeProvider>
      <DarkModeButton />
      </DarkModeProvider>
    );

    const btn = screen.getByRole('button', { name: /Switch to light mode|Vaalea tila/i });
    expect(btn).toHaveTextContent('Vaalea tila');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);

    fireEvent.click(btn);
    expect(btn).toHaveTextContent('Tumma tila');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('false');

    fireEvent.click(btn);
    expect(btn).toHaveTextContent('Vaalea tila');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });
});
