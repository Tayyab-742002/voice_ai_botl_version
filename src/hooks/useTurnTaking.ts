import { useCallback, useRef } from 'react';
import { useConversation } from '../contexts/ConversationContext';
import { useVoiceActivity } from './useVoiceActivity';
import { STTService } from '../services/sttService';
import { LLMService } from '../services/llmService';
import { TTSService } from '../services/ttsService';
import { LLMMessage } from '../services/llmService';

export function useTurnTaking() {
  const { state, addMessage, updateMessage, setTurnTakingState, setError } = useConversation();
  const servicesRef = useRef({
    stt: new STTService(),
    llm: new LLMService(),
    tts: new TTSService()
  });

  const currentMessageIdRef = useRef<string | null>(null);
  const isInterruptedRef = useRef(false);

  const { updateAudioLevel, reset: resetVoiceActivity } = useVoiceActivity({
    silenceThreshold: 1500,
    onSilenceDetected: handleSilenceDetected,
    onVoiceStart: handleVoiceStart,
    onVoiceEnd: handleVoiceEnd
  });

  function handleVoiceStart() {
    console.log('Voice activity started');
    
    // If AI is currently speaking, interrupt it
    if (state.turnTaking.currentSpeaker === 'ai' && state.turnTaking.canInterrupt) {
      console.log('Interrupting AI response');
      interruptAIResponse();
    }
    
    setTurnTakingState({
      currentSpeaker: 'user',
      isRecording: true
    });
  }

  function handleVoiceEnd() {
    console.log('Voice activity ended');
  }

  async function handleSilenceDetected() {
    console.log('Silence detected, processing user input');
    
    if (state.turnTaking.currentSpeaker === 'user' && state.turnTaking.isRecording) {
      setTurnTakingState({
        isRecording: false,
        isProcessing: true
      });

      // Stop speech recognition and process the result
      servicesRef.current.stt.stopContinuousRecognition();
    }
  }

  const interruptAIResponse = useCallback(() => {
    isInterruptedRef.current = true;
    servicesRef.current.tts.stopSpeech();
    
    setTurnTakingState({
      currentSpeaker: 'idle',
      isSpeaking: false,
      isProcessing: false
    });
  }, [setTurnTakingState]);

  const startConversation = useCallback(async () => {
    try {
      setError(undefined);
      setTurnTakingState({
        currentSpeaker: 'idle',
        isProcessing: false,
        isRecording: false,
        isSpeaking: false,
        canInterrupt: true
      });

      // Initialize STT service
      servicesRef.current.stt.setResultCallback((result) => {
        if (result.isFinal && result.text.trim()) {
          handleUserMessage(result.text.trim());
        }
      });

      servicesRef.current.stt.setErrorCallback((error) => {
        console.error('STT Error:', error);
        setError(`Speech recognition error: ${error}`);
      });

      // Start continuous speech recognition
      servicesRef.current.stt.startContinuousRecognition();
      
      console.log('Conversation started');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to start conversation');
    }
  }, [setError, setTurnTakingState]);

  const stopConversation = useCallback(() => {
    servicesRef.current.stt.stopContinuousRecognition();
    servicesRef.current.tts.stopSpeech();
    resetVoiceActivity();
    
    setTurnTakingState({
      currentSpeaker: 'idle',
      isProcessing: false,
      isRecording: false,
      isSpeaking: false,
      canInterrupt: true
    });
    
    console.log('Conversation stopped');
  }, [setTurnTakingState, resetVoiceActivity]);

  const handleUserMessage = useCallback(async (text: string) => {
    try {
      console.log('Processing user message:', text);
      
      // Add user message to transcript
      addMessage(text, 'user');
      
      setTurnTakingState({
        currentSpeaker: 'ai',
        isProcessing: true,
        isSpeaking: false
      });

      // Generate AI response
      const messages: LLMMessage[] = [
        { role: 'system', content: state.session.systemPrompt },
        ...state.session.transcript.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        })),
        { role: 'user', content: text }
      ];

      const response = await servicesRef.current.llm.generateResponse(messages);
      
      if (isInterruptedRef.current) {
        isInterruptedRef.current = false;
        return;
      }

      console.log('Generated AI response:', response.content);
      
      // Add AI message to transcript
      const messageId = addMessage(response.content, 'ai');
      currentMessageIdRef.current = messageId;

      // Convert to speech and play
      const audioBlob = await servicesRef.current.tts.synthesizeSpeech(response.content, {
        voiceId: state.session.audioSettings.voiceId,
        speed: state.session.audioSettings.speechRate
      });

      if (isInterruptedRef.current) {
        isInterruptedRef.current = false;
        return;
      }

      setTurnTakingState({
        isProcessing: false,
        isSpeaking: true
      });

      // Play the audio
      await servicesRef.current.tts.playAudio(audioBlob);

      if (!isInterruptedRef.current) {
        setTurnTakingState({
          currentSpeaker: 'idle',
          isSpeaking: false
        });
        
        // Resume listening for user input
        servicesRef.current.stt.startContinuousRecognition();
      }

    } catch (error) {
      console.error('Error processing user message:', error);
      setError(error instanceof Error ? error.message : 'Failed to process message');
      
      setTurnTakingState({
        currentSpeaker: 'idle',
        isProcessing: false,
        isSpeaking: false
      });
    }
  }, [state.session.systemPrompt, state.session.transcript, state.session.audioSettings, addMessage, setTurnTakingState, setError]);

  return {
    startConversation,
    stopConversation,
    interruptAIResponse,
    updateAudioLevel,
    isConversationActive: state.turnTaking.currentSpeaker !== 'idle' || state.turnTaking.isProcessing
  };
}