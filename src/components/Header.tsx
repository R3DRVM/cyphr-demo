import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccentColor } from '../contexts/ColorContext';

import './Header.css';

const Header: React.FC = () => {
  const location = useLocation();
  const { accentColor } = useAccentColor();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: 'DISCOVER', path: '/discover' },
    { name: 'TERMINAL', path: '/pro-terminal' },
    { name: 'STRATEGY', path: '/strategy-builder' },
    { name: 'INSIGHTS', path: '/tracker' },
    { name: 'PERPETUALS', path: '/perpetuals' },
    { name: 'PORTFOLIO', path: '/portfolio' },
  ];

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handleDropdownItemClick = () => {
    setIsProfileDropdownOpen(false);
  };

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
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>



        {/* Right Side Actions */}
        <div className="header-right">
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

          {/* Profile with Dropdown */}
          <div className="profile-dropdown-container" ref={profileDropdownRef}>
            <button 
              className={`action-button profile-button ${isProfileDropdownOpen ? 'active' : ''}`}
              onClick={handleProfileClick}
            >
              <svg className="action-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>
            
            {/* Profile Dropdown Menu */}
            <div className={`profile-dropdown ${isProfileDropdownOpen ? 'open' : ''}`}>
              <Link 
                to="/dashboard" 
                className="dropdown-item"
                onClick={handleDropdownItemClick}
              >
                <svg className="dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
                Dashboard
              </Link>
              <button className="dropdown-item">
                <svg className="dropdown-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
                </svg>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>


    </header>
  );
};

export default Header; 