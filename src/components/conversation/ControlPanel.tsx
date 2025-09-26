import React, { useState } from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import { useTurnTaking } from '../../hooks/useTurnTaking';
import { Mic, MicOff, Settings, Play, Square } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function ControlPanel() {
  const { state, setAudioConfig, resetSession } = useConversation();
  const { startConversation, stopConversation, isConversationActive } = useTurnTaking();
  const [showSettings, setShowSettings] = useState(false);

  const handleStartStop = async () => {
    if (isConversationActive) {
      stopConversation();
    } else {
      await startConversation();
    }
  };

  const handleReset = () => {
    stopConversation();
    resetSession();
  };

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <div className="flex items-center justify-center gap-4 p-6 bg-white rounded-lg border border-gray-200">
        {/* Start/Stop Button */}
        <button
          onClick={handleStartStop}
          disabled={state.turnTaking.isProcessing}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            isConversationActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {state.turnTaking.isProcessing ? (
            <LoadingSpinner size="sm" className="border-white border-t-transparent" />
          ) : isConversationActive ? (
            <Square size={18} />
          ) : (
            <Play size={18} />
          )}
          <span>
            {state.turnTaking.isProcessing
              ? 'Processing...'
              : isConversationActive
              ? 'Stop Conversation'
              : 'Start Conversation'
            }
          </span>
        </button>

        {/* Microphone Toggle */}
        <button
          onClick={() => {/* TODO: Toggle mic mute */}}
          className={`p-3 rounded-lg transition-colors ${
            state.turnTaking.isRecording
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          title={state.turnTaking.isRecording ? 'Mute Microphone' : 'Unmute Microphone'}
        >
          {state.turnTaking.isRecording ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 bg-white rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Audio Settings</h3>
          
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <select
              value={state.session.audioSettings.voiceId || 'alloy'}
              onChange={(e) => setAudioConfig({ voiceId: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="alloy">Alloy (Neutral)</option>
              <option value="echo">Echo (Male)</option>
              <option value="fable">Fable (Neutral)</option>
              <option value="onyx">Onyx (Male)</option>
              <option value="nova">Nova (Female)</option>
              <option value="shimmer">Shimmer (Female)</option>
            </select>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Rate: {state.session.audioSettings.speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={state.session.audioSettings.speechRate}
              onChange={(e) => setAudioConfig({ speechRate: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Volume: {Math.round(state.session.audioSettings.volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={state.session.audioSettings.volume}
              onChange={(e) => setAudioConfig({ volume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Reset Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}