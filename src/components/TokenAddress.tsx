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
      <img 
        src="/CopyIcon.png" 
        alt="Copy" 
        width="10" 
        height="10"
        onClick={copyToClipboard}
        className="opacity-60 hover:opacity-80 transition-all duration-200 cursor-pointer"
        title="Copy address"
      />
    </div>
  );
};

export default TokenAddress; 