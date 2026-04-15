import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { EditorRoute } from './components/EditorRoute';
import PublicViewPage from './pages/PublicViewPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <div className="antialiased min-h-screen">
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor" element={<EditorRoute />} />
        <Route path="/editor/:pageId" element={<EditorRoute />} />
        <Route path="/view/:pageId" element={<PublicViewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;
