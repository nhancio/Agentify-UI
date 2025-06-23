export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  plan: 'Free' | 'Pro' | 'Video Agent';
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  voiceType: 'male' | 'female' | 'cloned';
  purpose: string;
  jobDescription: string;
  voiceCloning: {
    enabled: boolean;
    status: 'pending' | 'processing' | 'completed' | 'failed';
  };
  features: string[];
}

export interface CallLog {
  id: string;
  dateTime: string;
  callerID: string;
  fromNumber: string;
  duration: number;
  audioUrl: string;
  transcription: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Integration {
  id: string;
  name: string;
  type: 'CRM' | 'Webhook' | 'API';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  config: Record<string, any>;
}

export interface CallStats {
  daily: number;
  weekly: number;
  monthly: number;
  totalMinutes: number;
}