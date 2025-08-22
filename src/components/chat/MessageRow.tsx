import React from 'react';
import { ChatMsg } from '../../types/chat';
import { shortSig, explorerUrl, formatWalletDelta } from '../../utils/chatFormat';

interface MessageRowProps {
  message: ChatMsg;
  onChipClick?: (value: string | number) => void;
}

export const MessageRow: React.FC<MessageRowProps> = ({ message, onChipClick }) => {
  const renderMessage = () => {
    switch (message.kind) {
      case 'line':
        return (
          <div className="message-line">
            {message.text}
          </div>
        );
        
      case 'hash':
        return (
          <div className="message-hash">
            <span className="hash-label">{message.label}</span>
            <span className="hash-sig">… {shortSig(message.sig)} (View)</span>
            <span className={`hash-status ${message.status}`}>· Status: {message.status}</span>
            {message.delta && (
              <div className="wallet-delta">
                {formatWalletDelta(message.delta.pre, message.delta.post)}
              </div>
            )}
          </div>
        );
        
      case 'chips':
        return (
          <div className="message-chips">
            <div className="chips-container">
              {message.options.map((option) => (
                <button
                  key={option.id}
                  className="chip-button"
                  onClick={() => {
                    // Extract value from option.id or label
                    let value: string | number = option.id;
                    
                    // Try to parse numeric values
                    if (!isNaN(Number(option.id))) {
                      value = Number(option.id);
                    } else if (option.id === 'custom') {
                      value = 'custom';
                    } else if (option.id === 'withdraw_all') {
                      value = 'withdraw_all';
                    } else if (option.id === 'run_again') {
                      value = 'run_again';
                    } else if (option.id === 'change_target') {
                      value = 'change_target';
                    }
                    
                    if (onChipClick) {
                      onChipClick(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      // Extract value from option.id or label
                      let value: string | number = option.id;
                      
                      // Try to parse numeric values
                      if (!isNaN(Number(option.id))) {
                        value = Number(option.id);
                      } else if (option.id === 'yes') {
                        value = 'yes';
                      } else if (option.id === 'no') {
                        value = 'no';
                      }
                      
                      if (onChipClick) {
                        onChipClick(value);
                      }
                    }
                  }}
                  tabIndex={0}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="message-row">
      <div className="message-timestamp">
        {new Date(message.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="message-content">
        {renderMessage()}
      </div>
    </div>
  );
};
