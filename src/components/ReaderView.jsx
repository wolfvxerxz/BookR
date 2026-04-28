import React, { useState, useEffect, useRef, useCallback } from 'react'
import { sv, ld, x } from '../utils'
import './ReaderView.css'

export default function ReaderView({ book, isActive }) {
  const C = book.chapters
  const maxNum = Math.max(...C.map(c => c.num))

  const [idx, setIdx] = useState(() => {
    const p = ld(`reader-${book.id}-pos`, 0)
    return Math.min(p, C.length - 1)
  })
  const [readSet, setReadSet] = useState(() => new Set(ld(`reader-${book.id}-read`, [])))
  const [bookmarks, setBookmarks] = useState(() => ld(`reader-${book.id}-bm`, {}))
  const [navOpen, setNavOpen] = useState(true)
  const [rsOpen, setRsOpen] = useState(false)
  const [fbOpen, setFbOpen] = useState(false)
  const [fbInput, setFbInput] = useState('')
  const [fbStatus, setFbStatus] = useState('')
  const [fbSelected, setFbSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState(C)
  const pageRef = useRef()

  const ch = C[idx]

  // Keyboard nav
  useEffect(() => {
    if (!isActive) return
    const handler = e => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === 'ArrowRight') setIdx(i => Math.min(i + 1, C.length - 1))
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isActive, C.length])

  // Save position
  useEffect(() => { sv(`reader-${book.id}-pos`, idx) }, [idx, book.id])

  // Save read set
  const saveRead = useCallback((rs) => {
    sv(`reader-${book.id}-read`, [...rs])
  }, [book.id])

  // Save bookmarks
  const saveBm = useCallback((bm) => {
    sv(`reader-${book.id}-bm`, bm)
  }, [book.id])

  // Filter chapters
  useEffect(() => {
    const q = search.toLowerCase().trim()
    setFiltered(q ? C.filter(c => c.title.toLowerCase().includes(q) || String(c.num).includes(q)) : C)
  }, [search, C])

  const toggleRead = useCallback((num) => {
    setReadSet(prev => {
      const next = new Set(prev)
      next.has(num) ? next.delete(num) : next.add(num)
      saveRead(next)
      return next
    })
  }, [saveRead])

  const parseRange = (input) => {
    const nums = new Set()
    input.split(',').forEach(r => {
      r = r.trim()
      if (r.includes('-')) {
        const [a, b] = r.split('-').map(Number)
        for (let i = a; i <= b; i++) nums.add(i)
      } else {
        nums.add(Number(r))
      }
    })
    return [...nums].filter(n => !isNaN(n) && n > 0 && n <= maxNum)
  }

  const handleFbMark = () => {
    if (!fbInput.trim()) { setFbStatus('Enter chapters first'); return }
    const sel = new Set(parseRange(fbInput))
    setFbSelected(sel)
    setFbStatus(`Selected ${sel.size} chapters — click Confirm`)
  }

  const handleFbUnmark = () => {
    if (!fbInput.trim()) { setFbStatus('Enter chapters to unmark'); return }
    const nums = parseRange(fbInput)
    let n = 0
    setReadSet(prev => {
      const next = new Set(prev)
      nums.forEach(num => { if (next.has(num)) { next.delete(num); n++ } })
      saveRead(next)
      return next
    })
    setFbStatus(`Unmarked ${n} chapters`)
  }

  const handleFbConfirm = () => {
    if (!fbSelected.size) { setFbStatus('Mark chapters first'); return }
    setReadSet(prev => {
      const next = new Set(prev)
      fbSelected.forEach(n => next.add(n))
      saveRead(next)
      return next
    })
    setFbInput(''); setFbSelected(new Set()); setFbStatus(''); setFbOpen(false)
    setRsOpen(true)
  }

  const setBookmark = (chNum, lineIdx) => {
    setBookmarks(prev => {
      const next = { ...prev }
      if (next[chNum] === lineIdx) delete next[chNum]
      else next[chNum] = lineIdx
      saveBm(next)
      return next
    })
  }

  const unread = filtered.filter(c => !readSet.has(c.num))
  const read   = filtered.filter(c =>  readSet.has(c.num))
  const readCount = readSet.size
  const bm = bookmarks[ch?.num]

  const jumpToBm = () => {
    const el = pageRef.current?.querySelector(`[data-line="${bm}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const isMob = () => window.innerWidth <= 720

  return (
    <div className="reader">
      {/* SIDEBAR */}
      <aside className={`r-nav ${navOpen ? '' : 'r-nav--off'}`}>
        <div className="r-nav-top">
          <div className="r-nav-brand">{book.name}</div>

          {/* Filter & Mark */}
          <button className={`fb-toggle ${fbOpen ? 'fb-toggle--open' : ''}`} onClick={() => setFbOpen(o => !o)}>
            Filter & Mark
            <svg className="fb-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {fbOpen && (
            <div className="fb-panel">
              <input className="fb-input" value={fbInput} onChange={e => setFbInput(e.target.value)}
                placeholder="e.g. 1-59, 100, 120-150" />
              <div className="fb-actions">
                <button className="fb-btn" onClick={handleFbMark}>Mark Read</button>
                <button className="fb-btn" onClick={handleFbUnmark}>Unmark</button>
                <button className="fb-btn fb-btn--confirm" onClick={handleFbConfirm}>Confirm</button>
              </div>
              {fbStatus && <div className="fb-status" dangerouslySetInnerHTML={{__html: fbStatus}} />}
            </div>
          )}

          {/* Search */}
          <div className="search-wrap">
            <svg className="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input className="r-search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search chapters…" type="search" />
          </div>
        </div>

        {/* Chapter list - unread */}
        <div className="r-ch-list">
          {unread.map(ch => {
            const ri = C.findIndex(c => c.num === ch.num)
            return <ChItem key={ch.num} ch={ch} ri={ri} idx={idx} readSet={readSet}
              onGo={() => { setIdx(ri); if(isMob()) setNavOpen(false) }}
              onToggle={() => toggleRead(ch.num)} />
          })}
        </div>

        {/* Read section */}
        <div className="rs-section">
          <button className={`rs-toggle ${rsOpen ? 'rs-toggle--open' : ''}`} onClick={() => setRsOpen(o => !o)}>
            <div className="rs-left">
              <span className="rs-dot" />
              Read Chapters
            </div>
            <div className="rs-right">
              <span>{readCount}</span>
              <svg className="rs-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </div>
          </button>
          {rsOpen && (
            <div className="rs-list">
              {read.map(ch => {
                const ri = C.findIndex(c => c.num === ch.num)
                return <ChItem key={ch.num} ch={ch} ri={ri} idx={idx} readSet={readSet} dimmed
                  onGo={() => { setIdx(ri); if(isMob()) setNavOpen(false) }}
                  onToggle={() => toggleRead(ch.num)} />
              })}
            </div>
          )}
        </div>

        <div className="r-nav-foot">
          <span>{C.length - readCount} unread</span>
        </div>
      </aside>

      {/* MAIN */}
      <div className="r-main">
        {/* Reader topbar */}
        <div className="r-top">
          <button className="tb" onClick={() => setNavOpen(o => !o)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
          </button>
          <div className="r-top-nav">
            <button className="cnb" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              <span>Prev</span>
            </button>
            <button className="cnb" disabled={idx === C.length - 1} onClick={() => setIdx(i => i + 1)}>
              <span>Next</span>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
          <div className="r-top-label">
            Ch.{ch?.num} — <em>{ch?.title}</em>
          </div>
          <button className={`tb ${readSet.has(ch?.num) ? 'tb--on' : ''}`} onClick={() => toggleRead(ch?.num)} title="Mark as read">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </button>
        </div>

        {/* Page */}
        <div className="r-page" ref={pageRef} key={idx}>
          <div className="r-page-inner">
            {/* Bookmark banner */}
            {bm !== undefined && (
              <div className="bm-banner">
                <div className="bm-banner-in">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ac)" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  <span>Bookmark at <strong>line {bm + 1}</strong></span>
                  <button className="bm-go" onClick={jumpToBm}>Jump there</button>
                  <button className="bm-x" onClick={() => setBookmark(ch.num, bm)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Chapter header */}
            <div className="r-hd">
              <div className="hd-sup">Chapter {ch?.num}</div>
              <div className="hd-title">{ch?.title}</div>
            </div>

            {/* Body */}
            <div className="r-body">
              {ch?.body.split(/\n+/).filter(p => p.trim()).map((p, j) => {
                const isBm = bookmarks[ch.num] === j
                const isDialog = p.startsWith('"') || p.startsWith('\u201C')
                return (
                  <div key={j} className={`pw ${isBm ? 'pw--bm' : ''}`} data-line={j}>
                    <span className={`ln-n ${isBm ? 'ln-n--bm' : ''}`} onClick={() => setBookmark(ch.num, j)}>
                      <span className="ln-num">{j + 1}</span>
                    </span>
                    <p className={!isDialog && j > 0 ? '' : 'd'}>{p}</p>
                  </div>
                )
              })}
            </div>

            {/* Bottom nav */}
            <div className="r-bnav">
              <button className="nb" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Previous
              </button>
              <span className="r-prog">{idx + 1} / {C.length}</span>
              <button className="nb" disabled={idx === C.length - 1} onClick={() => setIdx(i => i + 1)}>
                Next
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChItem({ ch, ri, idx, readSet, onGo, onToggle, dimmed }) {
  const done = readSet.has(ch.num)
  return (
    <div className={`ci ${ri === idx ? 'ci--on' : ''} ${dimmed ? 'ci--dim' : ''}`}>
      <button className={`ck ${done ? 'ck--done' : ''}`} onClick={onToggle}>
        {done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>}
      </button>
      <div className="ci-info" onClick={onGo}>
        <span className="ci-n">Ch {ch.num}</span>
        <span className="ci-t">{ch.title}</span>
      </div>
    </div>
  )
}
