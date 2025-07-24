import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Users, Star, Building2, Sparkles, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import saveToAirtable from '../lib/airtable';

const EmailAgentDeployForm = ({ open, onClose, onSubmit }: { open: boolean, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [form, setForm] = useState({
    gmail: '',
    clientId: '',
    clientSecret: '',
    emailsListUrl: '',
    emailsCsv: null as File | null,
    emailsField: '',
    subject: '',
    body: '',
    mode: 'custom', // or 'ai'
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Deploy Email Agent</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <label className="block mb-1">Gmail <span className="text-red-600">*</span></label>
          <input className="w-full border rounded p-2" placeholder="Gmail" value={form.gmail} onChange={e => setForm(f => ({ ...f, gmail: e.target.value }))} required />
          <label className="block mb-1">Client ID <span className="text-red-600">*</span></label>
          <input className="w-full border rounded p-2" placeholder="Client ID" value={form.clientId} onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))} required />
          <input className="w-full border rounded p-2" placeholder="Client Secret" value={form.clientSecret} onChange={e => setForm(f => ({ ...f, clientSecret: e.target.value }))} />
          <div className="flex gap-2">
            <input className="flex-1 border rounded p-2" placeholder="Emails List URL" value={form.emailsListUrl} onChange={e => setForm(f => ({ ...f, emailsListUrl: e.target.value }))} />
            <input className="flex-1 border rounded p-2" placeholder="Field" value={form.emailsField} onChange={e => setForm(f => ({ ...f, emailsField: e.target.value }))} />
          </div>
          <div>
            <label className="block mb-1">Upload CSV</label>
            <input type="file" accept=".csv" onChange={e => setForm(f => ({ ...f, emailsCsv: e.target.files?.[0] || null }))} />
          </div>
          <input className="w-full border rounded p-2" placeholder="Subject" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
          <textarea className="w-full border rounded p-2" placeholder="Body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
          <div className="flex gap-2">
            <button type="button" className={`flex-1 border rounded p-2 ${form.mode === 'custom' ? 'bg-blue-100' : ''}`} onClick={() => setForm(f => ({ ...f, mode: 'custom' }))}>Custom</button>
            <button type="button" className={`flex-1 border rounded p-2 ${form.mode === 'ai' ? 'bg-blue-100' : ''}`} onClick={() => setForm(f => ({ ...f, mode: 'ai' }))}>Create with AI</button>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 font-semibold">Submit</button>
        </form>
      </div>
    </div>
  );
};

const BloggerAgentDeployForm = ({ open, onClose, onSubmit }: { open: boolean, onClose: () => void, onSubmit: (data: any) => void }) => {
  const [form, setForm] = useState({
    email: '',
    wpUsername: '',
    wpUrl: '',
    wpAppPassword: '',
    schedule: 'daily',
  });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Deploy Blogger Agent</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
          <label className="block mb-1">Email <span className="text-red-600">*</span></label>
          <input className="w-full border rounded p-2" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <label className="block mb-1">Username <span className="text-red-600">*</span></label>
          <input className="w-full border rounded p-2" placeholder="Username" value={form.wpUsername} onChange={e => setForm(f => ({ ...f, wpUsername: e.target.value }))} required />
          <label className="block mb-1">URL <span className="text-red-600">*</span></label>
          <input className="w-full border rounded p-2" placeholder="URL" value={form.wpUrl} onChange={e => setForm(f => ({ ...f, wpUrl: e.target.value }))} required />
          <label className="block mb-1">Password <span className="text-red-600">*</span></label>
          <input className="w-full border rounded p-2" placeholder="Password" value={form.wpAppPassword} onChange={e => setForm(f => ({ ...f, wpAppPassword: e.target.value }))} required />
          <label className="block mb-1">Schedule <span className="text-red-600">*</span></label>
          <select className="w-full border rounded p-2" value={form.schedule} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} required>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 text-white rounded p-2 font-semibold">Submit</button>
        </form>
      </div>
    </div>
  );
};

