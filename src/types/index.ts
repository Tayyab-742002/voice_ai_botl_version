export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isProcessing?: boolean;
  audioUrl?: string;
}

export interface ConversationSession {
  sessionId: string;
  systemPrompt: string;
  isActive: boolean;
  transcript: Message[];
  audioSettings: AudioConfig;
}

export interface AudioConfig {
  inputDeviceId?: string;
  outputDeviceId?: string;
  voiceId?: string;
  speechRate: number;
  volume: number;
}

export interface TurnTakingState {
  currentSpeaker: 'user' | 'ai' | 'idle';
  isProcessing: boolean;
  isRecording: boolean;
  isSpeaking: boolean;
  canInterrupt: boolean;
}

export interface VoiceActivityState {
  isVoiceActive: boolean;
  silenceStartTime?: number;
  audioLevel: number;
}

export interface LiveKitState {
  room: any;
  isConnected: boolean;
  connectionState: string;
  participants: any[];
  localAudioTrack?: any;
  remoteAudioTrack?: any;
}

export interface APIError {
  message: string;
  code?: string;
  retry?: boolean;
}