interface SearchBarProps {
  placeholder?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({ 
  placeholder = "Ladataan reseptejä...",
  onChange 
}: SearchBarProps) {
  return (
    <div className="search-wrapper">
      <div className="search-container">
        <input
          id="search"
          type="text"
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      <div className="recipelist" id="recipes"></div>
    </div>
  )
}
