import React from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import { Mic, MicOff, Volume2, VolumeX, Activity, Loader2 } from 'lucide-react';

export function StatusIndicators() {
  const { state } = useConversation();
  const { turnTaking, voiceActivity } = state;

  const getStatusColor = () => {
    if (turnTaking.isProcessing) return 'text-amber-600';
    if (turnTaking.currentSpeaker === 'user') return 'text-blue-600';
    if (turnTaking.currentSpeaker === 'ai') return 'text-green-600';
    return 'text-gray-400';
  };

  const getStatusText = () => {
    if (turnTaking.isProcessing) return 'Processing...';
    if (turnTaking.currentSpeaker === 'user') return 'Listening';
    if (turnTaking.currentSpeaker === 'ai') return 'AI Speaking';
    return 'Ready';
  };

  return (
    <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Recording Status */}
      <div className="flex items-center gap-2">
        {turnTaking.isRecording ? (
          <Mic className="w-5 h-5 text-red-500 animate-pulse" />
        ) : (
          <MicOff className="w-5 h-5 text-gray-400" />
        )}
        <span className="text-sm text-gray-600">
          {turnTaking.isRecording ? 'Recording' : 'Not Recording'}
        </span>
      </div>

      {/* Speaking Status */}
      <div className="flex items-center gap-2">
        {turnTaking.isSpeaking ? (
          <Volume2 className="w-5 h-5 text-green-500 animate-pulse" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-400" />
        )}
        <span className="text-sm text-gray-600">
          {turnTaking.isSpeaking ? 'AI Speaking' : 'Silent'}
        </span>
      </div>

      {/* Processing Status */}
      <div className="flex items-center gap-2">
        {turnTaking.isProcessing ? (
          <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
        ) : (
          <Activity className="w-5 h-5 text-gray-400" />
        )}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {/* Voice Activity Level */}
      <div className="flex items-center gap-2">
        <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-100 ease-out"
            style={{ width: `${voiceActivity.audioLevel * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500">
          {Math.round(voiceActivity.audioLevel * 100)}%
        </span>
      </div>
    </div>
  );
}