import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './responsive.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if (
  import.meta.env.PROD &&
  window.location.protocol !== 'file:' &&
  'serviceWorker' in navigator
) {
  window.addEventListener('load', () => {
    const serviceWorkerUrl = `${import.meta.env.BASE_URL}service-worker.js`
    navigator.serviceWorker.register(serviceWorkerUrl).catch((error) => {
      console.error('Não foi possível ativar o modo instalável do app:', error)
    })
  })
}
