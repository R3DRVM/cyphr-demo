import React, { useState } from 'react';
import { ChatMsg } from '../../state/chatSession';
import { formatTimestamp } from '../../utils/txUi';

interface ConversationalBubbleProps {
  message: ChatMsg;
  onChipClick?: (action: string, payload?: any) => void;
}

export function ConversationalBubble({ message, onChipClick }: ConversationalBubbleProps) {
  const { role, kind, text, chips, hash, ts } = message;
  const isBot = role === 'bot';
  const [chipsHidden, setChipsHidden] = useState(false);
  
  const handleChipClick = async (chip: any) => {
    console.info('[CHIP_CLICK]', chip.action, chip.payload);
    
    // Hide chips immediately after click for better UX
    setChipsHidden(true);
    
    // Call the handler
    if (onChipClick) {
      try {
        await onChipClick(chip.action, chip.payload);
      } catch (error: any) {
        console.error('[CHIP_ERROR]', { action: chip.action, error: error.message });
        // Show chips again if there was an error
        setChipsHidden(false);
      }
    }
  };

  return (
    <div className={`message-row ${role}`}>
      {/* Bot avatar */}
      {isBot && (
        <div className="bot-avatar">
          <span className="avatar-icon">🤖</span>
        </div>
      )}
      
      <div className="message-content">
        {/* Text content */}
        {text && (
          <div className="message-text">
            {text}
          </div>
        )}
        
        {/* Transaction hash */}
        {kind === 'hash' && hash && (
          <div className="message-hash">
            <span className="hash-text">{text}</span>
            <code className="hash-sig">{hash.short}</code>
            <a 
              href={hash.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hash-link"
            >
              (View)
            </a>
            <span className={`hash-status status-${hash.status}`}>
              · Status: {hash.status}
            </span>
          </div>
        )}
        
        {/* Chips - hide after click */}
        {kind === 'chips' && chips && chips.length > 0 && !chipsHidden && (
          <div className="message-chips">
            {chips.map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleChipClick(chip)}
                className="chip-button"
                tabIndex={0}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
        
        {/* Timestamp */}
        <div className="message-timestamp">
          {formatTimestamp(ts)}
        </div>
      </div>
    </div>
  );
}