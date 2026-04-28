import React from 'react'
import { ld } from '../utils'
import './HomeView.css'

export default function HomeView({ books, onOpen, onAdd, onRemove, readProgress }) {
  return (
    <div className="home">
      <div className="home-inner">
        <div className="home-hero">
          <div className="home-hero-tag">Your Library</div>
          <h1>What will you read<br />today?</h1>
          <p>Upload PDF books and read with comfort.<br />Your progress is saved automatically.</p>
        </div>

        <div className="home-section-label">Books</div>

        <div className="book-grid">
          {books.map(book => {
            const { read, total, pct } = readProgress(book.id)
            const pos = ld(`reader-${book.id}-pos`, 0)
            const lastCh = book.chapters?.[Math.min(pos, (book.chapters?.length || 1) - 1)]
            return (
              <div key={book.id} className="book-card" onClick={() => onOpen(book.id)}>
                <div className="book-card-cover" style={{ color: book.color }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <div className="book-card-title">{book.name}</div>
                <div className="book-card-meta">
                  {total} chapters{lastCh ? ` · Last: Ch.${lastCh.num}` : ''}
                </div>
                <div className="book-card-progress">
                  <div className="bc-bar">
                    <div className="bc-fill" style={{ width: pct + '%', background: book.color }} />
                  </div>
                  <div className="bc-label">
                    <span style={{ color: book.color }}>{pct}%</span>
                    <span>{read}/{total} read</span>
                  </div>
                </div>
                {!book.builtin && (
                  <button
                    className="book-del"
                    onClick={e => { e.stopPropagation(); if (confirm(`Remove "${book.name}"?`)) onRemove(book.id) }}
                    title="Remove book"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}

          {/* Add card */}
          <button className="book-add" onClick={onAdd}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="book-add-label">Add a book</span>
            <span className="book-add-sub">Upload PDF</span>
          </button>
        </div>
      </div>
    </div>
  )
}
