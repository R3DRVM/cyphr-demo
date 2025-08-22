import React, { useEffect, useRef } from 'react';
import { useChatSession, addBotMsg } from '../../state/chatSession';
import { ConversationalBubble } from './ConversationalBubble';
import { WelcomeTiles } from './WelcomeTiles';
import { useChat } from '../../state/ChatProvider';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function ChatStream() {
  const { msgs, pending, checkTTL, yieldSession } = useChatSession();
  const { api } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // Smooth scroll to bottom with a slight delay for better UX
      setTimeout(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }, 50);
    }
  }, [msgs.length]);

  // Check TTL on mount and periodically
  useEffect(() => {
    checkTTL();
    
    // Check TTL every 30 seconds
    const interval = setInterval(checkTTL, 30000);
    return () => clearInterval(interval);
  }, [checkTTL]);

  // Wallet disconnect detection
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const { useSolanaWallet } = await import('../../providers/SolanaWalletProvider');
        const { wallet } = useSolanaWallet();
        
        // If we have a pending flow but wallet disconnected, notify user
        if (pending && (!wallet || !wallet.publicKey)) {
          console.warn('[WALLET_DISCONNECT] Flow paused due to wallet disconnect');
          addBotMsg('Wallet disconnected — I paused the flow. Reconnect and say "resume" or click a tile.');
          // Don't clear pending - let them resume
        }
      } catch (error) {
        console.warn('Wallet check failed:', error);
      }
    };

    // Check on mount and when window gains focus
    checkWalletConnection();
    window.addEventListener('focus', checkWalletConnection);
    
    return () => {
      window.removeEventListener('focus', checkWalletConnection);
    };
  }, [pending]);

  // Show welcome tiles if no messages or if session expired
  if (!msgs || msgs.length === 0) {
    return (
      <div className="chat-stream">
        <div className="messages-container">
          <WelcomeTiles />
        </div>
      </div>
    );
  }

  // Handle expired yield session case
  const handleExpiredSessionClick = (action: string) => {
    if (action === 'withdraw-yield' && (!yieldSession || (Date.now() - yieldSession.startedAt) > 3600000)) {
      addBotMsg('No active yield this session. Want me to run ~15% on 1 SOL?', [
        { id: 'new_yield', label: 'Yes, start new yield', action: 'select-amount', payload: { amount: 1.0 } },
        { id: 'different', label: 'Different amount', action: 'custom-amount', payload: {} }
      ]);
      return true; // Handled
    }
    return false; // Not handled, proceed normally
  };

  const handleChipClick = async (action: string, payload?: any) => {
    console.info('[CHIP_CLICK]', action, payload);
    
    // Check for expired session cases
    if (handleExpiredSessionClick(action)) {
      return;
    }
    
    try {
      // Route chip actions to the pure API
      switch (action) {
        case 'select-amount':
          if (payload?.amount) {
            const lamports = Math.floor(payload.amount * LAMPORTS_PER_SOL);
            await api.chooseAmount(lamports);
          }
          break;
          
        case 'confirm-deposit':
          if (payload?.confirmed) {
            await api.confirmAndExecute();
          } else {
            // User said no
            addBotMsg('No problem. What would you like to try?');
          }
          break;
          
        case 'withdraw-yield':
          await api.withdrawNow();
          break;
          
        case 'run-again':
          const pending = useChatSession.getState().pending;
          if (pending?.ctx?.targetBps) {
            await api.startYieldFlow(pending.ctx.targetBps);
          } else {
            await api.startYieldFlow(5000); // Default 50%
          }
          break;
          
        case 'change-target':
          await api.startYieldFlow(7500); // 75% as different target
          break;
          
        default:
          console.warn('Unknown chip action:', action);
      }
    } catch (error: any) {
      console.error('[CHIP_ERROR]', error);
      addBotMsg(`Error: ${error.message}`);
    }
  };

  return (
    <div className="chat-stream" ref={scrollRef}>
      <div className="messages-container">
        {msgs.map((msg) => (
          <ConversationalBubble
            key={msg.id}
            message={msg}
            onChipClick={handleChipClick}
          />
        ))}
      </div>
    </div>
  );
}