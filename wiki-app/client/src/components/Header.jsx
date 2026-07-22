import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      navigate(`/search?q=${encodeURIComponent(q)}`)
      setQuery('')
    }
  }

  return (
    <header className="site-header">
      <div className="header-inner container">
        <Link to="/" className="logo">
          <span className="logo-globe">📖</span>
          <div className="logo-text">
            <span className="logo-name">WikiBase</span>
            <span className="logo-tagline">The free knowledge base</span>
          </div>
        </Link>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search WikiBase..."
              className="search-input"
            />
          </div>
          <button type="submit" className="search-btn btn btn-primary">Search</button>
        </form>

        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/new" className="nav-new">+ New Article</Link>
        </nav>
      </div>
    </header>
  )
}
