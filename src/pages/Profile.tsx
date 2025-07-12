import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Building, Phone, Zap, Crown, CheckCircle, Star, Edit, LogOut, Award, Shield, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AnimatedButton from '../components/AnimatedButton';
import FloatingElements from '../components/FloatingElements';
import TypewriterText from '../components/TypewriterText';

const mockAchievements = [
  { icon: Award, label: 'Early Adopter', color: 'yellow' },
  { icon: Star, label: 'Power User', color: 'purple' },
  { icon: Shield, label: 'Verified', color: 'blue' },
];

const mockStats = [
  { icon: TrendingUp, label: 'Activity Score', value: '92', color: 'green' },
  { icon: Users, label: 'Team Members', value: '4', color: 'blue' },
  { icon: BarChart3, label: 'Agents Created', value: '7', color: 'purple' },
];

const Profile: React.FC = () => {
  const { user, googleProfile, signOut } = useAuth();
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative overflow-x-hidden">
      <FloatingElements />
      <Sidebar />
      <main className="md:ml-64 flex-1 p-4 sm:p-8 pt-24 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <div className="col-span-1 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col items-center text-center relative overflow-hidden border border-blue-100 dark:border-blue-900/30">
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full opacity-30 pointer-events-none" />
            {googleProfile?.avatar ? (
              <img
                src={googleProfile.avatar}
                alt={googleProfile.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gradient-to-r from-blue-600 to-purple-600 shadow-lg mb-4"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-4 shadow-lg">
                {googleProfile?.name
                  ? googleProfile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : (profile?.full_name || profile?.name || 'JD').split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </div>
            )}
            <TypewriterText
              texts={[`Welcome back, ${googleProfile?.name || profile?.full_name || 'User'}!`, 'Ready to build something amazing?']}
              className="text-lg font-semibold text-gradient mb-2"
            />
            <div className="text-gray-500 mb-2">{googleProfile?.email || profile?.email}</div>
            <AnimatedButton size="md" className="w-full mt-2" icon={<Edit className="w-4 h-4" />}>Edit Profile</AnimatedButton>
            <AnimatedButton size="md" variant="secondary" className="w-full mt-2" icon={<LogOut className="w-4 h-4" />} onClick={signOut}>Sign Out</AnimatedButton>
            <AnimatedButton size="md" variant="secondary" className="w-full mt-2">Support</AnimatedButton>
          </div>

          {/* Main Widgets Column */}
          <div className="col-span-2 flex flex-col gap-8">
            {/* Stats & Achievements Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stats Widget */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" /> Your Stats
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {mockStats.map((stat, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                        <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Achievements Widget */}
              <div className="bg-gradient-to-br from-yellow-50 to-purple-50 dark:from-yellow-900/20 dark:to-purple-900/20 rounded-2xl shadow-xl p-6 border border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Achievements
                </h3>
                <div className="flex gap-4">
                  {mockAchievements.map((ach, i) => (
                    <div key={i} className={`flex flex-col items-center`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-${ach.color}-100 dark:bg-${ach.color}-900/30`}>
                        <ach.icon className={`w-6 h-6 text-${ach.color}-600 dark:text-${ach.color}-400`} />
                      </div>
                      <div className="text-xs text-gray-700 dark:text-gray-300 font-semibold text-center whitespace-nowrap">{ach.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Info & Credits Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info Card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" /> Contact Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700 dark:text-gray-200">{profile?.email || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-200">{profile?.company || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-200">{profile?.mobile_number || '-'}</span>
                  </div>
                </div>
              </div>
              {/* Credits & Billing Card */}
              <div className="bg-gradient-to-br from-yellow-50 to-blue-50 dark:from-yellow-900/20 dark:to-blue-900/20 rounded-2xl shadow-xl p-6 border border-yellow-100 dark:border-yellow-900/30 flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Credits & Billing</div>
                    <div className="text-xs text-gray-500">Manage your credits and subscription</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-black/5 dark:bg-white/5 rounded-lg p-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{profile?.credits ?? 0}</div>
                    <div className="text-xs text-gray-500">Available Credits</div>
                  </div>
                  <AnimatedButton variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition" icon={<Zap className="w-4 h-4" />}>Add Credits</AnimatedButton>
                </div>
                <AnimatedButton className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 mt-2 hover:from-purple-700 hover:to-blue-700 transition" icon={<Crown className="w-5 h-5" />}>Upgrade to Enterprise</AnimatedButton>
                <div className="text-xs text-gray-500 text-center">
                  Unlimited generations, priority support, and more
                </div>
              </div>
            </div>

            {/* Quick Actions Widget */}
            {/*
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6 mt-2">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <AnimatedButton size="md" showArrow className="w-full md:w-auto">Invite Team</AnimatedButton>
                <AnimatedButton size="md" variant="secondary" className="w-full md:w-auto">Change Password</AnimatedButton>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <AnimatedButton size="md" variant="secondary" className="w-full md:w-auto">Manage Notifications</AnimatedButton>
                <AnimatedButton size="md" variant="secondary" className="w-full md:w-auto">Support</AnimatedButton>
              </div>
            </div>
            */}
          </div>
        </div>
        {loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
              <div className="text-gray-600">Loading profile...</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Profile;
