import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Download,
  Check,
  Star,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Billing: React.FC = () => {

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const { user } = useAuth();
  const useRazorpay = import.meta.env.VITE_PAYMENT_PROVIDER === 'razorpay';
  const currencySymbol = '₹'; // Always use rupees

  // Force re-render to ensure latest prices are displayed
  const version = Date.now();

  // Fetch user credits from Supabase
  const fetchUserCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user credits:', error);
        return;
      }

      setUserCredits(data.credits || 0);
    } catch (err) {
      console.error('Error fetching user credits:', err);
    }
  };

  useEffect(() => {
    fetchUserCredits();
    // Debug which provider is active
    // eslint-disable-next-line no-console
    console.log('Billing provider:', import.meta.env.VITE_PAYMENT_PROVIDER);
  }, [user]);

  const loadRazorpayScript = () => {
    return new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  };

  const handleUpgradeRazorpay = async (productId: string) => {
    setLoadingPlan(productId);
    setError(null);

    console.log('Starting payment process for productId:', productId);

    try {
      await loadRazorpayScript();

      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-razorpay-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ productId, userId: user?.id, email: user?.email || '' }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to create Razorpay order');

      console.log('Razorpay order created:', data);
      const { keyId, order } = data;
      console.log('Order amount in paise:', order.amount, 'Order amount in INR:', order.amount / 100);

      const options: any = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Agentify',
        description: `${productId} subscription`,
        order_id: order.id,
        prefill: {
          email: user?.email || '',
        },
        handler: async function (response: any) {
          try {
            const verifyResp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-razorpay-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                userId: user?.id,
                email: user?.email || undefined,
              }),
            });

            const verifyData = await verifyResp.json();
            if (!verifyResp.ok || !verifyData.valid) throw new Error('Payment verification failed');

            // Refresh user credits after successful payment
            await fetchUserCredits();

            window.location.href = '/profile';
          } catch (e: any) {
            setError(e?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: function () {
            // Redirect back to billing page after payment cancellation
            window.location.href = '/billing';
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout process. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Stripe checkout handler
  const handleUpgradeStripe = async (productId: string) => {
    setLoadingPlan(productId);
    setError(null);

    try {
      console.log('Creating Stripe checkout for', productId);

      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          productId,
          userId: user?.id,
          email: user?.email
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      console.log('Redirecting to Stripe checkout:', data.url);
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start checkout';
      setError(message);
      console.error('Stripe checkout error:', err);
    } finally {
      setLoadingPlan(null);
    }
  };



  const handleUpgrade = async (productId: string) => {
    if (useRazorpay) {
      await handleUpgradeRazorpay(productId);
    } else {
      await handleUpgradeStripe(productId);
    }
  };

  const currentPlan = {
    name: 'Professional',
    price: 499,
    period: 'month',
    nextBilling: '2024-02-15',
    usage: {
      agents: { used: 5, limit: 5 },
      calls: { used: 2847, limit: -1 }, // -1 for unlimited
      storage: { used: 15.2, limit: 100 }
    }
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small businesses getting started',
      price: 99,
      credits: 1000,
      features: [
        '1 AI Agent',
        '100 calls/month',
        'Voice calls only',
        'Basic analytics',
        'Email support'
      ],
      highlighted: false
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For growing businesses with advanced needs',
      price: 499,
      credits: 7500,
      features: [
        '5 AI Agents',
        'Unlimited calls',
        'Voice + Video agents',
        'Advanced analytics',
        'CRM integration',
        'Priority support'
      ],
      highlighted: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with custom requirements',
      price: 999,
      credits: 20000,
      features: [
        'Unlimited agents',
        'Unlimited calls',
        'All features included',
        'White-label support',
        'Custom integrations',
        'Dedicated support'
      ],
      highlighted: false
    }
  ];

  // Debug: Log the plans to verify prices
  console.log('Billing page loaded with plans:', plans);

  const invoices = [
    { id: 'INV-2024-001', date: '2024-01-15', amount: 499, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-012', date: '2023-12-15', amount: 499, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-011', date: '2023-11-15', amount: 499, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-010', date: '2023-10-15', amount: 499, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-009', date: '2023-09-15', amount: 99, status: 'paid', plan: 'Starter' }
  ];



  return (
    <div className="flex">
      <Sidebar />

      <div className="ml-64 flex-1 p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription and billing.</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Credits Available */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Credits Available</h2>
              <div className="text-3xl font-bold">
                {userCredits}
              </div>
            </div>
            <div className="text-right">
              <button
                onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 mb-2"
              >
                Buy More Credits
              </button>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">AI Agents</h3>
              <div className="text-2xl font-bold text-blue-600">
                {currentPlan.usage.agents.used}/{currentPlan.usage.agents.limit}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(currentPlan.usage.agents.used / currentPlan.usage.agents.limit) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">All agents deployed</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Monthly Calls</h3>
              <div className="text-2xl font-bold text-green-600">
                {currentPlan.usage.calls.used.toLocaleString()}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Unlimited calls included</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Storage Used</h3>
              <div className="text-2xl font-bold text-orange-600">
                {currentPlan.usage.storage.used}GB
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${(currentPlan.usage.storage.used / currentPlan.usage.storage.limit) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {currentPlan.usage.storage.limit - currentPlan.usage.storage.used}GB remaining
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Comparison */}
          <div className="lg:col-span-2" id="plans-section">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Available Plans</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative rounded-xl border-2 p-6 ${plan.highlighted
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                      }`}
                  >


                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      <div className="text-3xl font-bold text-gray-900">
                        {currencySymbol}{plan.price}
                      </div>
                      <div className="text-lg font-semibold text-blue-600 mt-2">
                        {plan.credits.toLocaleString()} Credits
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (!loadingPlan) {
                          console.log('Initiating payment for plan:', (plan as any).id || plan.name.toLowerCase());
                          handleUpgrade(((plan as any).id || plan.name.toLowerCase()));
                        }
                      }}
                      disabled={loadingPlan === ((plan as any).id || plan.name.toLowerCase())}
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${plan.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : (loadingPlan === ((plan as any).id || plan.name.toLowerCase()))
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {loadingPlan === ((plan as any).id || plan.name.toLowerCase()) ? 'Processing...' : 'Buy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing History */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm font-medium text-gray-500 border-b border-gray-200">
                        <th className="pb-3">Invoice</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Plan</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="text-sm">
                          <td className="py-4 font-medium text-gray-900">{invoice.id}</td>
                          <td className="py-4 text-gray-600">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-gray-600">{invoice.plan}</td>
                          <td className="py-4 text-gray-900 font-semibold">{currencySymbol}{invoice.amount}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <button className="text-blue-600 hover:text-blue-700 font-medium">
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>



          {/* Right column container: Alerts + Support */}
          <div className="flex flex-col gap-6">
            {/* Billing Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Alerts</h3>

              <div className="space-y-4">
                <div className="flex items-start p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <div className="font-medium text-yellow-900">Usage Alert</div>
                    <div className="text-sm text-yellow-700">
                      You've used all 5 agent slots. Upgrade to add more agents.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">Payment Reminders</div>
                    <div className="text-sm text-gray-500">Get notified before billing</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Support (below Billing Alerts) */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Have questions about billing or need to make changes to your plan?
              </p>
              <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 border border-blue-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;