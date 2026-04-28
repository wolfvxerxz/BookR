export const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (_) {} }
export const ld = (k, d) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : d } catch (_) { return d } }
export const x = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
