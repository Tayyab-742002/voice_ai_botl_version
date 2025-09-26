import { useState, useEffect, useRef } from 'react';
import { ConnectionState } from 'livekit-client';
import { LiveKitService } from '../services/livekitService';
import { LiveKitState } from '../types';

export function useLiveKit() {
  const [state, setState] = useState<LiveKitState>({
    room: null,
    isConnected: false,
    connectionState: ConnectionState.Disconnected,
    participants: [],
    localAudioTrack: undefined,
    remoteAudioTrack: undefined,
  });

  const livekitServiceRef = useRef<LiveKitService>();
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    const service = new LiveKitService();
    livekitServiceRef.current = service;

    service.setConnectionStateCallback((connectionState) => {
      setState(prev => ({
        ...prev,
        connectionState,
        isConnected: connectionState === ConnectionState.Connected
      }));
    });

    service.setAudioLevelCallback(setAudioLevel);

    return () => {
      service.disconnect();
    };
  }, []);

  const connect = async (url: string, token: string) => {
    if (!livekitServiceRef.current) throw new Error('LiveKit service not initialized');
    
    try {
      await livekitServiceRef.current.connect(url, token);
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    if (livekitServiceRef.current) {
      await livekitServiceRef.current.disconnect();
    }
  };

  const enableMicrophone = async (deviceId?: string) => {
    if (!livekitServiceRef.current) throw new Error('LiveKit service not initialized');
    
    try {
      await livekitServiceRef.current.enableMicrophone(deviceId);
    } catch (error) {
      console.error('Failed to enable microphone:', error);
      throw error;
    }
  };

  const disableMicrophone = async () => {
    if (livekitServiceRef.current) {
      await livekitServiceRef.current.disableMicrophone();
    }
  };

  const getAudioDevices = async () => {
    if (!livekitServiceRef.current) return [];
    return livekitServiceRef.current.getAudioDevices();
  };

  return {
    ...state,
    audioLevel,
    connect,
    disconnect,
    enableMicrophone,
    disableMicrophone,
    getAudioDevices,
    isConnected: state.isConnected,
  };
}