// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load big components
const CyberDashboard = React.lazy(() => import('./components/CyberDashboard'));
const CyberTerminal = React.lazy(() => import('./components/CyberTerminal'));

const Loader = () => (
  <div className="flex items-center justify-center h-screen text-lg font-semibold">
    Loading...
  </div>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<CyberDashboard />} />
          <Route path="/terminal" element={<CyberTerminal />} />
          {/* Add more routes and lazy components as needed */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Suspense>
    </Router>
  );
}
