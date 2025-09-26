import axios from 'axios';

export interface STTResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export class STTService {
  private recognition: any = null;
  private isWebSpeechSupported = false;
  private onResult?: (result: STTResult) => void;
  private onError?: (error: string) => void;

  constructor() {
    this.initializeWebSpeechAPI();
  }

  private initializeWebSpeechAPI() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          this.onResult?.({
            text: finalTranscript,
            confidence: event.results[event.results.length - 1][0].confidence || 0.9,
            isFinal: true
          });
        } else if (interimTranscript) {
          this.onResult?.({
            text: interimTranscript,
            confidence: 0.5,
            isFinal: false
          });
        }
      };
      
      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.onError?.(event.error);
      };
      
      this.recognition.onend = () => {
        console.log('Speech recognition ended');
      };
      
      this.isWebSpeechSupported = true;
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Try OpenAI Whisper API first (requires backend endpoint)
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('model', 'whisper-1');
      
      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.text;
    } catch (error) {
      console.warn('OpenAI Whisper API failed, falling back to Web Speech API');
      throw new Error('Transcription service unavailable');
    }
  }

  startContinuousRecognition(): void {
    if (!this.isWebSpeechSupported) {
      this.onError?.('Speech recognition not supported');
      return;
    }
    
    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      this.onError?.('Failed to start speech recognition');
    }
  }

  stopContinuousRecognition(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  setResultCallback(callback: (result: STTResult) => void) {
    this.onResult = callback;
  }

  setErrorCallback(callback: (error: string) => void) {
    this.onError = callback;
  }

  isSupported(): boolean {
    return this.isWebSpeechSupported;
  }
}