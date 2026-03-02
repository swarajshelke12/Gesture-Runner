import React from 'react'
import ReactDOM from 'react-dom/client'
// Fix 1: Removed '/src/' because we are already in that folder
import App from './app' 
// Fix 2: Same here, just point to the file directly
import './index.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)