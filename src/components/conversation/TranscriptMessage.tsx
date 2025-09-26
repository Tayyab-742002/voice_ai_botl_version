import React from 'react';
import { Message } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { User, Bot } from 'lucide-react';

interface TranscriptMessageProps {
  message: Message;
}

export function TranscriptMessage({ message }: TranscriptMessageProps) {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-blue-50' : 'bg-gray-50'} rounded-lg`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-gray-600'
      }`}>
        {isUser ? (
          <User size={16} className="text-white" />
        ) : (
          <Bot size={16} className="text-white" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-sm font-medium ${
            isUser ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {isUser ? 'You' : 'AI Assistant'}
          </h4>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="text-sm text-gray-800">
          {message.isProcessing ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner size="sm" />
              <span className="text-gray-500">Processing...</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
        </div>
      </div>
    </div>
  );
}