// src/adapters/dex.ts
import { PublicKey } from '@solana/web3.js';
import { getConnection } from '../services/connection';

const DEMO_MODE = (import.meta as any).env?.VITE_DEMO_MODE === 'true';

export async function swap(
  inputMintStr: string,
  outputMintStr: string,
  uiAmount: number,
  slippageBps: number,
) {
  if (DEMO_MODE) return { signature: 'demo-sig', simulated: true };

  const connection = getConnection();
  const wallet = (window as any).solana;
  if (!wallet?.publicKey) throw new Error('Connect wallet');

  // For now, return demo mode since Jupiter package is not available
  // TODO: Implement real swap when proper DEX package is available
  return { signature: 'demo-sig', simulated: true };
}