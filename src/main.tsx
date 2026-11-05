import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DeviceProvider } from './device/DeviceContext'
import { PresenterPage } from './screens/PresenterPage'
import './index.css'

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) void reg.unregister()
  }).catch(() => {})
}

function isPresenterPath() {
  const path = window.location.pathname.replace(/\/+$/, "")
  return path === "/presenter" || path.endsWith("/presenter")
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DeviceProvider>
      {isPresenterPath() ? <PresenterPage /> : <App />}
    </DeviceProvider>
  </React.StrictMode>,
)
