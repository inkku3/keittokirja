import { HamburgerMenu } from './HamburgerMenu';

interface HeaderProps {
  onMenuToggle?: (isOpen: boolean) => void;
  isMenuOpen?: boolean;
}

export function Header({ onMenuToggle, isMenuOpen = false }: HeaderProps) {
  return (
    <HamburgerMenu
      isOpen={isMenuOpen}
      onToggle={onMenuToggle}
    />
  );
}

