import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ux-feedback.css'
import './referents-extension.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
