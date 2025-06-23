import React, { useState } from 'react';
import supabase from '../utils/supabase';

export const UserDetailsModal = ({ email, onSuccess }: { email: string, onSuccess: () => void }) => {
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    currentPlan: '',
    emailNotifications: true,
    smsAlerts: false,
    weeklyReports: true,
    callSummary: true,
    systemUpdates: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.from('users').insert([{
      "Full Name": form.fullName,
      email,
      phone_number: form.phoneNumber,
      current_plan: form.currentPlan,
      email_notifications: form.emailNotifications,
      sms_alerts: form.smsAlerts,
      weekly_reports: form.weeklyReports,
      call_summary: form.callSummary,
      system_updates: form.systemUpdates,
    }]);
    if (error) {
      setError(error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 text-center">Complete Your Profile</h1>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        <input
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
        <input
          name="phoneNumber"
          type="text"
          placeholder="Phone Number"
          value={form.phoneNumber}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={email}
          disabled
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg opacity-50 cursor-not-allowed"
        />
        <select
          name="currentPlan"
          value={form.currentPlan}
          onChange={handleChange}
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg"
          required
        >
          <option value="">Select Plan</option>
          <option value="Free">Free</option>
          <option value="Pro">Pro</option>
          <option value="Video Agent">Video Agent</option>
        </select>
        <div className="mb-3 flex flex-col gap-2">
          <label><input type="checkbox" name="emailNotifications" checked={form.emailNotifications} onChange={handleChange} /> Email Notifications</label>
          <label><input type="checkbox" name="smsAlerts" checked={form.smsAlerts} onChange={handleChange} /> SMS Alerts</label>
          <label><input type="checkbox" name="weeklyReports" checked={form.weeklyReports} onChange={handleChange} /> Weekly Reports</label>
          <label><input type="checkbox" name="callSummary" checked={form.callSummary} onChange={handleChange} /> Call Summary</label>
          <label><input type="checkbox" name="systemUpdates" checked={form.systemUpdates} onChange={handleChange} /> System Updates</label>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      </form>
    </div>
  );
};