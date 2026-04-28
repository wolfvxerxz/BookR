import * as pdfjsLib from 'pdfjs-dist'

// Point to the worker file copied to public/
// import.meta.env.BASE_URL gives the vite base (e.g. /mmm-reader/)
pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.js`

export async function parsePDF(file, onProgress) {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  const total = pdf.numPages

  let fullText = ''
  for (let i = 1; i <= total; i++) {
    onProgress?.(Math.round(i / total * 70), `Reading page ${i} of ${total}…`)
    const pg = await pdf.getPage(i)
    const tc = await pg.getTextContent()
    const pageText = tc.items.map(it => it.str).join(' ')
    fullText += '\f' + pageText
  }

  onProgress?.(80, 'Detecting chapters…')
  const chapters = splitIntoChapters(fullText)
  onProgress?.(100, `Found ${chapters.length} chapters`)
  return chapters
}

function splitIntoChapters(text) {
  const pages = text.split('\f').filter(p => p.trim())
  const chapters = []
  let currentNum = 0, currentTitle = '', currentBody = []

  const chRe = /^(?:chapter|ch\.?)\s+(\d+)[\s:\-–—]*(.*)/i

  for (const page of pages) {
    const lines = page.split(/\s{2,}|\n/).map(l => l.trim()).filter(l => l)
    for (const line of lines) {
      const cm = line.match(chRe)
      if (cm) {
        if (currentBody.length > 0) {
          chapters.push({
            num: currentNum || chapters.length + 1,
            title: currentTitle || `Chapter ${currentNum}`,
            body: currentBody.join('\n')
          })
        }
        currentNum = parseInt(cm[1])
        currentTitle = cm[2].trim() || `Chapter ${currentNum}`
        currentBody = []
        continue
      }
      if (currentNum > 0) currentBody.push(line)
    }
  }

  if (currentBody.length > 0) {
    chapters.push({
      num: currentNum || 1,
      title: currentTitle || `Chapter ${currentNum}`,
      body: currentBody.join('\n')
    })
  }

  // Fallback: no chapters detected → one section per ~60 lines
  if (chapters.length === 0) {
    const lines = pages.join('\n').split(/\n+/).filter(l => l.trim()).map(l => l.trim())
    const size = 60
    for (let i = 0; i < lines.length; i += size) {
      const n = Math.floor(i / size) + 1
      chapters.push({ num: n, title: `Section ${n}`, body: lines.slice(i, i + size).join('\n') })
    }
  }

  return chapters
}
