// The Claim Check page stays a dependency-free static file. Only the motion
// showroom is built, and its output is committed so GitHub Pages needs no
// build step of its own.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: 'showroom',
  base: './',
  build: {
    outDir: '../motion',
    emptyOutDir: true,
  },
  plugins: [react()],
})
