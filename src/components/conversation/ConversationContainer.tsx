import React from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import { SystemPromptSetup } from './SystemPromptSetup';
import { TranscriptPanel } from './TranscriptPanel';
import { StatusIndicators } from './StatusIndicators';
import { ControlPanel } from './ControlPanel';
import { AudioVisualizer } from '../audio/AudioVisualizer';
import { useTurnTaking } from '../../hooks/useTurnTaking';

export function ConversationContainer() {
  const { state } = useConversation();
  const { updateAudioLevel } = useTurnTaking();

  if (!state.isInitialized) {
    return <SystemPromptSetup />;
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Audio Visualizer */}
      <div className="flex justify-center">
        <AudioVisualizer
          audioLevel={state.voiceActivity.audioLevel}
          isActive={state.turnTaking.isRecording || state.turnTaking.isSpeaking}
          className="shadow-md"
        />
      </div>

      {/* Status Indicators */}
      <StatusIndicators />

      {/* Transcript Panel */}
      <div className="flex-1 min-h-0">
        <TranscriptPanel />
      </div>

      {/* Control Panel */}
      <ControlPanel />

      {/* Error Display */}
      {state.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 font-medium">Error</div>
          <div className="text-red-700 text-sm">{state.error}</div>
        </div>
      )}
    </div>
  );
}