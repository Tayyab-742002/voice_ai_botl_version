import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Message, ConversationSession, TurnTakingState, VoiceActivityState, AudioConfig } from '../types';

interface ConversationState {
  session: ConversationSession;
  turnTaking: TurnTakingState;
  voiceActivity: VoiceActivityState;
  error?: string;
  isInitialized: boolean;
}

type ConversationAction =
  | { type: 'INITIALIZE_SESSION'; payload: { sessionId: string; systemPrompt: string } }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'SET_TURN_TAKING_STATE'; payload: Partial<TurnTakingState> }
  | { type: 'SET_VOICE_ACTIVITY'; payload: Partial<VoiceActivityState> }
  | { type: 'SET_AUDIO_CONFIG'; payload: Partial<AudioConfig> }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'RESET_SESSION' };

const initialAudioConfig: AudioConfig = {
  speechRate: 1.0,
  volume: 0.8,
  voiceId: 'alloy'
};

const initialTurnTakingState: TurnTakingState = {
  currentSpeaker: 'idle',
  isProcessing: false,
  isRecording: false,
  isSpeaking: false,
  canInterrupt: true
};

const initialVoiceActivityState: VoiceActivityState = {
  isVoiceActive: false,
  audioLevel: 0
};

const initialState: ConversationState = {
  session: {
    sessionId: '',
    systemPrompt: 'You are a helpful AI assistant. Have natural conversations with the user.',
    isActive: false,
    transcript: [],
    audioSettings: initialAudioConfig
  },
  turnTaking: initialTurnTakingState,
  voiceActivity: initialVoiceActivityState,
  isInitialized: false
};

function conversationReducer(state: ConversationState, action: ConversationAction): ConversationState {
  switch (action.type) {
    case 'INITIALIZE_SESSION':
      return {
        ...state,
        session: {
          ...state.session,
          sessionId: action.payload.sessionId,
          systemPrompt: action.payload.systemPrompt,
          isActive: false
        },
        isInitialized: true,
        error: undefined
      };

    case 'ADD_MESSAGE':
      return {
        ...state,
        session: {
          ...state.session,
          transcript: [...state.session.transcript, action.payload]
        }
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        session: {
          ...state.session,
          transcript: state.session.transcript.map(msg =>
            msg.id === action.payload.id ? { ...msg, ...action.payload.updates } : msg
          )
        }
      };

    case 'SET_TURN_TAKING_STATE':
      return {
        ...state,
        turnTaking: { ...state.turnTaking, ...action.payload }
      };

    case 'SET_VOICE_ACTIVITY':
      return {
        ...state,
        voiceActivity: { ...state.voiceActivity, ...action.payload }
      };

    case 'SET_AUDIO_CONFIG':
      return {
        ...state,
        session: {
          ...state.session,
          audioSettings: { ...state.session.audioSettings, ...action.payload }
        }
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    case 'RESET_SESSION':
      return {
        ...initialState,
        isInitialized: true
      };

    default:
      return state;
  }
}

interface ConversationContextType {
  state: ConversationState;
  dispatch: React.Dispatch<ConversationAction>;
  addMessage: (content: string, sender: 'user' | 'ai') => string;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setTurnTakingState: (updates: Partial<TurnTakingState>) => void;
  setVoiceActivity: (updates: Partial<VoiceActivityState>) => void;
  setAudioConfig: (updates: Partial<AudioConfig>) => void;
  setError: (error: string | undefined) => void;
  initializeSession: (systemPrompt: string) => void;
  resetSession: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  const addMessage = (content: string, sender: 'user' | 'ai'): string => {
    const message: Message = {
      id: crypto.randomUUID(),
      content,
      sender,
      timestamp: new Date(),
      isProcessing: sender === 'ai' && content === ''
    };
    dispatch({ type: 'ADD_MESSAGE', payload: message });
    return message.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  };

  const setTurnTakingState = (updates: Partial<TurnTakingState>) => {
    dispatch({ type: 'SET_TURN_TAKING_STATE', payload: updates });
  };

  const setVoiceActivity = (updates: Partial<VoiceActivityState>) => {
    dispatch({ type: 'SET_VOICE_ACTIVITY', payload: updates });
  };

  const setAudioConfig = (updates: Partial<AudioConfig>) => {
    dispatch({ type: 'SET_AUDIO_CONFIG', payload: updates });
  };

  const setError = (error: string | undefined) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const initializeSession = (systemPrompt: string) => {
    const sessionId = crypto.randomUUID();
    dispatch({ 
      type: 'INITIALIZE_SESSION', 
      payload: { sessionId, systemPrompt } 
    });
  };

  const resetSession = () => {
    dispatch({ type: 'RESET_SESSION' });
  };

  return (
    <ConversationContext.Provider value={{
      state,
      dispatch,
      addMessage,
      updateMessage,
      setTurnTakingState,
      setVoiceActivity,
      setAudioConfig,
      setError,
      initializeSession,
      resetSession
    }}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}