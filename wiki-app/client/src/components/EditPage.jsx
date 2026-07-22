import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import './EditPage.css'

export default function EditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = !id

  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(!isNew)

  useEffect(() => {
    if (isNew) return
    fetch(`/api/articles/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Article not found')
        return r.json()
      })
      .then(a => {
        setTitle(a.title)
        setSummary(a.summary || '')
        setContent(a.content)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, isNew])

  async function handleSave(e) {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSaving(true)
    setError(null)

    const body = JSON.stringify({ title: title.trim(), summary: summary.trim(), content: content.trim() })
    const res = await fetch(
      isNew ? '/api/articles' : `/api/articles/${id}`,
      { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body }
    )

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to save article.')
      setSaving(false)
      return
    }

    const saved = await res.json()
    navigate(`/article/${saved.id}`)
  }

  if (loading) return <div className="container edit-status">Loading…</div>

  return (
    <div className="container edit-page">
      <div className="edit-header">
        <h1 className="edit-heading">{isNew ? 'Create New Article' : `Edit: ${title}`}</h1>
        <div className="edit-header-actions">
          <button
            type="button"
            className={`btn btn-secondary toggle-btn ${preview ? 'active' : ''}`}
            onClick={() => setPreview(p => !p)}
          >
            {preview ? '✏️ Edit' : '👁 Preview'}
          </button>
          {!isNew && (
            <Link to={`/article/${id}`} className="btn btn-secondary">Cancel</Link>
          )}
          {isNew && (
            <Link to="/" className="btn btn-secondary">Cancel</Link>
          )}
        </div>
      </div>

      {error && <div className="page-notice error">{error}</div>}

      <div className="edit-layout">
        <form className="edit-form" onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="form-input"
              placeholder="Article title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="summary">Summary <span className="label-optional">(optional)</span></label>
            <input
              id="summary"
              type="text"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="form-input"
              placeholder="A short one-sentence description"
            />
          </div>

          <div className="form-group content-group">
            <label className="form-label" htmlFor="content">
              Content
              <span className="label-hint">Markdown supported — use ## for headings, **bold**, *italic*</span>
            </label>
            {preview ? (
              <div className="preview-box">
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <span className="preview-empty">Nothing to preview yet.</span>
                )}
              </div>
            ) : (
              <textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                className="form-textarea"
                placeholder={`## Overview\n\nWrite your article content here using Markdown.\n\n## Section 2\n\nMore content...`}
                required
              />
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : isNew ? '✓ Publish Article' : '✓ Save Changes'}
            </button>
          </div>
        </form>

        <aside className="edit-tips">
          <div className="tips-box">
            <p className="tips-title">Markdown Tips</p>
            <table className="tips-table">
              <tbody>
                <tr><td><code>## Heading</code></td><td>Section heading</td></tr>
                <tr><td><code>### Sub</code></td><td>Sub-heading</td></tr>
                <tr><td><code>**bold**</code></td><td><strong>bold</strong></td></tr>
                <tr><td><code>*italic*</code></td><td><em>italic</em></td></tr>
                <tr><td><code>`code`</code></td><td><code>code</code></td></tr>
                <tr><td><code>- item</code></td><td>Bullet list</td></tr>
                <tr><td><code>1. item</code></td><td>Numbered list</td></tr>
                <tr><td><code>&gt; text</code></td><td>Blockquote</td></tr>
              </tbody>
            </table>
          </div>
        </aside>
      </div>
    </div>
  )
}
