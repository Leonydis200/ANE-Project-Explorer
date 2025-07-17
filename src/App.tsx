// src/App.tsx
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

const CyberDashboard = React.lazy(() => import('./components/CyberDashboard'));
const CyberTerminal  = React.lazy(() => import('./components/CyberTerminal'));

const Loader = () => (
  <div className="flex items-center justify-center h-screen text-lg font-semibold">
    Loading...
  </div>
);

export default function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<CyberDashboard />} />
            <Route path="/terminal"  element={<CyberTerminal />} />
            <Route path="*" element={<div className="p-4">404 - Not Found</div>} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}
