import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  CreditCard, 
  Download, 
  Check, 
  Star,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

const Billing: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const currentPlan = {
    name: 'Professional',
    price: billingPeriod === 'monthly' ? 99 : 950,
    period: billingPeriod === 'monthly' ? 'month' : 'year',
    nextBilling: '2024-02-15',
    usage: {
      agents: { used: 5, limit: 5 },
      calls: { used: 2847, limit: -1 }, // -1 for unlimited
      storage: { used: 15.2, limit: 100 }
    }
  };

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses getting started',
      monthlyPrice: 29,
      yearlyPrice: 290,
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
      name: 'Professional',
      description: 'For growing businesses with advanced needs',
      monthlyPrice: 99,
      yearlyPrice: 950,
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
      name: 'Enterprise',
      description: 'For large organizations with custom requirements',
      monthlyPrice: 299,
      yearlyPrice: 2990,
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

  const invoices = [
    { id: 'INV-2024-001', date: '2024-01-15', amount: 99, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-012', date: '2023-12-15', amount: 99, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-011', date: '2023-11-15', amount: 99, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-010', date: '2023-10-15', amount: 99, status: 'paid', plan: 'Professional' },
    { id: 'INV-2023-009', date: '2023-09-15', amount: 29, status: 'paid', plan: 'Starter' }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false
    }
  ];

  return (
    <div className="flex">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8 pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscription</h1>
          <p className="text-gray-600">Manage your subscription, billing, and payment methods.</p>
        </div>

        {/* Current Plan */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Current Plan: {currentPlan.name}</h2>
              <p className="text-blue-100 mb-4">
                Next billing date: {new Date(currentPlan.nextBilling).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="text-3xl font-bold">
                ${currentPlan.price}
                <span className="text-lg font-normal text-blue-100">/{currentPlan.period}</span>
              </div>
            </div>
            <div className="text-right">
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 mb-2">
                Change Plan
              </button>
              <div className="text-sm text-blue-100">
                Save 20% with yearly billing
              </div>
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Available Plans</h3>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      billingPeriod === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                      billingPeriod === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <div
                    key={index}
                    className={`relative rounded-xl border-2 p-6 ${
                      plan.highlighted
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          Current Plan
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                      <div className="text-3xl font-bold text-gray-900">
                        ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                        <span className="text-sm font-normal text-gray-500">
                          /{billingPeriod === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {billingPeriod === 'yearly' && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          Save ${(plan.monthlyPrice * 12) - plan.yearlyPrice}
                        </div>
                      )}
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
                      className={`w-full py-2 px-4 rounded-lg font-semibold transition-all ${
                        plan.highlighted
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {plan.highlighted ? 'Current Plan' : 'Upgrade'}
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
                          <td className="py-4 text-gray-900 font-semibold">${invoice.amount}</td>
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

          {/* Payment Methods */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {method.brand} •••• {method.last4}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </div>
                        {method.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Edit className="h-4 w-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            {/* Support */}
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