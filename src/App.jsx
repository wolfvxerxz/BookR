import React, { useState, useEffect, useCallback } from 'react'
import { sv, ld } from './utils'
import HomeView from './components/HomeView'
import ReaderView from './components/ReaderView'
import Topbar from './components/Topbar'
import UploadModal from './components/UploadModal'
import MMMChapters from './data/mmmChapters'
import './App.css'

const MMM_ID = 'mmm-builtin'

function getInitialBooks() {
  const saved = ld('reader-books', [])
  const hasMMM = saved.find(b => b.id === MMM_ID)
  const mmm = { id: MMM_ID, name: 'Myst, Might, Mayhem', color: '#2dd4bf', builtin: true, chapters: MMMChapters }
  if (!hasMMM) return [mmm, ...saved]
  return saved.map(b => b.id === MMM_ID ? { ...b, chapters: MMMChapters, builtin: true } : b)
}

export default function App() {
  const [theme, setTheme] = useState(() => ld('reader-theme', 'dark'))
  const [fs, setFsState] = useState(() => ld('reader-fs', 19))
  const [lh, setLh] = useState(() => ld('reader-lh', 195))
  const [mw, setMw] = useState(() => ld('reader-mw', 640))
  const [books, setBooks] = useState(getInitialBooks)
  const [openTabs, setOpenTabs] = useState([])        // [{id}]
  const [activeId, setActiveId] = useState(null)      // null = home
  const [showUpload, setShowUpload] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Apply theme class to root element
  useEffect(() => {
    const el = document.getElementById('root')
    el.className = theme === 'dark' ? '' : theme === 'light' ? 'theme-light' : 'theme-sepia'
  }, [theme])

  // Apply CSS variables
  useEffect(() => {
    const r = document.documentElement
    r.style.setProperty('--fs', fs + 'px')
    r.style.setProperty('--lh', (lh / 100).toFixed(2))
    r.style.setProperty('--mw', mw + 'px')
  }, [fs, lh, mw])

  // Persist settings
  const setTheme2 = t => { setTheme(t); sv('reader-theme', t) }
  const setFs = v => { setFsState(v); sv('reader-fs', v) }
  const setLhVal = v => { setLh(v); sv('reader-lh', v) }
  const setMwVal = v => { setMw(v); sv('reader-mw', v) }

  // Save books (without chapters for builtin)
  const saveBooks = useCallback((bks) => {
    const toSave = bks.map(b => b.builtin ? { id: b.id, name: b.name, color: b.color, builtin: true } : b)
    sv('reader-books', toSave)
  }, [])

  const addBook = useCallback((book) => {
    setBooks(prev => {
      const next = [...prev, book]
      saveBooks(next)
      return next
    })
    openBook(book.id)
  }, [saveBooks])

  const removeBook = useCallback((id) => {
    setBooks(prev => {
      const next = prev.filter(b => b.id !== id)
      saveBooks(next)
      return next
    });
    ['read', 'bm', 'pos'].forEach(k => localStorage.removeItem(`reader-${id}-${k}`))
    setOpenTabs(prev => prev.filter(t => t !== id))
    setActiveId(prev => prev === id ? null : prev)
  }, [saveBooks])

  const openBook = useCallback((id) => {
    setOpenTabs(prev => prev.includes(id) ? prev : [...prev, id])
    setActiveId(id)
    sv('reader-lastbook', id)
  }, [])

  const closeTab = useCallback((id) => {
    setOpenTabs(prev => {
      const next = prev.filter(t => t !== id)
      return next
    })
    setActiveId(prev => {
      if (prev !== id) return prev
      const remaining = openTabs.filter(t => t !== id)
      return remaining.length > 0 ? remaining[remaining.length - 1] : null
    })
  }, [openTabs])

  // Restore last open book
  useEffect(() => {
    const last = ld('reader-lastbook', MMM_ID)
    const book = books.find(b => b.id === last) || books[0]
    if (book) openBook(book.id)
  }, []) // eslint-disable-line

  const readProgress = (bookId) => {
    const book = books.find(b => b.id === bookId)
    if (!book) return { read: 0, total: 0, pct: 0 }
    const read = new Set(ld(`reader-${bookId}-read`, [])).size
    const total = book.chapters.length
    return { read, total, pct: total ? Math.round(read / total * 100) : 0 }
  }

  return (
    <div className="app">
      <Topbar
        books={books}
        openTabs={openTabs}
        activeId={activeId}
        onHome={() => setActiveId(null)}
        onTab={openBook}
        onCloseTab={closeTab}
        onAddBook={() => setShowUpload(true)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings(s => !s)}
        theme={theme} setTheme={setTheme2}
        fs={fs} setFs={setFs}
        lh={lh} setLh={setLhVal}
        mw={mw} setMw={setMwVal}
        activeProgress={activeId ? readProgress(activeId) : null}
      />

      <div className="views">
        {/* HOME */}
        <div className={`view ${activeId === null ? 'view--on' : ''}`}>
          <HomeView
            books={books}
            onOpen={openBook}
            onAdd={() => setShowUpload(true)}
            onRemove={removeBook}
            readProgress={readProgress}
          />
        </div>

        {/* READER TABS — keep mounted so state is preserved */}
        {openTabs.map(id => {
          const book = books.find(b => b.id === id)
          if (!book) return null
          return (
            <div key={id} className={`view ${activeId === id ? 'view--on' : ''}`}>
              <ReaderView book={book} isActive={activeId === id} />
            </div>
          )
        })}
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onAdd={addBook}
          existingBooks={books}
        />
      )}
    </div>
  )
}
