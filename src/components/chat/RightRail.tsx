import React, { useState, useEffect } from 'react';
import { useSolanaWallet } from '../../providers/SolanaWalletProvider';
import { getConnection } from '../../services/connection';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet, Copy } from 'lucide-react';

export const RightRail: React.FC = () => {
  const { wallet, connected, publicKey } = useSolanaWallet();
  const [walletMode, setWalletMode] = useState(true);
  const [balance, setBalance] = useState<{ sol: number; usdc: number }>({ sol: 0, usdc: 0 });

  // Update balance when wallet connection changes
  useEffect(() => {
    if (connected && publicKey) {
      const updateBalance = async () => {
        try {
          const connection = getConnection();
          const solBalance = await connection.getBalance(publicKey);
          setBalance({
            sol: solBalance / LAMPORTS_PER_SOL,
            usdc: 0 // TODO: Implement real USDC balance
          });
        } catch (error) {
          console.error('Failed to update balance:', error);
        }
      };

      updateBalance();
      const interval = setInterval(updateBalance, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [connected, publicKey]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <aside className="right-rail">
      <div className="wallet-header">
        <button className="deposit-button">Deposit</button>
        <div className="wallet-mode-toggle">
          <span>Wallet mode</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={walletMode}
              onChange={(e) => setWalletMode(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      {walletMode && (
        <div className="wallet-section">
          <div className="wallet-title">
            <Wallet className="wallet-icon" size={20} />
            <span>Wallet</span>
          </div>
          
          {!connected ? (
            <div className="wallet-connect-prompt">
              <div className="connect-icon">🔗</div>
              <span className="connect-text">Connect your wallet to view balances</span>
              <button className="connect-wallet-btn">
                Connect Wallet
              </button>
            </div>
          ) : (
            <div className="wallet-info">
              <div className="wallet-network">
                <span className="network-name">Solana</span>
                <div className="wallet-address-container">
                  <span className="wallet-address">
                    {publicKey?.toString().slice(0, 6)}...{publicKey?.toString().slice(-4)}
                  </span>
                  <button 
                    className="copy-button"
                    onClick={() => copyToClipboard(publicKey?.toString() || '')}
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
              
              <div className="wallet-balance">
                <span className="balance-amount">{balance.sol.toFixed(4)}</span>
                <span className="balance-usd">${(balance.sol * 150).toFixed(2)}</span>
              </div>

              <div className="wallet-assets">
                <div className="assets-header">
                  <span>↳ Assets</span>
                </div>
                <div className="assets-list">
                  <div className="asset-item">
                    <span className="asset-symbol">SOL</span>
                    <span className="asset-amount">{balance.sol.toFixed(4)}</span>
                    <span className="asset-value">${(balance.sol * 150).toFixed(2)}</span>
                  </div>
                  <div className="asset-item">
                    <span className="asset-symbol">USDC</span>
                    <span className="asset-amount">{balance.usdc.toFixed(2)}</span>
                    <span className="asset-value">${balance.usdc.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="nfts-section">
        <div className="section-header">
          <span>NFTs</span>
        </div>
        <div className="section-content">
          <div className="empty-state">
            <span>No NFTs found</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