const Marketplace: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'nhancio' | 'partner' | 'all'>('nhancio');
  const [deployingAgent, setDeployingAgent] = useState<string | null>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailAgent, setEmailAgent] = useState<any>(null);
  const [showBloggerForm, setShowBloggerForm] = useState(false);
  const [bloggerAgent, setBloggerAgent] = useState<any>(null);

  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const fetchUserCredits = async () => {
    try {
      if (!user) return;

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

  // Fetch agents from Supabase
  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .limit(100);
        if (error) throw error;
        setAgents(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch agents');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
    fetchUserCredits();
  }, [user]);

  const getCurrentAgents = () => {
    if (activeTab === 'all') return agents;
    return agents.filter(agent => agent.category === activeTab);
  };

  const handleDeployAgent = async (agent: any) => {
    if (!user) {
      // Trigger Google sign-in for non-logged-in users
      signInWithGoogle();
      return;
    }
    if (agent.type === 'email') {
      setEmailAgent(agent);
      setShowEmailForm(true);
      return;
    }
    if (agent.type === 'blog') {
      setBloggerAgent(agent);
      setShowBloggerForm(true);
      return;
    }

    try {
      setDeployingAgent(agent.id);

      // Check if user has enough credits
      const agentCost = agent.credits || 0;
      if (userCredits < agentCost) {
        // Show alert message
        alert(`Insufficient credits! You need ${agentCost} credits to deploy "${agent.Name}", but you only have ${userCredits} credits. Redirecting to profile page to add more credits.`);

        // Redirect to profile page to add more credits
        navigate('/profile');
        return;
      }

      // Here you would implement the actual deployment logic
      // For now, we'll just show a success message
      alert(`Agent "${agent.Name}" is being deployed to your account!`);

      // Deduct credits from user account
      const { error } = await supabase
        .from('users')
        .update({ credits: userCredits - agentCost })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating credits:', error);
      } else {
        // Refresh user credits
        fetchUserCredits();
      }

      // You could also redirect to the agent builder or dashboard
      // navigate('/voice-agents');

    } catch (error) {
      console.error('Deployment failed:', error);
      alert('Failed to deploy agent. Please try again.');
    } finally {
      setDeployingAgent(null);
    }
  };

  const AgentCard = ({ agent }: { agent: any }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all group w-full">
      <div className="p-6">
        {/* Image */}
        <div className="flex items-center justify-between mb-4">
          {agent.image ? (
            <img src={agent.image} alt={agent["Name"]} className="w-16 h-16 object-cover rounded-full" />
          ) : (
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{agent["Name"]}</h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {agent.description}
        </p>

        {/* Credits and Subscribers */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-blue-700 font-medium">{agent.credits ?? '--'} credits/run</span>
          <span className="text-gray-500 text-sm">{agent["no.of_subscribers"] ?? 0} subscribers</span>
        </div>

        {/* User Credits Display */}
        {user && (
          <div className="mb-3 p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Your Credits:</span>
              <span className={`font-semibold ${userCredits >= (agent.credits || 0) ? 'text-green-600' : 'text-red-600'}`}>
                {userCredits}
              </span>
            </div>
          </div>
        )}

        {/* Tag and Type as labels */}
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.tag && (
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              {agent.tag}
            </span>
          )}
          {agent.type && (
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
              {agent.type}
            </span>
          )}
        </div>

        {/* Deploy Button */}
        <button
          onClick={() => handleDeployAgent(agent)}
          disabled={deployingAgent === agent.id}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-blue-600 hover:bg-blue-700 text-white ${deployingAgent === agent.id ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {deployingAgent === agent.id ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Deploying...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Deploy Agent
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar />
      <EmailAgentDeployForm
        open={showEmailForm}
        onClose={() => setShowEmailForm(false)}
        onSubmit={async (data) => {
          setShowEmailForm(false);
          if (!user || !emailAgent) return;
          // Debug log
          console.log('Upserting user_app_config:', {
            user_id: user.id,
            agent_id: emailAgent.id,
            agent_id_type: typeof emailAgent.id,
            agent_id_number: Number(emailAgent.id),
            agent_id_number_type: typeof Number(emailAgent.id)
          });
          const { error } = await supabase.from('user_app_config').upsert([
            {
              user_id: user.id,
              agent_id: Number(emailAgent.id), // ensure this is bigint
              config: data
            }
          ], { onConflict: 'user_id,agent_id' });
          // Save to Airtable (only user_id and agent_id for now)
          const airtablePayload = {
            user_id: user.id,
            agent_id: Number(emailAgent.id)
          };
          console.log('Airtable payload:', airtablePayload);
          saveToAirtable(airtablePayload).catch((err) => {
            console.error('Airtable save error:', err);
          });
          if (error) {
            console.error('Upsert error:', error);
            alert('Failed to save config: ' + error.message);
            return;
          }
          // Deduct credits and subscribe only after config is saved
          const agentCost = emailAgent.credits || 0;
          const { error: creditError } = await supabase.from('users')
            .update({ credits: userCredits - agentCost })
            .eq('id', user.id);
          if (creditError) {
            console.error('Credit deduction error:', creditError);
            alert('Failed to deduct credits: ' + creditError.message);
          } else {
            fetchUserCredits();
          }
          const { error: subError } = await supabase.from('user_agent_subscriptions').insert({
            user_id: user.id,
            agent_id: emailAgent.id
          });
          if (subError) {
            console.error('Subscription error:', subError);
            // Not fatal, so don't block
          }
        }}
      />
      <BloggerAgentDeployForm
        open={showBloggerForm}
        onClose={() => setShowBloggerForm(false)}
        onSubmit={async (data) => {
          setShowBloggerForm(false);
          if (!user || !bloggerAgent) return;
          // Debug log
          console.log('Upserting user_app_config:', {
            user_id: user.id,
            agent_id: bloggerAgent.id,
            agent_id_type: typeof bloggerAgent.id,
            agent_id_number: Number(bloggerAgent.id),
            agent_id_number_type: typeof Number(bloggerAgent.id)
          });
          const { error } = await supabase.from('user_app_config').upsert([
            {
              user_id: user.id,
              agent_id: Number(bloggerAgent.id), // ensure this is bigint
              config: data
            }
          ], { onConflict: 'user_id,agent_id' });
          // Save to Airtable (only user_id and agent_id for now)
          const airtablePayload = {
            user_id: user.id,
            agent_id: Number(bloggerAgent.id)
          };
          console.log('Airtable payload:', airtablePayload);
          saveToAirtable(airtablePayload).catch((err) => {
            console.error('Airtable save error:', err);
          });
          if (error) {
            console.error('Upsert error:', error);
            alert('Failed to save config: ' + error.message);
            return;
          }
          // Deduct credits and subscribe only after config is saved
          const agentCost = bloggerAgent.credits || 0;
          const { error: creditError } = await supabase.from('users')
            .update({ credits: userCredits - agentCost })
            .eq('id', user.id);
          if (creditError) {
            console.error('Credit deduction error:', creditError);
            alert('Failed to deduct credits: ' + creditError.message);
          } else {
            fetchUserCredits();
          }
          const { error: subError } = await supabase.from('user_agent_subscriptions').insert({
            user_id: user.id,
            agent_id: bloggerAgent.id
          });
          if (subError) {
            console.error('Subscription error:', subError);
            // Not fatal, so don't block
          }
        }}
      />
      <div className="w-full lg:ml-64 p-4 sm:p-8 pt-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Agent Marketplace</h1>
              <p className="text-sm sm:text-base text-gray-600">Discover and deploy pre-built AI agents for your business needs.</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('nhancio')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'nhancio'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Automations
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'partner'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Voice Agents
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              All Agents
            </button>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="w-full">
          {loading ? (
            <div className="text-center py-12 text-base">Loading agents...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-base">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
                {getCurrentAgents().map((agent) => (
                  <AgentCard key={agent.id} agent={agent} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;