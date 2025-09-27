import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AgentBuilder from './pages/AgentBuilder';
import VoiceAgents from './pages/VoiceAgents';
import VideoAgents from './pages/VideoAgents';
import MyVideoAgents from './pages/MyVideoAgents';
import Marketplace from './pages/Marketplace';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Billing from './pages/Billing';
import AdminDashboard from './pages/AdminDashboard';
import BlogPost from './pages/BlogPost';
import Profile from './pages/Profile';
import Calls from './pages/Calls';
import Team from './pages/Team';
import Onboarding from './pages/Onboarding';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import ImageGenerator from './pages/ImageGenerator';
import VideoGenerator from './pages/VideoGenerator';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, getRedirectDestination } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check for redirect destination after successful authentication
  const redirectDestination = getRedirectDestination();
  if (redirectDestination) {
    return <Navigate to={redirectDestination} replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, getRedirectDestination } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // Check for redirect destination after successful authentication
    const redirectDestination = getRedirectDestination();
    if (redirectDestination) {
      return <Navigate to={redirectDestination} replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Protected Route with Onboarding Check
const ProtectedRouteWithOnboarding: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isNewUser, getRedirectDestination } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (isNewUser) {
    return <Navigate to="/onboarding" replace />;
  }

  // Check for redirect destination after successful authentication
  const redirectDestination = getRedirectDestination();
  if (redirectDestination) {
    return <Navigate to={redirectDestination} replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        {/* Protected Routes */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <Marketplace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRouteWithOnboarding>
              <Dashboard />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRouteWithOnboarding>
              <Profile />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/builder"
          element={
            <ProtectedRouteWithOnboarding>
              <AgentBuilder />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/voice-agents"
          element={
            <ProtectedRouteWithOnboarding>
              <VoiceAgents />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/video-agents"
          element={
            <ProtectedRouteWithOnboarding>
              <VideoAgents />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/my-video-agents"
          element={
            <ProtectedRouteWithOnboarding>
              <MyVideoAgents />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRouteWithOnboarding>
              <Analytics />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRouteWithOnboarding>
              <Settings />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/billing"
          element={
            <ProtectedRouteWithOnboarding>
              <Billing />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/calls"
          element={
            <ProtectedRouteWithOnboarding>
              <Calls />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/image-generator"
          element={
            <ProtectedRouteWithOnboarding>
              <ImageGenerator />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/video-generator"
          element={
            <ProtectedRouteWithOnboarding>
              <VideoGenerator />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRouteWithOnboarding>
              <Team />
            </ProtectedRouteWithOnboarding>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        {/* Admin Route can remain protected if needed */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen w-full">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;