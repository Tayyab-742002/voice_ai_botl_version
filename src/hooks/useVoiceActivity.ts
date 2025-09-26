import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceActivityState } from '../types';

interface UseVoiceActivityOptions {
  silenceThreshold?: number; // milliseconds
  voiceThreshold?: number; // audio level threshold (0-1)
  onSilenceDetected?: () => void;
  onVoiceStart?: () => void;
  onVoiceEnd?: () => void;
}

export function useVoiceActivity(options: UseVoiceActivityOptions = {}) {
  const {
    silenceThreshold = 1500,
    voiceThreshold = 0.1,
    onSilenceDetected,
    onVoiceStart,
    onVoiceEnd
  } = options;

  const [state, setState] = useState<VoiceActivityState>({
    isVoiceActive: false,
    audioLevel: 0
  });

  const silenceTimerRef = useRef<NodeJS.Timeout>();
  const wasVoiceActiveRef = useRef(false);

  const updateAudioLevel = useCallback((level: number) => {
    const isVoiceActive = level > voiceThreshold;
    
    setState(prev => ({
      ...prev,
      audioLevel: level,
      isVoiceActive
    }));

    // Handle voice activity changes
    if (isVoiceActive && !wasVoiceActiveRef.current) {
      // Voice started
      wasVoiceActiveRef.current = true;
      onVoiceStart?.();
      
      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = undefined;
      }
    } else if (!isVoiceActive && wasVoiceActiveRef.current) {
      // Voice ended, start silence timer
      wasVoiceActiveRef.current = false;
      onVoiceEnd?.();
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      silenceTimerRef.current = setTimeout(() => {
        onSilenceDetected?.();
        setState(prev => ({ ...prev, silenceStartTime: Date.now() }));
      }, silenceThreshold);
    }
  }, [voiceThreshold, silenceThreshold, onSilenceDetected, onVoiceStart, onVoiceEnd]);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = undefined;
    }
    
    wasVoiceActiveRef.current = false;
    setState({
      isVoiceActive: false,
      audioLevel: 0
    });
  }, []);

  return {
    ...state,
    updateAudioLevel,
    reset
  };
}