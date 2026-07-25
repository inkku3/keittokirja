import { SearchBar } from './SearchBar'

interface MainContentProps {
  onToggleDark?: () => void;
  onRandomRecipe?: () => void;
}

export function MainContent({ onToggleDark, onRandomRecipe }: MainContentProps) {
  return (
    <div className="home">
      <div className="main-header">KEITTOKIRJA</div>

      <SearchBar placeholder="Ladataan reseptejä..." />

      <div className="buttons">
        <button className="toggleDark" id="toggleDark" onClick={onToggleDark}>
          Tumma tila
        </button>
        <button 
          className="random-recipe" 
          id="randomRecipe" 
          type="button"
          onClick={onRandomRecipe}
        >
          Yllätysresepti
        </button>
      </div>
    </div>
  )
}
