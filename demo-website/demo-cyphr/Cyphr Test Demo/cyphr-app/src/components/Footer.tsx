import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left Side */}
        <div className="footer-left">
          <div className="footer-brand">
            <span className="brand-name">Cyphr</span>
            <span className="brand-version">v1.0</span>
          </div>
        </div>

        {/* Center - Trackers */}
        <div className="footer-center">
          <button className="footer-button">Wallet Tracker</button>
          <button className="footer-button">Twitter Tracker</button>
          <button className="footer-button">Pulse Tracker</button>
          <button className="footer-button">PnL Tracker</button>
        </div>

        {/* Right Side */}
        <div className="footer-right">
          <div className="footer-balance">
            <span className="balance-amount">$186.9</span>
          </div>
          
          <div className="connection-status">
            <div className="status-indicator"></div>
            <span className="status-text">Connection is stable</span>
          </div>
          
          <div className="server-location">
            <span className="location-text">US-W</span>
            <span className="location-arrow">▼</span>
          </div>
          
          <div className="footer-actions">
            <button className="action-button">
              <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
              </svg>
            </button>
            <button className="action-button">
              <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
              </svg>
            </button>
            <button className="action-button">
              <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </button>
            <button className="action-button">
              <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 