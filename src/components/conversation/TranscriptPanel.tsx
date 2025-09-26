import React, { useEffect, useRef } from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import { TranscriptMessage } from './TranscriptMessage';

export function TranscriptPanel() {
  const { state } = useConversation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.session.transcript]);

  if (state.session.transcript.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Ready to Chat</h3>
          <p className="text-sm">Start the conversation to see your transcript here</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-4 p-4 bg-white rounded-lg border border-gray-200"
    >
      {state.session.transcript.map((message) => (
        <TranscriptMessage key={message.id} message={message} />
      ))}
    </div>
  );
}