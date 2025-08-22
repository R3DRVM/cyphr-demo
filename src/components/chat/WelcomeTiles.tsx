import React from 'react';
import { TrendingUp, Wallet, ArrowUpDown, DollarSign } from 'lucide-react';
import { useChat } from '../../state/ChatProvider';

export function WelcomeTiles() {
  const { api, session } = useChat();
  
  const welcomeTiles = [
    {
      title: 'Yield Strategies',
      description: 'Find me a 50% yield farm',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      action: () => api.startYieldFlow(5000) // 50% target
    },
    {
      title: 'Deposits', 
      description: 'Deposit 1 SOL',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      action: () => api.startYieldFlow(1500) // 15% target
    },
    {
      title: 'Withdrawals',
      description: 'Withdraw all',
      icon: ArrowUpDown,
      color: 'from-purple-500 to-purple-600',
      action: () => api.withdrawNow()
    },
    {
      title: 'Borrowing',
      description: 'Borrow 100 USDC',
      icon: DollarSign,
      color: 'from-yellow-500 to-yellow-600',
      action: async () => {
        const { addBotMsg } = await import('../../state/chatSession');
        addBotMsg('Borrowing features are coming soon! Try yield farming instead.');
      }
    }
  ];

  const handleTileClick = async (tile: typeof welcomeTiles[0]) => {
    console.info('[TILE_CLICK]', tile.description);
    
    // Execute the action - this will drive the flow and add user message
    try {
      await tile.action();
    } catch (error: any) {
      console.error('[TILE_ERROR]', { tile: tile.description, error: error.message });
      const { addBotMsg } = await import('../../state/chatSession');
      addBotMsg(`Error: ${error.message}`);
    }
  };

  // Hide tiles once conversation starts
  if (session.msgs && session.msgs.length > 0) {
    return null;
  }

  return (
    <div className="welcome-message">
      <div className="welcome-icon">🤖</div>
      <h2>gm, how can I help you?</h2>
      <p>I'm your AI-powered trading and strategy assistant. Try one of these commands:</p>
      <div className="suggestions">
        {welcomeTiles.map((tile, index) => (
          <button
            key={index}
            onClick={() => handleTileClick(tile)}
            className="suggestion-item"
          >
            <strong>{tile.title}</strong>
            <span>"{tile.description}"</span>
          </button>
        ))}
      </div>
    </div>
  );
}