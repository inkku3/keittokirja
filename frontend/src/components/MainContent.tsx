import { SearchBar } from './SearchBar'
import { ActionButtons } from './ActionButtons'

export function MainContent() {
  return (
    <div className="home">
      <div className="main-header">KEITTOKIRJA</div>

      <SearchBar placeholder="Etsi reseptejä..." />

      <ActionButtons />
    </div>
  )
}
