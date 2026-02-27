import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSocketContext } from './contexts/SocketContext';
import { Loader2 } from 'lucide-react';

// Legacy components for fallback/redirects during transition
import Landing from './pages/Landing';

// New Architecture Pages
import CreatePoll from './pages/teacher/CreatePoll';
import LiveDashboard from './pages/teacher/LiveDashboard';
import PollHistory from './pages/teacher/PollHistory';
import NameEntry from './pages/student/NameEntry';
import PollQuestion from './pages/student/PollQuestion';
import LiveResults from './pages/student/LiveResults';

const App: React.FC = () => {
  const { appState, isLoading } = useSocketContext();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8E9F0' }}>
        <Loader2 className="loading-spinner" size={48} color="#FF4D4D" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Toaster position="top-right" />
        <Routes>
          {/* Main Entry */}
          <Route path="/" element={<Landing />} />

          {/* Teacher Routes */}
          <Route path="/teacher/create" element={
            appState.role === 'teacher' ? <CreatePoll /> : <Navigate to="/" replace />
          } />
          <Route path="/teacher/live" element={
            appState.role === 'teacher' ? <LiveDashboard /> : <Navigate to="/" replace />
          } />
          <Route path="/teacher/history" element={
            appState.role === 'teacher' ? <PollHistory /> : <Navigate to="/" replace />
          } />
          <Route path="/teacher" element={<Navigate to="/teacher/create" replace />} />

          {/* Student Routes */}
          <Route path="/student/join" element={
            appState.role === 'student' ? <Navigate to="/student/poll" replace /> : <NameEntry />
          } />
          <Route path="/student/poll" element={
            appState.role === 'student' ? <PollQuestion /> : <Navigate to="/student/join" replace />
          } />
          <Route path="/student/results" element={
            appState.role === 'student' ? <LiveResults /> : <Navigate to="/student/join" replace />
          } />
          <Route path="/student" element={<Navigate to="/student/join" replace />} />

        </Routes>
      </div>
    </Router>
  );
};

export default App;
