import styles from './components.module.css'

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <div className={`${styles.menuIcon} menu-icon`} onClick={onMenuToggle}>
      <span className={`${styles.bar} ${styles.bar1} bar1`}></span>
      <span className={`${styles.bar} ${styles.bar2} bar2`}></span>
      <span className={`${styles.bar} ${styles.bar3} bar3`}></span>
    </div>
  )
}
