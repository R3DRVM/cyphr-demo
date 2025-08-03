interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (args: any) => void) => void;
  request: (method: any, params: any) => Promise<any>;
}

interface Window {
  solana?: PhantomProvider;
} 