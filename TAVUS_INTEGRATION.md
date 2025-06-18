# Tavus Integration Guide for VoiceGenie AI

## Overview
Tavus is integrated to provide AI video avatar capabilities for creating realistic video agents that can have real-time conversations.

## Setup Steps

### 1. Get Tavus API Key
1. Sign up at [Tavus.io](https://tavus.io)
2. Go to your dashboard and get your API key
3. Add to your `.env` file:
```env
VITE_TAVUS_API_KEY=your_tavus_api_key_here
VITE_TAVUS_REPLICA_ID=your_default_replica_id
```

### 2. Create Your First Replica
1. In Tavus dashboard, go to "Replicas"
2. Upload a training video (2-5 minutes of you speaking)
3. Wait for processing (usually 10-30 minutes)
4. Copy the replica ID to your `.env` file

### 3. Features Implemented

#### Video Agent Builder (`/video-agents`)
- Create and configure video agents
- Select from available replicas
- Configure conversation settings
- Test agents with live conversations

#### Tavus Service (`src/lib/tavus.ts`)
- Complete API wrapper for Tavus
- Replica management
- Conversation creation and management
- Persona configuration

#### Video Agent Components
- `VideoAgentBuilder` - Full builder interface
- `VideoAgentCard` - Agent display and controls
- `VideoAgents` page - Management dashboard

### 4. How It Works

1. **Create Replica**: Upload training video to Tavus
2. **Build Agent**: Configure personality and conversation flow
3. **Start Conversation**: Creates live video session
4. **Real-time Chat**: Users interact with AI video avatar
5. **Analytics**: Track conversation metrics

### 5. Conversation Flow

```javascript
// Start a conversation
const conversation = await tavusService.createConversation({
  replica_id: 'your-replica-id',
  conversation_name: 'Customer Support',
  properties: {
    max_call_duration: 1800, // 30 minutes
    enable_recording: true,
    enable_transcription: true,
    language: 'en'
  }
});

// Opens in new window for user interaction
window.open(conversation.streamUrl, '_blank');
```

### 6. Predefined Personas

The integration includes ready-to-use personas:
- **HR Interviewer**: Professional candidate screening
- **Hotel Concierge**: Hospitality and booking assistance  
- **Sales Agent**: Lead qualification and demos
- **Customer Support**: Help desk and issue resolution

### 7. Integration Points

#### With Existing System
- Video agents stored in same `agents` table
- Uses `agent_type: 'video'` or `'voice_video'`
- Replica ID stored in `voice_settings` JSON field
- Same authentication and user management

#### Navigation
- Added "Video Agents" to sidebar
- Accessible at `/video-agents` route
- Integrated with existing dashboard

### 8. Cost Considerations

Tavus pricing (as of 2024):
- Replica creation: ~$50-100 per replica
- Conversation minutes: ~$0.10-0.30 per minute
- Consider implementing usage limits and billing integration

### 9. Next Steps

1. **Set up Tavus account** and get API key
2. **Create your first replica** with training video
3. **Test the integration** by creating a video agent
4. **Configure webhooks** for conversation events (optional)
5. **Add billing integration** for usage tracking

### 10. Troubleshooting

**Common Issues:**
- **"No replica configured"**: Add replica ID to agent settings
- **"Failed to start conversation"**: Check API key and replica status
- **Replica not ready**: Wait for processing to complete in Tavus dashboard

**Debug Steps:**
1. Verify API key in `.env` file
2. Check replica status in Tavus dashboard
3. Ensure replica ID is correctly configured
4. Check browser console for detailed errors

The integration is now complete and ready for use! Users can create sophisticated video agents that provide natural, face-to-face interactions for various business use cases.