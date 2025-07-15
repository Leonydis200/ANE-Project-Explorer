import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/cyber.css';
import { CyberTerminal } from './components/CyberTerminal';

const App = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark p-4">
    <CyberTerminal />
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
