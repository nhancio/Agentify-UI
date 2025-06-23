import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CallLogs } from './components/CallLogs';
import { AgentSetup } from './components/AgentSetup';
import { AudioStorage } from './components/AudioStorage';
import { Integrations } from './components/Integrations';
import { Billing } from './components/Billing';
import { Settings } from './components/Settings';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import { UserDetailsModal } from './components/UserDetailsModal';
import supabase from './utils/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (user?.email) {
        const { data } = await supabase.from('users').select('id').eq('email', user.email).single();
        setShowModal(!data);
      }
    };
    checkUserProfile();
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'calls':
        return <CallLogs />;
      case 'agent':
        return <AgentSetup />;
      case 'storage':
        return <AudioStorage />;
      case 'integrations':
        return <Integrations />;
      case 'billing':
        return <Billing />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login />;
  }

  if (showModal && user?.email) {
    return <UserDetailsModal email={user.email} onSuccess={() => setShowModal(false)} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;