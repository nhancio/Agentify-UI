import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Building, Phone } from 'lucide-react';
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
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 pt-24">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
              <div className="flex items-center space-x-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
