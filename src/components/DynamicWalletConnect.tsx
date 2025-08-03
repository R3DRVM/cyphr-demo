import React, { useState, useEffect } from 'react';

interface WalletInfo {
  connected: boolean;
  address?: string;
  balance?: number;
}

const DynamicWalletConnect: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ connected: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Phantom wallet is available
      if (!window.solana || !window.solana.isPhantom) {
        setError('Phantom wallet not found. Please install Phantom wallet extension.');
        setIsLoading(false);
        return;
      }

      // Connect to Phantom wallet
      const response = await window.solana.connect();
      const publicKey = response.publicKey.toString();
      
      // Get balance (simplified - in real implementation you'd use Solana web3.js)
      setWalletInfo({
        connected: true,
        address: publicKey,
        balance: 0 // Placeholder - would get real balance
      });
      
    } catch (err) {
      setError('Failed to connect wallet. Please try again.');
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (window.solana) {
      window.solana.disconnect();
    }
    setWalletInfo({ connected: false });
  };

  return (
    <div className="wallet-connect-item">
      <label>Wallet Connection:</label>
      <div className="wallet-section">
        {walletInfo.connected ? (
          <div className="wallet-info">
            <div className="wallet-address">
              <span>Connected: {walletInfo.address?.slice(0, 4)}...{walletInfo.address?.slice(-4)}</span>
            </div>
            <div className="wallet-balance">
              <span>Balance: {walletInfo.balance?.toFixed(4) || '0'} SOL</span>
            </div>
          </div>
        ) : (
          <div className="wallet-disconnected">
            <span>Connect wallet to execute strategies</span>
          </div>
        )}
        
        <button 
          className="wallet-button"
          onClick={walletInfo.connected ? disconnectWallet : connectWallet}
          disabled={isLoading}
        >
          {isLoading ? 'Connecting...' : walletInfo.connected ? 'Disconnect' : 'Connect Wallet'}
        </button>
      </div>
      
      {error && (
        <div className="wallet-error">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default DynamicWalletConnect; 