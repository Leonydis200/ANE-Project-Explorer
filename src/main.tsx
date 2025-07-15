import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'  // Should match the created file
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
