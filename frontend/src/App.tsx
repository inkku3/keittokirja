import './App.css'
import { SidebarMenu } from './components/SidebarMenu'

function App() {
  return (
    <div className="content">
      {/* Hamburger Menu Icon */}
      <div className="menu-icon">
        <span className="bar1"></span>
        <span className="bar2"></span>
        <span className="bar3"></span>
      </div>

      {/* Overlay Navigation Menu */}
      <SidebarMenu />

      {/* Main Content */}
      <div className="home">
        <div className="main-header">KEITTOKIRJA</div>

        {/* Search Section */}
        <div className="search-wrapper">
          <div className="search-container">
            <input
              id="search"
              type="text"
              placeholder="Ladataan reseptejä..."
            />
          </div>
          <div className="recipelist" id="recipes"></div>
        </div>

        {/* Buttons Section */}
        <div className="buttons">
          <button className="toggleDark" id="toggleDark">
            Tumma tila
          </button>
          <button className="random-recipe" id="randomRecipe" type="button">
            Yllätysresepti
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bottom-header">keittokirjaa ylläpitää @inkku2 (discord)</div>
    </div>
  )
}

export default App
