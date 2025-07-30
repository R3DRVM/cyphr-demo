import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccentColor } from '../contexts/ColorContext';
import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { accentColor } = useAccentColor();

  const navItems = [
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
                src="/White%203d%20Logo.png"
                alt="Cyphr Logo"
                className="logo-image"
              />
            </div>
          </Link>

          {/* Navigation */}
          <nav className="navigation">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="header-right">
          {/* Search */}
          <button className="action-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
            </svg>
          </button>

          {/* Deposit Button */}
          <button className="deposit-button">
            Deposit
          </button>

          {/* Star */}
          <button className="action-button star-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span className="notification-badge">1</span>
          </button>

          {/* Money Bag */}
          <div className="money-bag">
            <svg className="money-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
            </svg>
            <span className="money-amount">$0.07</span>
          </div>

          {/* Dropdown */}
          <button className="action-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>

          {/* Profile */}
          <button className="action-button">
            <svg className="action-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 