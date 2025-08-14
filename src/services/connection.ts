import { Connection } from '@solana/web3.js';
import { configService } from './config';

let connectionInstance: Connection | null = null;

export function getConnection(): Connection {
  if (!connectionInstance) {
    const rpcUrl = configService.getRpcUrl();
    connectionInstance = new Connection(rpcUrl, 'confirmed');
  }
  return connectionInstance;
}

export async function confirmTx(signature: string): Promise<void> {
  const connection = getConnection();
  try {
    await connection.confirmTransaction(signature, 'confirmed');
  } catch (error) {
    // Try fallback RPC if primary fails
    const fallbackRpc = 'https://devnet.helius-rpc.com/?api-key=__ENV__';
    const fallbackConnection = new Connection(fallbackRpc, 'confirmed');
    await fallbackConnection.confirmTransaction(signature, 'confirmed');
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const connection = getConnection();
    const blockHeight = await connection.getBlockHeight();
    return blockHeight > 0;
  } catch (error) {
    console.warn('Connection test failed:', error);
    return false;
  }
}

