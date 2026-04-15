import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { initThemeFromStorage } from './lib/theme'

/**
 * Geliştirmede (vite dev) textarea’ya yazılan her Tailwind sınıfı anında çalışsın diye
 * Play CDN yüklenir (DOM’dan JIT). corePlugins.preflight kapalı — @tailwind base ile çakışmaz.
 * Üretim build’inde yüklenmez (offline / safelist).
 */
function ensureDevTailwindPlayCdn() {
  const enabled =
    import.meta.env.DEV || import.meta.env.VITE_TAILWIND_PLAY_CDN === 'true'
  if (!enabled) return
  if (document.getElementById('tailwind-play-cdn')) return
  const scr = document.createElement('script')
  scr.id = 'tailwind-play-cdn'
  scr.src = 'https://cdn.tailwindcss.com'
  scr.addEventListener('load', () => {
    const cfg = document.createElement('script')
    cfg.textContent =
      'tailwind.config = { darkMode: "class", corePlugins: { preflight: false } };'
    document.head.appendChild(cfg)
  })
  document.head.appendChild(scr)
}

ensureDevTailwindPlayCdn()
initThemeFromStorage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
