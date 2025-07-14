import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // assuming TailwindCSS is included here

// Entry point for React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
