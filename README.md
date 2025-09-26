# Voice AI Conversational Agent

A sophisticated React application for real-time voice conversations with AI, built with LiveKit Web SDK, OpenAI APIs, and modern web technologies.

## Features

- **Real-time Voice Conversations**: Natural turn-taking with Voice Activity Detection
- **Advanced Speech Processing**: Speech-to-Text, LLM processing, and Text-to-Speech pipeline
- **LiveKit Integration**: Professional audio streaming and session management
- **Intelligent Turn-Taking**: Interruption handling and silence detection
- **Beautiful UI**: Modern, responsive interface with real-time status indicators
- **Multiple Voice Options**: Choose from various AI voices with customizable settings
- **Session Management**: Conversation history with transcript export
- **Error Handling**: Comprehensive fallbacks and graceful degradation

## Technology Stack

- **Frontend**: React 18+ with TypeScript
- **Audio Streaming**: LiveKit Web SDK
- **Speech-to-Text**: OpenAI Whisper API + Web Speech API fallback
- **LLM**: OpenAI GPT-4/3.5-turbo
- **Text-to-Speech**: OpenAI TTS API
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key
- LiveKit server instance (optional for basic functionality)

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys:
   ```env
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_LIVEKIT_URL=wss://your-livekit-server.com
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

### Configuration

#### OpenAI API Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

#### LiveKit Setup (Optional)
1. Create a LiveKit server instance or use LiveKit Cloud
2. Add your server URL to `VITE_LIVEKIT_URL`
3. Configure API keys for token generation

## Usage

### Basic Conversation Flow

1. **Setup**: Choose a system prompt or create a custom one
2. **Start**: Click "Start Conversation" to begin listening
3. **Speak**: Talk naturally - the system detects when you're speaking
4. **AI Response**: The AI processes your input and responds with speech
5. **Continue**: The conversation continues with natural turn-taking

### Advanced Features

#### Voice Activity Detection
- Automatic detection of when you start/stop speaking
- Configurable silence threshold for turn-taking
- Real-time audio level monitoring

#### Interruption Handling
- Interrupt the AI mid-sentence by starting to speak
- Smooth transition between speakers
- No audio overlap or cutting issues

#### Audio Controls
- Multiple voice options (Alloy, Echo, Fable, Nova, etc.)
- Adjustable speech rate and volume
- Microphone mute/unmute functionality

#### Session Management
- Persistent conversation history
- Transcript export functionality
- Session analytics and metrics

## Architecture

### Component Structure
```
src/
├── components/
│   ├── audio/           # Audio visualization components
│   ├── conversation/    # Chat and transcript components
│   ├── layout/         # Header, footer, layout components
│   └── common/         # Reusable UI components
├── contexts/           # React Context providers
├── hooks/             # Custom React hooks
├── services/          # API service classes
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

### Key Services

#### LiveKitService
- Manages WebRTC connections
- Handles audio track publishing/subscribing
- Provides connection state monitoring
- Audio device management

#### STTService
- OpenAI Whisper API integration
- Web Speech API fallback
- Continuous speech recognition
- Real-time transcription

#### LLMService
- OpenAI GPT API integration
- Streaming response support
- Context management
- Error handling with retries

#### TTSService
- OpenAI TTS API integration
- Web Speech API fallback
- Multiple voice options
- Audio playback management

### Custom Hooks

#### useTurnTaking
- Manages conversation flow
- Handles turn-taking logic
- Coordinates between STT, LLM, and TTS
- Implements interruption handling

#### useVoiceActivity
- Voice Activity Detection (VAD)
- Silence threshold management
- Audio level monitoring
- Event callbacks for voice start/end

#### useLiveKit
- LiveKit connection management
- Audio track handling
- Device selection
- Connection state monitoring

## Customization

### System Prompts
Customize the AI's behavior with different system prompts:
- General Assistant
- Travel Guide
- Tech Support
- Language Tutor
- Custom prompts

### Audio Settings
- Voice selection (6 different voices)
- Speech rate (0.5x to 2.0x)
- Volume control
- Audio quality preferences

### Turn-Taking Parameters
- Silence threshold (default: 1.5 seconds)
- Voice activity threshold
- Interruption sensitivity
- Processing timeouts

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Ensure all required environment variables are set:
- `VITE_OPENAI_API_KEY`
- `VITE_LIVEKIT_URL` (if using LiveKit)
- `VITE_BACKEND_URL` (if using custom backend)

## Troubleshooting

### Common Issues

1. **Microphone permissions denied**
   - Ensure HTTPS or localhost
   - Grant microphone permissions in browser
   - Check browser compatibility

2. **API key issues**
   - Verify OpenAI API key is valid
   - Check API usage limits
   - Ensure proper environment variable setup

3. **Audio playback problems**
   - Check browser audio policies
   - Verify audio device selection
   - Test with different browsers

### Browser Compatibility
- Chrome 88+ (recommended)
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all API keys are properly configured
4. Test with a simple conversation first