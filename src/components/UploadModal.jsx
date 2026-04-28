import React, { useState, useRef } from 'react'
import { parsePDF } from '../pdfParser'
import './UploadModal.css'

const COLORS = ['#2dd4bf','#818cf8','#f472b6','#fb923c','#a3e635','#38bdf8']

export default function UploadModal({ onClose, onAdd, existingBooks }) {
  const [stage, setStage] = useState('drop')   // drop | loading | done | error
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [chapters, setChapters] = useState(null)
  const [bookName, setBookName] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') return
    setBookName(file.name.replace(/\.pdf$/i, ''))
    setStage('loading')
    try {
      const chs = await parsePDF(file, (pct, label) => {
        setProgress(pct)
        setProgressLabel(label)
      })
      setChapters(chs)
      setStage('done')
    } catch (err) {
      console.error(err)
      setStage('error')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleOpen = () => {
    if (!chapters) return
    const id = 'book-' + Date.now()
    const color = COLORS[existingBooks.length % COLORS.length]
    onAdd({ id, name: bookName.trim() || 'Untitled', chapters, color })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-icon">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="11" x2="12" y2="17"/>
            <polyline points="9 14 12 11 15 14"/>
          </svg>
        </div>
        <div className="modal-title">Add a book</div>
        <div className="modal-sub">Upload a PDF — chapters will be detected automatically.</div>

        {(stage === 'drop' || stage === 'error') && (
          <div
            className={`drop-zone ${dragging ? 'drop-zone--drag' : ''}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p><strong>Drop PDF here</strong> or click to browse</p>
            {stage === 'error' && <p className="drop-error">Error reading file. Try another PDF.</p>}
            <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}}
              onChange={e => handleFile(e.target.files[0])} />
          </div>
        )}

        {stage === 'loading' && (
          <div className="upload-progress">
            <div className="up-bar"><div className="up-fill" style={{width: progress+'%'}} /></div>
            <div className="up-label">{progressLabel}</div>
          </div>
        )}

        {stage === 'done' && (
          <>
            <div className="upload-progress">
              <div className="up-bar"><div className="up-fill" style={{width:'100%'}} /></div>
              <div className="up-label" style={{color:'var(--ac)'}}>✓ {chapters?.length} chapters found</div>
            </div>
            <div className="name-row">
              <label className="name-label">Book title</label>
              <input className="name-input" value={bookName} onChange={e => setBookName(e.target.value)}
                placeholder="Enter book title…" autoFocus />
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="modal-btn" onClick={onClose}>Cancel</button>
          <button className="modal-btn modal-btn--primary" onClick={handleOpen} disabled={stage !== 'done'}>
            Open Book
          </button>
        </div>
      </div>
    </div>
  )
}
