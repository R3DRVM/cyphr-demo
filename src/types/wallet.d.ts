// TypeScript declarations for Solana wallet extensions

interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signAndSendTransaction?: (transaction: any) => Promise<string>;
  publicKey?: { toString: () => string };
}

interface SolflareProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signAndSendTransaction?: (transaction: any) => Promise<string>;
  publicKey?: { toString: () => string };
}

declare global {
  interface Window {
    solana?: PhantomProvider;
    solflare?: SolflareProvider;
  }
}

export {}; 