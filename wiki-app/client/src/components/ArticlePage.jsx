import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import './ArticlePage.css'

function extractTOC(content) {
  const lines = content.split('\n')
  return lines
    .filter(l => /^#{1,3}\s/.test(l))
    .map(l => {
      const level = l.match(/^#+/)[0].length
      const text = l.replace(/^#+\s+/, '')
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      return { level, text, id }
    })
}

function headingRenderer(level) {
  return function Heading({ children }) {
    const text = String(children)
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const Tag = `h${level}`
    return <Tag id={id}>{children}</Tag>
  }
}

export default function ArticlePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/articles/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Article not found')
        return r.json()
      })
      .then(setArticle)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    if (!window.confirm(`Delete "${article.title}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/articles/${id}`, { method: 'DELETE' })
    navigate('/')
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  if (loading) return <div className="container article-status">Loading…</div>
  if (error) return (
    <div className="container">
      <div className="page-notice error">{error}</div>
      <Link to="/" className="btn btn-secondary">← Back to home</Link>
    </div>
  )

  const toc = extractTOC(article.content)

  return (
    <div className="container article-layout">
      {toc.length > 0 && (
        <aside className="toc">
          <div className="toc-box">
            <p className="toc-title">Contents</p>
            <ol className="toc-list">
              {toc.map((h, i) => (
                <li key={i} className={`toc-item toc-level-${h.level}`}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      )}

      <article className="article-main">
        {/* Title bar */}
        <div className="article-title-row">
          <h1 className="article-title">{article.title}</h1>
          <div className="article-actions">
            <Link to={`/edit/${id}`} className="btn btn-secondary">✏️ Edit</Link>
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              🗑 Delete
            </button>
          </div>
        </div>

        {article.summary && (
          <p className="article-summary">{article.summary}</p>
        )}

        <div className="article-meta">
          Last edited: {formatDate(article.lastEdited)}
        </div>

        <hr className="article-rule" />

        {/* Content */}
        <div className="article-content">
          <ReactMarkdown
            components={{
              h1: headingRenderer(1),
              h2: headingRenderer(2),
              h3: headingRenderer(3),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        <div className="article-footer">
          <Link to="/" className="back-link">← All articles</Link>
        </div>
      </article>
    </div>
  )
}
