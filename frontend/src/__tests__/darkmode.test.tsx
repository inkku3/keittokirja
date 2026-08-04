import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { DarkModeButton } from '../components/Buttons'; // ← updated path
import { useDarkMode } from '../hooks/useDarkMode';

function TestHookUser() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  return (
    <div>
      <span data-testid="state">{String(isDarkMode)}</span>
      <button onClick={toggleDarkMode}>toggle</button>
    </div>
  );
}

describe('Dark mode hook and button', () => {
  beforeEach(() => {
    // Ensure clean body classes and storage before each test
    document.body.className = '';
    window.localStorage.removeItem('isDarkMode');
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('useDarkMode defaults to true when localStorage missing and applies body.dark-mode', () => {
    // ensure localStorage has no value
    window.localStorage.removeItem('isDarkMode');

    render(<TestHookUser />);

    const state = screen.getByTestId('state');
    expect(state).toHaveTextContent('true');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    // localStorage should have been set to reflect value
    expect(window.localStorage.getItem('isDarkMode')).toBe('true');
  });

  test('useDarkMode respects existing localStorage false and does not set dark-mode on body', () => {
    window.localStorage.setItem('isDarkMode', 'false');

    render(<TestHookUser />);

    const state = screen.getByTestId('state');
    expect(state).toHaveTextContent('false');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
  });

  test('toggle updates body class and persists to localStorage', () => {
    // start false
    window.localStorage.setItem('isDarkMode', 'false');

    render(<TestHookUser />);

    const state = screen.getByTestId('state');
    expect(state).toHaveTextContent('false');
    expect(document.body.classList.contains('dark-mode')).toBe(false);

    const toggleBtn = screen.getByText('toggle');
    fireEvent.click(toggleBtn);

    // after toggle, state should be true
    expect(state).toHaveTextContent('true');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
    expect(window.localStorage.getItem('isDarkMode')).toBe('true');

    // toggle back
    fireEvent.click(toggleBtn);
    expect(state).toHaveTextContent('false');
    expect(document.body.classList.contains('dark-mode')).toBe(false);
    expect(window.localStorage.getItem('isDarkMode')).toBe('false');
  });

  test('DarkModeButton shows correct legacy labels and toggles on click', () => {
    // default (no storage) -> true
    window.localStorage.removeItem('isDarkMode');
    render(<DarkModeButton />);

    const btn = screen.getByRole('button', { name: /Switch to light mode|Vaalea tila/i });
    // initial label text should be legacy Finnish for dark enabled -> 'Vaalea tila'
    expect(btn).toHaveTextContent('Vaalea tila');
    expect(document.body.classList.contains('dark-mode')).toBe(true);

    // click to toggle to light
    fireEvent.click(btn);
    expect(btn).toHaveTextContent('Tumma tila');
    expect(document.body.classList.contains('dark-mode')).toBe(false);

    // click to toggle back to dark
    fireEvent.click(btn);
    expect(btn).toHaveTextContent('Vaalea tila');
    expect(document.body.classList.contains('dark-mode')).toBe(true);
  });
});
