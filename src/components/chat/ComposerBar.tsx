import React, { useState, useRef } from 'react';
import { useChatSession, addUserMsg } from '../../state/chatSession';
import { useChat } from '../../state/ChatProvider';

export function ComposerBar() {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { inflight } = useChatSession();
  const { api } = useChat();

  const parseIntent = (input: string) => {
    const lower = input.toLowerCase();
    
    // Extract percentage targets
    const percentMatch = lower.match(/(\d+(?:\.\d+)?)\s*%/);
    const percentageTarget = percentMatch ? parseFloat(percentMatch[1]) * 100 : undefined; // Convert to bps
    
    // Extract SOL amounts
    const solMatch = lower.match(/(\d+(?:\.\d+)?)\s*sol/);
    const solAmount = solMatch ? parseFloat(solMatch[1]) : undefined;
    
    if (lower.includes('yield') || lower.includes('farm') || percentMatch) {
      return { type: 'yield', targetBps: percentageTarget || 5000 }; // Default 50%
    } else if (lower.includes('deposit')) {
      return { type: 'deposit', targetBps: 1500 }; // Default 15% for deposits
    } else if (lower.includes('withdraw')) {
      return { type: 'withdraw' };
    } else if (lower.includes('borrow')) {
      return { type: 'borrow' };
    } else {
      return { type: 'unknown' };
    }
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || inflight) return;

    console.info('[INPUT_PARSE]', trimmed);

    // Add user message IMMEDIATELY
    addUserMsg(trimmed);
    setInputValue('');

    try {
      // Parse intent and route
      const intent = parseIntent(trimmed);
      console.info('[INPUT_INTENT]', intent);
      
      switch (intent.type) {
        case 'yield':
        case 'deposit':
          await api.startYieldFlow(intent.targetBps);
          break;
          
        case 'withdraw':
          await api.withdrawNow();
          break;
          
        case 'borrow':
          const { addBotMsg } = await import('../../state/chatSession');
          addBotMsg('Borrowing features are coming soon! Try yield farming instead.');
          break;
          
        default:
          // Default response
          setTimeout(async () => {
            const { addBotMsg } = await import('../../state/chatSession');
            addBotMsg('I can help you with yield farming, deposits, and withdrawals. What would you like to do?');
          }, 500);
      }
    } catch (error: any) {
      console.error('[INPUT_ERROR]', { input: trimmed, error: error.message });
      const { addBotMsg } = await import('../../state/chatSession');
      addBotMsg(`Error: ${error.message}`);
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
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about yield strategies, deposits, withdrawals…"
          className="chat-input"
          disabled={!!inflight}
        />
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || !!inflight}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
}