import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import './SearchPage.css'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(setResults)
      .finally(() => setLoading(false))
  }, [query])

  return (
    <div className="container search-page">
      <div className="search-header">
        <h1 className="search-title">
          Search results for <span className="search-query">"{query}"</span>
        </h1>
        {!loading && (
          <span className="search-count">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="search-status">Searching…</div>
      ) : results.length === 0 ? (
        <div className="search-empty">
          <p className="search-empty-title">No results found for "{query}"</p>
          <p className="search-empty-sub">
            You can <Link to="/new">create a new article</Link> on this topic.
          </p>
        </div>
      ) : (
        <ul className="results-list">
          {results.map(r => (
            <li key={r.id} className="result-item">
              <Link to={`/article/${r.id}`} className="result-title">{r.title}</Link>
              {r.summary && <p className="result-summary">{r.summary}</p>}
              <span className="result-url">WikiBase › {r.title}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="search-footer">
        <Link to="/" className="btn btn-secondary">← Back to home</Link>
      </div>
    </div>
  )
}
