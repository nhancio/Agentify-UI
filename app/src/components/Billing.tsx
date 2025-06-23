import React, { useEffect, useState } from 'react';
import { CreditCard, Check, Star, Download, Calendar } from 'lucide-react';
import supabase from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { mockUser } from '../data/mockData';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '100 minutes/month',
      'Basic voice options',
      'Email support',
      'Call recordings'
    ],
    current: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    features: [
      '1,000 minutes/month',
      'Voice cloning',
      'Priority support',
      'Advanced analytics',
      'CRM integrations',
      'Custom webhooks'
    ],
    current: true,
    popular: true
  },
  {
    name: 'Video Agent',
    price: '$149',
    period: '/month',
    features: [
      '2,500 minutes/month',
      'Video calling',
      'Avatar customization',
      'White-label solution',
      'Dedicated support',
      'API access'
    ],
    current: false
  }
];

const invoices = [
  { id: '1', date: '2024-01-01', amount: '$49.00', status: 'paid' },
  { id: '2', date: '2023-12-01', amount: '$49.00', status: 'paid' },
  { id: '3', date: '2023-11-01', amount: '$49.00', status: 'paid' },
];

export const Billing: React.FC = () => {
  const { user: authUser } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log('Auth user:', authUser);
      if (!authUser?.email) return;
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();
      console.log('Supabase fetch result:', { data, error });
      if (!error && data) {
        setUserProfile(data);
      }
    };
    fetchUserProfile();
  }, [authUser]);

  // Use userProfile if available, otherwise fallback to mockUser
  const displayUser = userProfile || mockUser;
  console.log('Display user profile:', displayUser);

  // Extract usage and invoices from userProfile if available
  const minutesUsed = displayUser.minutes_used || 0;
  const minutesLimit = displayUser.minutes_limit || 1000;
  const apiCalls = displayUser.api_calls || 0;
  const apiLimit = displayUser.api_limit || 5000;
  const storageUsed = displayUser.storage_used_mb || 0;
  const storageLimit = displayUser.storage_limit_mb || 1024;
  const userInvoices = displayUser.invoices || invoices;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Plans</h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Current plan:</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            {displayUser.plan}
          </span>
        </div>
      </div>

      {/* Current Usage */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Minutes Used</span>
              <span className="text-sm text-gray-600">{minutesUsed} / {minutesLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, (minutesUsed / minutesLimit) * 100)}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">API Calls</span>
              <span className="text-sm text-gray-600">{apiCalls} / {apiLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${Math.min(100, (apiCalls / apiLimit) * 100)}%` }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Storage</span>
              <span className="text-sm text-gray-600">{storageUsed} MB / {storageLimit} MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${Math.min(100, (storageUsed / storageLimit) * 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative border rounded-lg p-6 ${
                plan.current
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="w-3 h-3" />
                    <span>Popular</span>
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => {
                  setSelectedPlan(plan.name);
                  if (!plan.current) {
                    setShowPaymentModal(true);
                  }
                }}
                disabled={plan.current}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  plan.current
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Payment Method</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Update
          </button>
        </div>
        
        <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
          <CreditCard className="w-8 h-8 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
            <p className="text-sm text-gray-600">Expires 12/25</p>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invoice History</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {userInvoices.map((invoice: any) => (
            <div key={invoice.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">Monthly subscription</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">{invoice.amount}</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Paid
                </span>
                <button className="text-blue-600 hover:text-blue-700">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Upgrade to {selectedPlan}
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  You'll be charged immediately and your plan will be upgraded.
                </p>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="font-medium">Plan upgrade</span>
                <span className="font-medium">
                  {plans.find(p => p.name === selectedPlan)?.price}/month
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle payment processing
                  setShowPaymentModal(false);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};