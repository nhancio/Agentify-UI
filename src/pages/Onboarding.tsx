import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Building, Phone, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const countryCodes = [
  { code: '+1', label: '🇺🇸 US' },
  { code: '+91', label: '🇮🇳 IN' },
  { code: '+44', label: '🇬🇧 UK' },
  { code: '+61', label: '🇦🇺 AU' },
  { code: '+81', label: '🇯🇵 JP' },
  // Add more as needed
];

const Onboarding: React.FC = () => {
  const { user, setIsNewUser } = useAuth();
  const [form, setForm] = useState({
    country_code: '+1',
    mobile_number: '',
    referral_source: '',
    company: '',
    plan: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({
      ...prev,
      country_code: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!user) throw new Error('Not authenticated');
      // Upsert user record in users table by PRIMARY KEY (id)
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        mobile_number: `${form.country_code}${form.mobile_number}`,
        referral_source: form.referral_source,
        company: form.company,
        plan: form.plan
      });
      if (error) throw error;
      setIsNewUser(false);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-4">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome! Tell us about yourself</h1>
            <p className="text-gray-600 mt-2">Complete onboarding to get started</p>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <div className="relative flex">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  name="country_code"
                  value={form.country_code}
                  onChange={handleCountryCodeChange}
                  className="pl-10 pr-2 py-3 border border-gray-300 rounded-l-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  style={{ minWidth: 90 }}
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>{c.label} {c.code}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="mobile_number"
                  value={form.mobile_number}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your mobile number"
                  required
                  style={{ marginLeft: '-1px' }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Where did you hear about us?</label>
              <select
                name="referral_source"
                value={form.referral_source}
                onChange={handleChange}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select an option</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter">Twitter</option>
                <option value="Instagram">Instagram</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your company"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <select
                name="plan"
                value={form.plan}
                onChange={handleChange}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a plan</option>
                <option value="starter">Starter</option>
                <option value="professional">Professional</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Complete Onboarding'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


export default Onboarding;
