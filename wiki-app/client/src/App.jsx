import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import HomePage from './components/HomePage'
import ArticlePage from './components/ArticlePage'
import EditPage from './components/EditPage'
import SearchPage from './components/SearchPage'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="page-body">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/new" element={<EditPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
