import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Marketplace from './pages/Marketplace';
import VideoAgents from './pages/VideoAgents';
import VoiceAgents from './pages/VoiceAgents';
import AgentBuilder from './pages/AgentBuilder';
import ProtectedRoute from './ProtectedRoute';
import './index.css';
import { CallLogs } from './components/CallLogs';
import Calls from './pages/Calls';
import Team from './pages/Team';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/video-agents" element={
            <ProtectedRoute>
              <VideoAgents />
            </ProtectedRoute>
          } />
          <Route path="/voice-agents" element={
            <ProtectedRoute>
              <VoiceAgents />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <Billing />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/calls" element={
            <ProtectedRoute>
              <Calls />
            </ProtectedRoute>
          } />
          <Route path="/builder" element={
            <ProtectedRoute>
              <AgentBuilder />
            </ProtectedRoute>
          } />
          <Route path="/team" element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          } />
          {/* Add Profile route if you have one */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
