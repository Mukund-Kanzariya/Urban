// Step 5: React Setup - Main Entry
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './css/Global.css' // Import newly modularized basic styling

// This renders the top-level "App" component into the index.html file's 'root' div
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
