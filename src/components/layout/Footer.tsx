import React from 'react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            Voice AI Conversational Agent - Built with React, LiveKit & OpenAI
          </div>
          <div className="flex items-center space-x-4">
            <span>Real-time Audio Processing</span>
            <span>•</span>
            <span>Natural Conversations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}