import React, { useState, useRef, useEffect } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import './WalletConnect.css';

const WalletConnect: React.FC = () => {
  const { connected, connecting, publicKey, connect, disconnect, getBalance } = useSolanaWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      getBalance().then(setBalance);
    }
  }, [connected, publicKey, getBalance]);

  const handleConnect = async (walletType: string) => {
    try {
      await connect(walletType);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to connect:', error);
      alert(`Failed to connect to ${walletType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (connected && publicKey) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-balance">{balance.toFixed(4)} SOL</span>
          <span className="wallet-address">{formatAddress(publicKey.toString())}</span>
        </div>
        <button className="disconnect-button" onClick={handleDisconnect}>
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect-container" ref={dropdownRef}>
      <button 
        className="connect-wallet-button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={connecting}
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>

      {isDropdownOpen && (
        <div className="wallet-dropdown">
          <div className="dropdown-header">
            <h4>Connect a wallet</h4>
            <button 
              className="close-button"
              onClick={() => setIsDropdownOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="wallet-options">
            <button
              className="wallet-option"
              onClick={() => handleConnect('phantom')}
              disabled={connecting}
            >
              <div className="wallet-icon">👻</div>
              <div className="wallet-details">
                <div className="wallet-name">Phantom</div>
                <div className="wallet-description">Popular Solana wallet</div>
              </div>
            </button>

            <button
              className="wallet-option"
              onClick={() => handleConnect('solflare')}
              disabled={connecting}
            >
              <div className="wallet-icon">🔥</div>
              <div className="wallet-details">
                <div className="wallet-name">Solflare</div>
                <div className="wallet-description">Professional Solana wallet</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect; 