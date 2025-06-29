import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const Onboarding: React.FC = () => {
  const { user, needsOnboarding } = useAuth();
  const [form, setForm] = useState({
    mobile_number: '',
    plan: 'free',
    referral_source: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await supabase.from('users').insert({
      id: user.id,
      mobile_number: form.mobile_number,
      plan: form.plan,
      referral_source: form.referral_source
    });
    // Navigate to dashboard after onboarding
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold mb-4">Hey, can you please provide the following details?</h2>
        <div>
          <label className="block mb-1 font-medium">Mobile Number</label>
          <input
            name="mobile_number"
            type="tel"
            value={form.mobile_number}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Plan</label>
          <select
            name="plan"
            value={form.plan}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="free">Free</option>
            <option value="plus">Plus</option>
            <option value="pro">Pro</option>
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">How do you know us?</label>
          <select
            name="referral_source"
            value={form.referral_source}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select</option>
            <option value="social media">Social Media</option>
            <option value="google">Google</option>
            <option value="twitter">Twitter</option>
            <option value="others">Others</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
        >
          {loading ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default Onboarding;
