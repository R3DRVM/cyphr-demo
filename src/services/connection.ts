import { Connection } from '@solana/web3.js';

const PRIMARY_RPC = import.meta.env.VITE_RPC_PRIMARY || 'https://api.devnet.solana.com';
const FALLBACK_RPC = import.meta.env.VITE_RPC_FALLBACK || 'https://devnet.helius-rpc.com/?api-key=__ENV__';

let connectionInstance: Connection | null = null;

export function getConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(PRIMARY_RPC, 'confirmed');
  }
  return connectionInstance;
}

export async function confirmTx(signature: string): Promise<void> {
  const connection = getConnection();
  try {
    await connection.confirmTransaction(signature, 'confirmed');
  } catch (error) {
    // Try fallback RPC if primary fails
    const fallbackConnection = new Connection(FALLBACK_RPC, 'confirmed');
    await fallbackConnection.confirmTransaction(signature, 'confirmed');
  }
}

