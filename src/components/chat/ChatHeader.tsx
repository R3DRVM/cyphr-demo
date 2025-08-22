import React from 'react';
import { getTreasuryPubkeyBase58 } from '../../services/demoTreasury';
import { configService } from '../../services/config';

export const ChatHeader: React.FC = () => {
  const treasuryAddress = getTreasuryPubkeyBase58();
  const isDevnet = configService.getSolanaNetwork() === 'devnet';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="chat-header">
      <div className="chat-title">
        <h1>Cyphr Bot</h1>
        <span className="chat-subtitle">Your AI-powered trading and strategy assistant</span>
      </div>
      
      {isDevnet && treasuryAddress && (
        <div className="demo-funds-chip">
          <span className="demo-label">Demo Funds</span>
          <code className="treasury-address">
            {treasuryAddress.slice(0, 6)}...{treasuryAddress.slice(-4)}
          </code>
          <button 
            className="copy-btn"
            onClick={() => copyToClipboard(treasuryAddress)}
            title="Copy treasury address"
          >
            📋
          </button>
        </div>
      )}
    </div>
  );
};
