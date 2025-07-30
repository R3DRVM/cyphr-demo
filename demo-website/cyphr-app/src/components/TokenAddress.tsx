import React from 'react';

interface TokenAddressProps {
  address: string;
  className?: string;
}

const TokenAddress: React.FC<TokenAddressProps> = ({ address, className = '' }) => {
  const formatAddress = (addr: string) => {
    if (addr.length <= 7) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-3)}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      // You could add a toast notification here if needed
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-cyphr-gray font-sf-pro">{formatAddress(address)}</span>
      <button
        onClick={copyToClipboard}
        className="text-cyphr-gray opacity-60 hover:opacity-80 transition-all duration-200 group"
        title="Copy address"
      >
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-transform duration-200 group-hover:scale-105"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
    </div>
  );
};

export default TokenAddress; 