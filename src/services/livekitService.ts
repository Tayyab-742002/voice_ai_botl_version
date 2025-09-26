import { Room, RoomEvent, Track, LocalAudioTrack, RemoteAudioTrack, ConnectionState, RoomOptions } from 'livekit-client';

export class LiveKitService {
  private room: Room | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private onConnectionStateChange?: (state: ConnectionState) => void;
  private onTrackReceived?: (track: RemoteAudioTrack) => void;
  private onAudioLevelUpdate?: (level: number) => void;

  constructor() {
    this.room = new Room();
    this.setupRoomEvents();
  }

  private setupRoomEvents() {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      console.log('Connected to room');
      this.onConnectionStateChange?.(ConnectionState.Connected);
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from room');
      this.onConnectionStateChange?.(ConnectionState.Disconnected);
    });

    this.room.on(RoomEvent.Reconnecting, () => {
      console.log('Reconnecting to room');
      this.onConnectionStateChange?.(ConnectionState.Reconnecting);
    });

    this.room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log('Audio track received from', participant.identity);
        this.onTrackReceived?.(track as RemoteAudioTrack);
      }
    });

    this.room.on(RoomEvent.LocalTrackPublished, (publication) => {
      console.log('Local track published:', publication.trackSid);
    });

    this.room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
      console.log('Audio playback status changed');
    });
  }

  async connect(url: string, token: string): Promise<void> {
    if (!this.room) throw new Error('Room not initialized');

    try {
      await this.room.connect(url, token, {
        autoSubscribe: true,
        publishDefaults: {
          audioPreset: {
            maxBitrate: 64000,
          },
        },
      } as RoomOptions);
    } catch (error) {
      console.error('Failed to connect to room:', error);
      throw new Error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.stop();
      this.localAudioTrack = null;
    }
    
    if (this.room) {
      await this.room.disconnect();
    }
  }

  async enableMicrophone(deviceId?: string): Promise<void> {
    if (!this.room) throw new Error('Room not connected');

    try {
      this.localAudioTrack = await LocalAudioTrack.createMicrophoneTrack({
        deviceId,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });

      await this.room.localParticipant.publishTrack(this.localAudioTrack);
      
      // Start monitoring audio levels
      this.startAudioLevelMonitoring();
    } catch (error) {
      console.error('Failed to enable microphone:', error);
      throw new Error(`Microphone access failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disableMicrophone(): Promise<void> {
    if (this.localAudioTrack) {
      await this.localAudioTrack.stop();
      this.localAudioTrack = null;
    }
  }

  private startAudioLevelMonitoring() {
    if (!this.localAudioTrack) return;

    const analyser = this.localAudioTrack.getAnalyser();
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (!this.localAudioTrack) return;
      
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedLevel = average / 255;
      
      this.onAudioLevelUpdate?.(normalizedLevel);
      
      requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  }

  setConnectionStateCallback(callback: (state: ConnectionState) => void) {
    this.onConnectionStateChange = callback;
  }

  setTrackReceivedCallback(callback: (track: RemoteAudioTrack) => void) {
    this.onTrackReceived = callback;
  }

  setAudioLevelCallback(callback: (level: number) => void) {
    this.onAudioLevelUpdate = callback;
  }

  getConnectionState(): ConnectionState {
    return this.room?.state || ConnectionState.Disconnected;
  }

  isConnected(): boolean {
    return this.room?.state === ConnectionState.Connected;
  }

  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput');
  }
}