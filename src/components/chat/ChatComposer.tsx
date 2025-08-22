import React, { useState } from 'react';

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({ 
  onSendMessage, 
  disabled = false,
  placeholder = "Ask me about yield strategies, deposits, withdrawals..."
}) => {
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = () => {
    if (inputMessage.trim() && !disabled) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-composer">
      <div className="composer-input">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="chat-input"
        />
        <button 
          onClick={handleSend} 
          disabled={disabled || !inputMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};
