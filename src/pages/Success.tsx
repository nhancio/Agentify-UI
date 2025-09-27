import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Zap, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [creditsAdded, setCreditsAdded] = useState<number>(0);
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPayment = async (sessionId: string) => {
    try {
      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Fetch updated user credits
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setUserCredits(data.credits || 0);
          setCreditsAdded(data.credits || 0);
        } else {
          // If webhook didn't work, try to manually update credits
          console.log('Webhook may not have processed, attempting manual credit update');
          await manualCreditUpdate();
        }
      }

      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setLoading(false);
    }
  };

  const manualCreditUpdate = async () => {
    try {
      // Call a function to manually process the payment and add credits
      const { data, error } = await supabase.functions.invoke('process-payment-manual', {
        body: { sessionId, userId: user?.id }
      });

      if (!error && data) {
        setUserCredits(data.credits || 0);
        setCreditsAdded(data.credits || 0);
      }
    } catch (err) {
      console.error('Manual credit update failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment and updating credits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Thank you for your purchase. Your credits have been added to your account.
          </p>
        </div>

        {/* Credits Display */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-blue-600" />
            <span className="text-lg font-semibold text-gray-700">Credits Added</span>
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {userCredits.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">
            Total credits in your account
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Note: {error} - Credits may take a few moments to appear. Please refresh the page.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>
          
          <Link
            to="/billing"
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition"
          >
            <CreditCard className="w-5 h-5" />
            View Billing & Credits
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Session ID: {sessionId}</p>
          <p>If you have any questions, please contact support.</p>
        </div>
      </div>
    </div>
  );
};

export default Success; 