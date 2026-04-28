import React from 'react'
import './Topbar.css'

export default function Topbar({
  books, openTabs, activeId,
  onHome, onTab, onCloseTab, onAddBook,
  showSettings, onToggleSettings,
  theme, setTheme, fs, setFs, lh, setLh, mw, setMw,
  activeProgress
}) {
  const getBook = id => books.find(b => b.id === id)

  return (
    <div className="topbar-wrap">
      <div className="topbar">
        {/* Brand */}
        <button className="brand" onClick={onHome}>
          <span className="brand-dot" />
          <span className="brand-name">Reader</span>
        </button>

        {/* Tabs */}
        <div className="tab-bar">
          {openTabs.map(id => {
            const book = getBook(id)
            if (!book) return null
            return (
              <button
                key={id}
                className={`tab ${activeId === id ? 'tab--on' : ''}`}
                onClick={() => onTab(id)}
              >
                <span className="tab-dot" style={{ background: book.color }} />
                <span className="tab-name">
                  {book.name.length > 20 ? book.name.slice(0, 20) + '…' : book.name}
                </span>
                <span className="tab-close" onClick={e => { e.stopPropagation(); onCloseTab(id) }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </span>
              </button>
            )
          })}
        </div>

        {/* Add book */}
        <button className="icon-btn" onClick={onAddBook} title="Add book">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>

        {/* Settings */}
        <button className={`icon-btn ${showSettings ? 'icon-btn--on' : ''}`} onClick={onToggleSettings} title="Settings">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="sg">
            <span className="sl-label">Theme</span>
            <div className="theme-pills">
              {['dark','light','sepia'].map(t => (
                <button key={t} className={`tp tp-${t} ${theme===t?'tp--on':''}`} onClick={() => setTheme(t)}>
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="sg">
            <span className="sl-label">Size</span>
            <button className="size-btn" style={{fontSize:'10px'}} onClick={() => fs>13 && setFs(fs-1)}>A</button>
            <span className="size-val">{fs}</span>
            <button className="size-btn" style={{fontSize:'15px'}} onClick={() => fs<30 && setFs(fs+1)}>A</button>
          </div>
          <div className="sg">
            <span className="sl-label">Spacing</span>
            <input type="range" className="slider" min="145" max="235" value={lh} step="5"
              onChange={e => setLh(Number(e.target.value))} />
          </div>
          <div className="sg">
            <span className="sl-label">Width</span>
            <input type="range" className="slider" min="380" max="880" value={mw} step="10"
              onChange={e => setMw(Number(e.target.value))} />
          </div>
        </div>
      )}

      {/* Progress bar */}
      {activeProgress && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: activeProgress.pct + '%' }} />
        </div>
      )}
    </div>
  )
}
