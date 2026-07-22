import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './HomePage.css'

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => setArticles(data))
      .finally(() => setLoading(false))
  }, [])

  function handleSearch(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-logo">📖</div>
          <h1 className="hero-title">WikiBase</h1>
          <p className="hero-sub">The free knowledge base that anyone can edit</p>
          <form className="hero-search" onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search all articles..."
              className="hero-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="hero-stats">
            <span>{articles.length} article{articles.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="articles-section">
        <div className="articles-header">
          <h2 className="section-title">All Articles</h2>
          <Link to="/new" className="btn btn-primary">+ New Article</Link>
        </div>

        {loading ? (
          <div className="loading">Loading articles…</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">
            <p>No articles yet.</p>
            <Link to="/new" className="btn btn-primary" style={{ marginTop: 12 }}>Create the first article</Link>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map(a => (
              <Link key={a.id} to={`/article/${a.id}`} className="article-card">
                <div className="card-icon">📄</div>
                <div className="card-body">
                  <h3 className="card-title">{a.title}</h3>
                  {a.summary && <p className="card-summary">{a.summary}</p>}
                  <span className="card-date">Last edited {formatDate(a.lastEdited)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
