import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  
  const { data: balance } = useBalance({
    address: address,
  });

  const isActive = (path: string) => location.pathname === path;

  const handleConnectWallet = () => {
    open();
  };

  const handleDisconnectWallet = () => {
    disconnect();
  };

  const formatBalance = (balance: any) => {
    if (!balance) return '0.00';
    return parseFloat(balance.formatted).toFixed(4);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="/White 3d Logo.png" alt="Cyphr Logo" />
            <span>CYPHR</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>
            Dashboard
          </Link>
          <Link to="/discover" className={isActive('/discover') ? 'active' : ''}>
            Discover
          </Link>
          <Link to="/portfolio" className={isActive('/portfolio') ? 'active' : ''}>
            Portfolio
          </Link>
          <Link to="/spot" className={isActive('/spot') ? 'active' : ''}>
            Spot
          </Link>
          <Link to="/perpetuals" className={isActive('/perpetuals') ? 'active' : ''}>
            Perpetuals
          </Link>
          <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
            Orders
          </Link>
          <Link to="/tracker" className={isActive('/tracker') ? 'active' : ''}>
            Tracker
          </Link>
          <Link to="/strategy-builder" className={isActive('/strategy-builder') ? 'active' : ''}>
            Strategy Builder
          </Link>
        </nav>

        <div className="header-right">
          <div className="money-bag">
            <span className="money-icon">💰</span>
            <span className="balance">
              {isConnected && balance ? `${formatBalance(balance)} ${balance.symbol}` : '$0.07'}
            </span>
          </div>

          <div className="user-section">
            {isConnected ? (
              <div className="wallet-info">
                <span className="wallet-address">{formatAddress(address!)}</span>
                <button 
                  className="disconnect-button"
                  onClick={handleDisconnectWallet}
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                className="connect-wallet-button"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </button>
            )}
            
            <div className="user-icon">
              <span>👤</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 