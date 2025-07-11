import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Building, Phone, Zap, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Profile: React.FC = () => {
  const { user, googleProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      // Fetch from 'users' table by user.id (should be the UUID)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!error && data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  return (
    <div className="flex flex-col md:flex-row">
      <Sidebar />
      <div className="md:ml-64 flex-1 p-4 sm:p-8 pt-24">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            Profile
          </h1>
          {loading ? (
            <div>Loading...</div>
          ) : !profile ? (
            <div className="text-center text-gray-500">No profile found in users table.</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                {googleProfile?.avatar ? (
                  <img
                    src={googleProfile.avatar}
                    alt={googleProfile.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {googleProfile?.name
                      ? googleProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                      : (profile?.full_name || profile?.name || 'JD').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="text-lg font-semibold text-gray-900">
                    {googleProfile?.name || profile?.full_name || profile?.name || 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {googleProfile?.email || profile?.email}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{profile?.email || '-'}</span>
                </div>
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{profile?.company || '-'}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-700">{profile?.mobile_number || '-'}</span>
                </div>
              </div>
              {/* Credits & Billing Card */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 mt-6 shadow flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Credits & Billing</div>
                    <div className="text-xs text-gray-500">Manage your credits and subscription</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/5 rounded-lg p-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{profile.credits ?? 0}</div>
                    <div className="text-xs text-gray-500">Available Credits</div>
                  </div>
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition">
                    <Zap className="w-4 h-4" /> Add Credits
                  </button>
                </div>
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-2 hover:from-purple-700 hover:to-blue-700 transition">
                  <Crown className="w-5 h-5" />
                  Upgrade to Enterprise
                </button>
                <div className="text-xs text-gray-500 text-center">
                  Unlimited generations, priority support, and more
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
