/*
  # VoiceGenie AI Database Schema

  1. New Tables
    - `profiles` - User profile information
    - `agents` - AI agent configurations
    - `calls` - Call records and transcripts
    - `leads` - Generated leads from calls
    - `agent_templates` - Marketplace templates
    - `subscriptions` - User subscription plans
    - `billing_history` - Payment and billing records
    - `integrations` - Third-party service connections

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure data access based on user ownership
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'premium', 'enterprise');
CREATE TYPE agent_type AS ENUM ('voice', 'video', 'voice_video');
CREATE TYPE agent_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE call_status AS ENUM ('initiated', 'in_progress', 'completed', 'failed', 'abandoned');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  phone text,
  avatar_url text,
  subscription_plan subscription_plan DEFAULT 'free',
  twilio_phone_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  agent_type agent_type DEFAULT 'voice',
  status agent_status DEFAULT 'draft',
  voice_settings jsonb DEFAULT '{}',
  conversation_flow jsonb DEFAULT '[]',
  training_data text,
  language text DEFAULT 'en-US',
  greeting_message text,
  fallback_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  from_number text NOT NULL,
  to_number text NOT NULL,
  call_sid text UNIQUE,
  status call_status DEFAULT 'initiated',
  duration integer DEFAULT 0,
  recording_url text,
  transcript text,
  summary text,
  sentiment_score decimal(3,2),
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES calls(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text,
  email text,
  phone text,
  company text,
  interest_level integer DEFAULT 0,
  status lead_status DEFAULT 'new',
  notes text,
  follow_up_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Agent templates table (marketplace)
CREATE TABLE IF NOT EXISTS agent_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  agent_type agent_type DEFAULT 'voice',
  price decimal(10,2) DEFAULT 0,
  rating decimal(3,2) DEFAULT 0,
  download_count integer DEFAULT 0,
  template_data jsonb NOT NULL,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL,
  stripe_subscription_id text UNIQUE,
  stripe_customer_id text,
  status text DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Billing history table
CREATE TABLE IF NOT EXISTS billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text NOT NULL,
  stripe_invoice_id text,
  invoice_url text,
  billing_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_name text NOT NULL,
  service_type text NOT NULL,
  credentials jsonb NOT NULL,
  settings jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_sync timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for agents
CREATE POLICY "Users can manage own agents"
  ON agents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for calls
CREATE POLICY "Users can view calls for their agents"
  ON calls
  FOR SELECT
  TO authenticated
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert calls"
  ON calls
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for leads
CREATE POLICY "Users can manage own leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for agent_templates
CREATE POLICY "Anyone can read approved templates"
  ON agent_templates
  FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Creators can manage own templates"
  ON agent_templates
  FOR ALL
  TO authenticated
  USING (creator_id = auth.uid());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for billing_history
CREATE POLICY "Users can view own billing history"
  ON billing_history
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for integrations
CREATE POLICY "Users can manage own integrations"
  ON integrations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_agent_templates_category ON agent_templates(category);
CREATE INDEX IF NOT EXISTS idx_agent_templates_featured ON agent_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_templates_updated_at
  BEFORE UPDATE ON agent_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();