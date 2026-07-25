interface NavigationProps {
  onClose?: () => void;
  onToggleSortMenu?: () => void;
}

const FILTER_CATEGORIES = [
  // Categories (type)
  { id: 'main', label: 'pääruoka' },
  { id: 'side', label: 'lisuke' },
  { id: 'dessert', label: 'jälkiruoka' },
  { id: 'soup', label: 'keitto' },
  // Proteins
  { id: 'chicken', label: 'kana' },
  { id: 'duck', label: 'ankka' },
  { id: 'beef', label: 'nauta' },
  { id: 'fish', label: 'merenelävä' },
  { id: 'mince', label: 'jauheliha' },
  { id: 'lamb', label: 'lammas' },
  { id: 'pork', label: 'sika' },
  { id: 'veggie', label: 'kasvis' },
  // Other
  { id: 'sauce', label: 'kastike' },
  { id: 'marinade', label: 'marinadi' },
  { id: 'essay', label: 'essee' },
]

export function Navigation({ onClose, onToggleSortMenu }: NavigationProps) {
  return (
    <div id="myNav" className="overlay-menu">
      <span className="close-btn" onClick={onClose}>&times;</span>
      <div className="overlay-content">
        {/* Filter Dropdown */}
        <div className="dropdown">
          <button className="dropbtn" onClick={onToggleSortMenu}>
            Suodata
          </button>
          <div id="myDropdown" className="dropdown-content">
            {FILTER_CATEGORIES.map((category) => (
              <button
                key={category.id}
                className="sortButtons"
                id={category.id}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        {/* Recipe Menu */}
        <div className="recipeMenu" id="recipeMenu"></div>
      </div>
    </div>
  )
}
