const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data', 'articles.json');

app.use(cors());
app.use(express.json());

function readArticles() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeArticles(articles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
}

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// GET /api/articles — list all (id, title, summary, lastEdited only)
app.get('/api/articles', (req, res) => {
  const articles = readArticles();
  res.json(articles.map(({ id, title, summary, lastEdited }) => ({ id, title, summary, lastEdited })));
});

// GET /api/articles/:id — full article
app.get('/api/articles/:id', (req, res) => {
  const article = readArticles().find(a => a.id === req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
});

// POST /api/articles — create
app.post('/api/articles', (req, res) => {
  const { title, content, summary } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  const articles = readArticles();
  const id = slugify(title);
  if (articles.find(a => a.id === id)) return res.status(409).json({ error: 'An article with this title already exists' });

  const article = { id, title, summary: summary || '', content, lastEdited: new Date().toISOString() };
  articles.push(article);
  writeArticles(articles);
  res.status(201).json(article);
});

// PUT /api/articles/:id — update
app.put('/api/articles/:id', (req, res) => {
  const articles = readArticles();
  const idx = articles.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Article not found' });

  const { title, content, summary } = req.body;
  articles[idx] = { ...articles[idx], title, content, summary, lastEdited: new Date().toISOString() };
  writeArticles(articles);
  res.json(articles[idx]);
});

// DELETE /api/articles/:id — delete
app.delete('/api/articles/:id', (req, res) => {
  const articles = readArticles();
  const idx = articles.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Article not found' });
  articles.splice(idx, 1);
  writeArticles(articles);
  res.status(204).end();
});

// GET /api/search?q=query — search
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json([]);
  const results = readArticles()
    .filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q)
    )
    .map(({ id, title, summary }) => ({ id, title, summary }));
  res.json(results);
});

app.listen(PORT, () => console.log(`WikiBase server running at http://localhost:${PORT}`));
