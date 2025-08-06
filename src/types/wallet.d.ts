declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
    };
    solflare?: {
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signTransaction: (transaction: any) => Promise<any>;
    };
  }
}

export {}; 