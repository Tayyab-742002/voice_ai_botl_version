import React from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import { Mic, WifiOff, Wifi } from 'lucide-react';

export function Header() {
  const { state } = useConversation();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Voice AI Assistant
              </h1>
              <p className="text-sm text-gray-500">
                Powered by LiveKit & OpenAI
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <Wifi className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Connected</span>
            </div>

            {/* Session Info */}
            {state.isInitialized && (
              <div className="text-sm text-gray-600">
                Session: {state.session.sessionId.slice(0, 8)}...
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}