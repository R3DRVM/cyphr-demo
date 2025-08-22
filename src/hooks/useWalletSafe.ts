import { useWallet, useConnection } from "@solana/wallet-adapter-react";

export function useWalletSafe() {
  // Adapter hooks throw if used outside provider. If that happens, we catch via try/catch.
  try {
    const wallet = useWallet();
    const { connection } = useConnection();
    return { 
      wallet, 
      connection, 
      ok: true as const, 
      reason: null as null | string 
    };
  } catch (e) {
    console.warn('[useWalletSafe] Wallet context not available:', e);
    return { 
      wallet: null, 
      connection: null, 
      ok: false as const, 
      reason: "No WalletProvider" as const 
    };
  }
}
