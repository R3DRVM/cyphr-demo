import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const WalletConnect: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then(setBalance);
    } else {
      setBalance(null);
    }
  }, [connected, publicKey, connection]);

  return (
    <div className="wallet-connect">
      <div className="wallet-info">
        {connected ? (
          <div className="wallet-connected">
            <div className="wallet-address">
              <span className="label">Wallet:</span>
              <span className="address">
                {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
              </span>
            </div>
            <div className="wallet-balance">
              <span className="label">Balance:</span>
              <span className="balance">
                {balance ? (balance / LAMPORTS_PER_SOL).toFixed(4) : '0'} SOL
              </span>
            </div>
          </div>
        ) : (
          <div className="wallet-disconnected">
            <span className="label">Connect wallet to execute strategies</span>
          </div>
        )}
      </div>
      <WalletMultiButton className="wallet-button" />
    </div>
  );
};

export default WalletConnect; 