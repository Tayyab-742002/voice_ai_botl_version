import axios from 'axios';

export interface TTSOptions {
  voiceId?: string;
  speed?: number;
  pitch?: number;
}

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: string;
}

export class TTSService {
  private apiKey: string;
  private baseURL: string;
  private speechSynthesis: SpeechSynthesis | null = null;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseURL = baseURL || 'https://api.openai.com/v1';
    this.speechSynthesis = window.speechSynthesis || null;
  }

  async synthesizeSpeech(text: string, options: TTSOptions = {}): Promise<Blob> {
    if (this.apiKey) {
      return this.synthesizeWithOpenAI(text, options);
    } else {
      return this.synthesizeWithWebAPI(text, options);
    }
  }

  private async synthesizeWithOpenAI(text: string, options: TTSOptions): Promise<Blob> {
    try {
      const response = await axios.post(
        `${this.baseURL}/audio/speech`,
        {
          model: 'tts-1',
          input: text,
          voice: options.voiceId || 'alloy',
          speed: options.speed || 1.0,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      console.error('OpenAI TTS API error:', error);
      throw new Error('TTS service unavailable');
    }
  }

  private async synthesizeWithWebAPI(text: string, options: TTSOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed || 1.0;
      utterance.pitch = options.pitch || 1.0;
      
      // Find voice by ID or use default
      const voices = this.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === options.voiceId) || voices[0];
      if (voice) {
        utterance.voice = voice;
      }

      // Create audio context to capture speech
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(destination.stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };

      utterance.onstart = () => {
        mediaRecorder.start();
      };

      utterance.onend = () => {
        setTimeout(() => mediaRecorder.stop(), 100);
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.speechSynthesis.speak(utterance);
    });
  }

  async playAudio(audioBlob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.src = url;
      audio.onloadeddata = () => {
        audio.play().then(resolve).catch(reject);
      };
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback failed'));
      };
    });
  }

  getAvailableVoices(): Voice[] {
    if (this.apiKey) {
      // OpenAI TTS voices
      return [
        { id: 'alloy', name: 'Alloy', language: 'en-US', gender: 'neutral' },
        { id: 'echo', name: 'Echo', language: 'en-US', gender: 'male' },
        { id: 'fable', name: 'Fable', language: 'en-US', gender: 'neutral' },
        { id: 'onyx', name: 'Onyx', language: 'en-US', gender: 'male' },
        { id: 'nova', name: 'Nova', language: 'en-US', gender: 'female' },
        { id: 'shimmer', name: 'Shimmer', language: 'en-US', gender: 'female' },
      ];
    } else if (this.speechSynthesis) {
      // Web Speech API voices
      return this.speechSynthesis.getVoices().map(voice => ({
        id: voice.name,
        name: voice.name,
        language: voice.lang,
        gender: voice.name.toLowerCase().includes('female') ? 'female' : 'male',
      }));
    }
    
    return [];
  }

  stopSpeech(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
}