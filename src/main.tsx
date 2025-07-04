import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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
import Profile from './pages/Profile';
import MyVideoAgents from './pages/MyVideoAgents';
import Onboarding from './pages/Onboarding';
import BlogPost from './pages/BlogPost';


function ProtectedRouteWithOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading, isNewUser } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (isNewUser) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          <Route path="/video-agents" element={
            <ProtectedRouteWithOnboarding>
              <VideoAgents />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/my-video-agents" element={
            <ProtectedRouteWithOnboarding>
              <MyVideoAgents />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/voice-agents" element={
            <ProtectedRouteWithOnboarding>
              <VoiceAgents />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/dashboard" element={
            <ProtectedRouteWithOnboarding>
              <Dashboard />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/analytics" element={
            <ProtectedRouteWithOnboarding>
              <Analytics />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/billing" element={
            <ProtectedRouteWithOnboarding>
              <Billing />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/settings" element={
            <ProtectedRouteWithOnboarding>
              <Settings />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/calls" element={
            <ProtectedRouteWithOnboarding>
              <Calls />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/builder" element={
            <ProtectedRouteWithOnboarding>
              <AgentBuilder />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/team" element={
            <ProtectedRouteWithOnboarding>
              <Team />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/profile" element={
            <ProtectedRouteWithOnboarding>
              <Profile />
            </ProtectedRouteWithOnboarding>
          } />
          <Route path="/blog/:id" element={<BlogPost />} />
          {/* Add Profile route if you have one */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
