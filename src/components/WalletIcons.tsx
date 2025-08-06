import React from 'react';

interface WalletIconProps {
  wallet: 'phantom' | 'solflare' | 'walletconnect' | 'backpack';
  size?: number;
  className?: string;
}

const WalletIcons: React.FC<WalletIconProps> = ({ wallet, size = 32, className = '' }) => {
  const iconProps = {
    width: size,
    height: size,
    className,
    viewBox: '0 0 32 32',
  };

  switch (wallet) {
    case 'phantom':
      return (
        <svg {...iconProps} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#AB9FF2"/>
          <path d="M8 12h16v8H8z" fill="white"/>
          <circle cx="12" cy="16" r="2" fill="#AB9FF2"/>
          <circle cx="20" cy="16" r="2" fill="#AB9FF2"/>
        </svg>
      );
    
    case 'solflare':
      return (
        <svg {...iconProps} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#FC9965"/>
          <path d="M8 8l16 16M24 8L8 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    
    case 'walletconnect':
      return (
        <svg {...iconProps} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#3B99FC"/>
          <path d="M16 8c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8z" fill="white"/>
          <circle cx="16" cy="16" r="4" fill="#3B99FC"/>
        </svg>
      );
    
    case 'backpack':
      return (
        <svg {...iconProps} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#000000"/>
          <path d="M8 12h16v12H8z" fill="white"/>
          <path d="M12 8h8v4h-8z" fill="white"/>
          <circle cx="16" cy="18" r="2" fill="#000000"/>
        </svg>
      );
    
    default:
      return null;
  }
};

export default WalletIcons; 