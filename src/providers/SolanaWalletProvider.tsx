import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SOLANA_RPC_URL, connection } from '../config/solana';

interface SolanaWalletContextType {
  wallet: any;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  connect: (walletType: string) => Promise<void>;
  disconnect: () => void;
  sendTransaction: (transaction: Transaction) => Promise<string>;
  getBalance: () => Promise<number>;
}

const SolanaWalletContext = createContext<SolanaWalletContextType | undefined>(undefined);

export const useSolanaWallet = () => {
  const context = useContext(SolanaWalletContext);
  if (context === undefined) {
    throw new Error('useSolanaWallet must be used within a SolanaWalletProvider');
  }
  return context;
};

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: React.FC<SolanaWalletProviderProps> = ({ children }) => {
  const [wallet, setWallet] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = async (walletType: string) => {
    setConnecting(true);
    try {
      let selectedWallet: any = null;

      // Add a small delay to ensure wallet extensions are ready
      await new Promise(resolve => setTimeout(resolve, 100));

      switch (walletType) {
        case 'phantom':
          if (!window.solana || !window.solana.isPhantom) {
            throw new Error('Phantom wallet is not installed! Please install Phantom wallet extension.');
          }
          selectedWallet = window.solana;
          break;
        case 'solflare':
          if (!window.solflare) {
            throw new Error('Solflare wallet is not installed! Please install Solflare wallet extension.');
          }
          selectedWallet = window.solflare;
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      const response = await selectedWallet.connect();
      const pubKey = new PublicKey(response.publicKey.toString());
      
      setWallet(selectedWallet);
      setPublicKey(pubKey);
      setConnected(true);
      
      console.log('Connected to wallet:', walletType, 'Public key:', pubKey.toString());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    if (wallet) {
      wallet.disconnect();
    }
    setWallet(null);
    setPublicKey(null);
    setConnected(false);
  };

  const sendTransaction = async (transaction: Transaction): Promise<string> => {
    if (!wallet || !publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // For Phantom wallet, use the proper signing method
      if (wallet.signTransaction) {
        // Sign the transaction
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        return signature;
      } else if (wallet.signAndSendTransaction) {
        // Alternative method for some wallets
        const signature = await wallet.signAndSendTransaction(transaction);
        return signature;
      } else {
        throw new Error('Wallet does not support transaction signing');
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const getBalance = async (): Promise<number> => {
    if (!publicKey) return 0;
    
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  };

  const value: SolanaWalletContextType = {
    wallet,
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    sendTransaction,
    getBalance,
  };

  return (
    <SolanaWalletContext.Provider value={value}>
      {children}
    </SolanaWalletContext.Provider>
  );
}; 