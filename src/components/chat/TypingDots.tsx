import React from 'react';
import { Bot } from 'lucide-react';

export function TypingDots() {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <Bot className="w-4 h-4 animate-pulse" />
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}
