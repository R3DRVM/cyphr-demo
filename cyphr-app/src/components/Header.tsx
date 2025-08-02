import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccentColor } from '../contexts/ColorContext';

import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { accentColor } = useAccentColor();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'TERMINAL', path: '/pro-terminal' },
    { name: 'DISCOVER', path: '/discover' },
    { name: 'DASHBOARD', path: '/dashboard' },
    { name: 'INSIGHTS', path: '/tracker' },
    { name: 'PERPETUALS', path: '/perpetuals' },
    { name: 'PORTFOLIO', path: '/portfolio' },
  ];

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo and Navigation */}
        <div className="header-left">
          {/* Logo */}
          <Link to="/" className="logo-link">
            <div className="logo-container">
              <img
                src="/White 3d Logo.png"
                alt="Cyphr Logo"
                className="logo-image"
                onLoad={() => console.log('Logo loaded successfully')}
                onError={(e) => console.error('Logo failed to load:', e)}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="navigation desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        {/* Right Side Actions */}
        <div className="header-right">
          {/* Search */}
          <button className="action-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </button>

          {/* Deposit Button */}
          <button className="deposit-button">
            Deposit
          </button>

          {/* Star */}
          <button className="action-button star-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="notification-badge">1</span>
          </button>

          {/* Money Bag */}
          <div className="money-bag">
            <svg className="money-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
            <span className="money-amount">$0.07</span>
          </div>

          {/* Dropdown */}
          <button className="action-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>

          {/* Profile */}
          <button className="action-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <nav className="mobile-navigation">
          <div className="mobile-nav-header">
            <h3>Navigation</h3>
            <button 
              className="mobile-close-button"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="mobile-nav-items">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`mobile-nav-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-nav-text">{item.name}</span>
                <span className="mobile-nav-arrow">→</span>
              </Link>
            ))}
          </div>
          <div className="mobile-nav-footer">
            <div className="mobile-actions">
              <button className="mobile-action-btn">
                <svg className="mobile-action-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
                Search
              </button>
              <button className="mobile-action-btn">
                <svg className="mobile-action-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Watchlist
              </button>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header; 