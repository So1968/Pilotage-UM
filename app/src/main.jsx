import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ux-feedback.css'
import './retro-50.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // L'application reste utilisable en ligne si l'installation hors ligne échoue.
    })
  })
}
