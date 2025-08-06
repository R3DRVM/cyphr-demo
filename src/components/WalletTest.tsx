import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const WalletTest: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    fetchBalance();
  }, [publicKey, connection]);

  return (
    <div style={{ 
      padding: '20px', 
      background: 'rgba(255, 255, 255, 0.1)', 
      borderRadius: '12px',
      margin: '20px',
      color: 'white'
    }}>
      <h3>Solana Wallet Test</h3>
      <p>Network: Devnet (Testnet)</p>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      
      {connected && publicKey && (
        <div>
          <p>Address: {publicKey.toString()}</p>
          <p>Balance: {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <WalletMultiButton />
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.8 }}>
        <p>Supported Wallets:</p>
        <ul>
          <li>Phantom</li>
          <li>Solflare</li>
        </ul>
        <p>Make sure you have one of these wallets installed and switch to Devnet!</p>
      </div>
    </div>
  );
};

export default WalletTest; 