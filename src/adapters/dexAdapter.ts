/**
 * DEX adapter (mock implementation for devnet/testing)
 *
 * Provides a minimal interface to:
 * - quote a swap
 * - execute a swap with slippage protection
 *
 * This implementation does NOT integrate with a real DEX. It emits
 * tiny self-transfers on Solana devnet to produce real signatures so
 * users can follow along in the explorer. Swap math is purely simulated.
 */

import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { connection, SOLANA_NETWORK } from '../config/solana';

export interface QuoteParams {
  inputToken: string;
  outputToken: string;
  amountIn: number; // display units
}

export interface QuoteResult {
  amountOut: number; // simulated
  priceImpactPct: number;
}

export interface SwapParams extends QuoteParams {
  owner: PublicKey;
  maxSlippagePct: number; // e.g. 0.5 for 0.5%
  sendTransaction: (tx: Transaction) => Promise<string>;
}

export interface SwapResult {
  signature: string;
  explorerUrl: string;
}

function toExplorerUrl(signature: string): string {
  const clusterParam = SOLANA_NETWORK === 'devnet' ? 'cluster=devnet' : undefined;
  return `https://explorer.solana.com/tx/${signature}${clusterParam ? `?${clusterParam}` : ''}`;
}

/**
 * Simulated quote: applies a 5 bps fee and a tiny price impact based on size.
 */
export async function getQuote(params: QuoteParams): Promise<QuoteResult> {
  const { amountIn } = params;
  const feeBps = 5; // 0.05%
  const sizeImpactPct = Math.min(0.2, amountIn / 1_000); // up to 0.2% impact
  const amountOut = amountIn * (1 - feeBps / 10_000) * (1 - sizeImpactPct / 100);
  return { amountOut, priceImpactPct: sizeImpactPct };
}

/**
 * Executes a mocked swap after re-checking the quote and slippage caps.
 */
export async function swap(params: SwapParams): Promise<SwapResult> {
  const { owner, amountIn, maxSlippagePct, sendTransaction } = params;
  const quote = await getQuote(params);

  // Enforce slippage policy: simulated impact cannot exceed maxSlippagePct
  if (quote.priceImpactPct > maxSlippagePct) {
    throw new Error(`Slippage too high: ${quote.priceImpactPct.toFixed(2)}% > ${maxSlippagePct}%`);
  }

  const tx = new Transaction();
  // Tiny self-transfer to record an on-chain signature
  tx.add(SystemProgram.transfer({ fromPubkey: owner, toPubkey: owner, lamports: 3 }));
  const signature = await sendTransaction(tx);
  return { signature, explorerUrl: toExplorerUrl(signature) };
}

export const dexAdapter = {
  getQuote,
  swap,
};



