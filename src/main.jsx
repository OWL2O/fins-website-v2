import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.jsx'
import './index.css'

gsap.config({ force3D: true })
gsap.registerPlugin(ScrollTrigger)

// Sections set up their reveal ScrollTriggers on mount, before late layout
// shifts settle (web font swap, DemoScaler's ResizeObserver-driven rescale).
// On mobile that shift is large enough to push trigger positions past the
// reachable scroll range, leaving sections stuck at their initial
// opacity: 0 state. Re-measure once the page has actually settled.
let refreshTimer
const scheduleRefresh = () => {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150)
}
window.addEventListener('load', scheduleRefresh)
document.fonts?.ready?.then(scheduleRefresh)
new ResizeObserver(scheduleRefresh).observe(document.body)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
