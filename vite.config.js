import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change '/mmm-reader/' to match your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/mmm-reader/',
})
