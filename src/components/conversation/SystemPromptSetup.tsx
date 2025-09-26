import React, { useState } from 'react';
import { useConversation } from '../../contexts/ConversationContext';
import { Check } from 'lucide-react';

const presetPrompts = [
  {
    name: 'General Assistant',
    prompt: 'You are a helpful AI assistant. Have natural, friendly conversations with the user and provide helpful responses.'
  },
  {
    name: 'Travel Guide',
    prompt: 'You are a knowledgeable travel guide. Help users plan trips, recommend destinations, and provide travel tips.'
  },
  {
    name: 'Tech Support',
    prompt: 'You are a technical support specialist. Help users troubleshoot problems and provide clear technical guidance.'
  },
  {
    name: 'Language Tutor',
    prompt: 'You are a patient language tutor. Help users practice conversation and improve their language skills.'
  },
  {
    name: 'Fitness Coach',
    prompt: 'You are a supportive fitness coach. Provide workout advice, motivation, and healthy lifestyle tips.'
  }
];

export function SystemPromptSetup() {
  const { initializeSession } = useConversation();
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = isCustom ? customPrompt : presetPrompts[selectedPreset].prompt;
    initializeSession(prompt);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Setup Your AI Assistant
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preset Options */}
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Choose a Preset</h3>
          <div className="grid gap-2">
            {presetPrompts.map((preset, index) => (
              <label
                key={index}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  !isCustom && selectedPreset === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="preset"
                  checked={!isCustom && selectedPreset === index}
                  onChange={() => {
                    setSelectedPreset(index);
                    setIsCustom(false);
                  }}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  !isCustom && selectedPreset === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {!isCustom && selectedPreset === index && (
                    <Check size={12} className="text-white" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{preset.name}</div>
                  <div className="text-sm text-gray-600">{preset.prompt}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Prompt Option */}
        <div className="space-y-3">
          <label className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
            isCustom ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
          }`}>
            <input
              type="radio"
              name="preset"
              checked={isCustom}
              onChange={() => setIsCustom(true)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded-full border-2 mr-3 mt-1 flex items-center justify-center ${
              isCustom ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
            }`}>
              {isCustom && <Check size={12} className="text-white" />}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900 mb-2">Custom Prompt</div>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter your custom system prompt..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                onFocus={() => setIsCustom(true)}
              />
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isCustom && !customPrompt.trim()}
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Conversation
          </button>
        </div>
      </form>
    </div>
  );
}