import React from 'react'
import styles from './components.module.css'

interface SidebarMenuProps {
  onClose?: () => void
  onToggleSortMenu?: () => void
}

export function SidebarMenu({ onClose, onToggleSortMenu }: SidebarMenuProps) {
  return (
    <div id="myNav" className={`overlay-menu ${styles.overlayMenu}`}>
      <span className={`close-btn ${styles.closeBtn || ''}`} onClick={onClose}>&times;</span>
      <div className={`overlay-content ${styles.overlayContent}`}>
        {/* Filter Dropdown */}
        <div className="dropdown">
          <button className={`dropbtn ${styles.dropbtn}`} onClick={onToggleSortMenu}>Suodata</button>
          <div id="myDropdown" className="dropdown-content">
            {/* Category filters */}
            <button className={`sortButtons ${styles.sortButtons}`} id="main">pääruoka</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="side">lisuke</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="dessert">jälkiruoka</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="soup">keitto</button>
            {/* Protein filters */}
            <button className={`sortButtons ${styles.sortButtons}`} id="chicken">kana</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="duck">ankka</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="beef">nauta</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="fish">merenelävä</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="mince">jauheliha</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="lamb">lammas</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="pork">sika</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="veggie">kasvis</button>
            {/* Other filters */}
            <button className={`sortButtons ${styles.sortButtons}`} id="sauce">kastike</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="marinade">marinadi</button>
            <button className={`sortButtons ${styles.sortButtons}`} id="essay">essee</button>
          </div>
        </div>
        {/* Recipe Menu */}
        <div className={`recipeMenu ${styles.recipeMenu}`} id="recipeMenu"></div>
      </div>
    </div>
  )
}
