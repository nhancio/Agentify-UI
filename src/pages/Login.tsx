import React, { useEffect } from 'react';
import { Bot } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { signInWithGoogle, loading, user, isNewUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, isNewUser, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Sign in to your Agentlybot.com account</p>
          </div>

          {/* Google Sign In Button */}
          <div className="flex flex-col items-center space-y-4">
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5 mr-3"
              />
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
          </div>

          {/* Sign Up Link */}
          {/* <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <span className="text-blue-600 font-semibold">Sign up with Google</span>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;