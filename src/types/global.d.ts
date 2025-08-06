// Global type declarations for browser APIs

interface Window {
  solana?: {
    isPhantom?: boolean;
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAndSendTransaction?: (transaction: any) => Promise<string>;
    publicKey?: { toString: () => string };
  };
  solflare?: {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAndSendTransaction?: (transaction: any) => Promise<string>;
    publicKey?: { toString: () => string };
  };
}

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAndSendTransaction?: (transaction: any) => Promise<string>;
      publicKey?: { toString: () => string };
    };
    solflare?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
      signAndSendTransaction?: (transaction: any) => Promise<string>;
      publicKey?: { toString: () => string };
    };
  }
}

export {}; 