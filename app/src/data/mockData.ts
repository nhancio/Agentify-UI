import { User, Agent, CallLog, Integration, CallStats } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'John Smith',
  email: 'john@company.com',
  phoneNumber: '+1-555-0123',
  plan: 'Pro',
  createdAt: '2024-01-15'
};

export const mockAgent: Agent = {
  id: '1',
  name: 'Sales Assistant',
  status: 'active',
  voiceType: 'cloned',
  purpose: 'Lead qualification and appointment booking',
  jobDescription: 'Qualify incoming leads, answer product questions, and schedule demos with the sales team.',
  voiceCloning: {
    enabled: true,
    status: 'completed'
  },
  features: ['Call Recording', 'Real-time Transcription', 'CRM Integration']
};

export const mockCallLogs: CallLog[] = [
  {
    id: '1',
    dateTime: '2024-01-20 14:30:00',
    callerID: 'Sarah Johnson',
    fromNumber: '+1-555-0198',
    duration: 180,
    audioUrl: '/audio/call-1.mp3',
    transcription: 'Customer inquired about pricing and features for the Pro plan...',
    sentiment: 'positive'
  },
  {
    id: '2',
    dateTime: '2024-01-20 11:15:00',
    callerID: 'Mike Chen',
    fromNumber: '+1-555-0176',
    duration: 240,
    audioUrl: '/audio/call-2.mp3',
    transcription: 'Support request regarding integration setup...',
    sentiment: 'neutral'
  },
  {
    id: '3',
    dateTime: '2024-01-19 16:45:00',
    callerID: 'Unknown',
    fromNumber: '+1-555-0134',
    duration: 90,
    audioUrl: '/audio/call-3.mp3',
    transcription: 'Brief inquiry about service availability...',
    sentiment: 'neutral'
  }
];

export const mockIntegrations: Integration[] = [
  {
    id: '1',
    name: 'Salesforce CRM',
    type: 'CRM',
    status: 'connected',
    lastSync: '2024-01-20 10:30:00',
    config: { apiKey: 'sf_***', endpoint: 'https://api.salesforce.com' }
  },
  {
    id: '2',
    name: 'Slack Notifications',
    type: 'Webhook',
    status: 'connected',
    lastSync: '2024-01-20 14:15:00',
    config: { webhookUrl: 'https://hooks.slack.com/***' }
  },
  {
    id: '3',
    name: 'HubSpot',
    type: 'CRM',
    status: 'disconnected',
    config: {}
  }
];

export const mockCallStats: CallStats = {
  daily: 12,
  weekly: 89,
  monthly: 347,
  totalMinutes: 1520
};