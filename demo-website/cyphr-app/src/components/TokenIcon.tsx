import React from 'react';

interface TokenIconProps {
  token: {
    name: string;
    symbol?: string;
    icon?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TokenIcon: React.FC<TokenIconProps> = ({ 
  token, 
  size = 'md', 
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  const getTokenIcon = (symbol: string) => {
    // Map token symbols to placeholder images
    const iconMap: { [key: string]: string } = {
      'CO': 'https://picsum.photos/40/40?random=1',
      'RIB': 'https://picsum.photos/40/40?random=2',
      'PER': 'https://picsum.photos/40/40?random=3',
      'PAC': 'https://picsum.photos/40/40?random=4',
      'MU': 'https://picsum.photos/40/40?random=5',
      'PR': 'https://picsum.photos/40/40?random=6',
      'DX': 'https://picsum.photos/40/40?random=7',
      'NY': 'https://picsum.photos/40/40?random=8',
      'SOL': 'https://picsum.photos/40/40?random=9',
      'ETH': 'https://picsum.photos/40/40?random=10',
      'BTC': 'https://picsum.photos/40/40?random=11',
      'PEPE': 'https://picsum.photos/40/40?random=12',
      'DOGE': 'https://picsum.photos/40/40?random=13',
      'SHIB': 'https://picsum.photos/40/40?random=14',
      'BONK': 'https://picsum.photos/40/40?random=15',
      'GNOME': 'https://picsum.photos/40/40?random=16',
      'GONK': 'https://picsum.photos/40/40?random=17'
    };

    return iconMap[symbol] || `https://picsum.photos/40/40?random=${symbol.charCodeAt(0)}`;
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-cyphr-teal to-cyphr-pink flex items-center justify-center text-cyphr-black font-bold shadow-lg border-2 border-cyphr-gray/20 overflow-hidden`}>
        {token.icon ? (
          <img 
            src={token.icon} 
            alt={token.name}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <img 
            src={getTokenIcon(token.symbol || token.name)}
            alt={token.name}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-cyphr-teal to-cyphr-pink flex items-center justify-center text-cyphr-black font-bold text-sm hidden">
          {(token.symbol || token.name).charAt(0)}
        </div>
      </div>
    </div>
  );
};

export default TokenIcon; 