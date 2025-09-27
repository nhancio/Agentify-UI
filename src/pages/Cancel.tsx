import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, Home } from 'lucide-react';

const Cancel: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Cancelled
          </h1>
          <p className="text-gray-600">
            Your payment was cancelled. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/billing"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Try Again
          </Link>
          
          <Link
            to="/dashboard"
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>If you have any questions, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default Cancel; 