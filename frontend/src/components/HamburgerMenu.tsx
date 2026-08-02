import { useState } from 'react';
import styles from './components.module.css';

interface HamburgerMenuProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  buttonRef?: React.RefObject<HTMLDivElement>;
}

export function HamburgerMenu({ isOpen = false, onToggle, buttonRef }: HamburgerMenuProps) {
  const [internalOpen, setInternalOpen] = useState(isOpen);

  const handleToggle = () => {
    const newState = !internalOpen;
    setInternalOpen(newState);
    onToggle?.(newState);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div
      className={`${styles.menuIcon} menu-icon ${internalOpen ? styles.change : ''}`}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Toggle menu"
      aria-expanded={internalOpen}
      ref={buttonRef}
    >
      <span className={`${styles.bar} ${styles.bar1} bar1`}></span>
      <span className={`${styles.bar} ${styles.bar2} bar2`}></span>
      <span className={`${styles.bar} ${styles.bar3} bar3`}></span>
    </div>
  );
}
