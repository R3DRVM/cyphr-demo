/**
 * Lender adapter (mock implementation for devnet/testing)
 *
 * Provides a minimal interface to:
 * - enable a token as collateral
 * - borrow against the enabled collateral
 *
 * This implementation does NOT integrate with a real lending protocol.
 * Instead, it submits tiny self-transfers on Solana devnet to produce
 * real transaction signatures that can be tracked in the explorer.
 *
 * Rationale: We do not have a protocol SDK wired up here, but we still
 * want an end-to-end flow with explorer links, status toasts, and policy
 * enforcement. Replace the internals with protocol-specific calls later.
 */

import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { connection, SOLANA_NETWORK } from '../config/solana';

export interface EnableCollateralParams {
  owner: PublicKey;
  tokenSymbol: string; // e.g. 'SOL'
  amount: number; // amount of token to mark as collateral (display units)
  sendTransaction: (tx: Transaction) => Promise<string>;
}

export interface BorrowParams {
  owner: PublicKey;
  debtTokenSymbol: string; // e.g. 'USDC'
  borrowAmount: number; // display units
  sendTransaction: (tx: Transaction) => Promise<string>;
}

export interface BorrowResult {
  signature: string;
  explorerUrl: string;
}

export interface EnableCollateralResult {
  signature: string;
  explorerUrl: string;
}

/**
 * Returns a clickable explorer URL for a given transaction signature
 */
function toExplorerUrl(signature: string): string {
  const clusterParam = SOLANA_NETWORK === 'devnet' ? 'cluster=devnet' : undefined;
  return `https://explorer.solana.com/tx/${signature}${clusterParam ? `?${clusterParam}` : ''}`;
}

/**
 * Marks a token as collateral for the owner. Mocked by sending a minimal
 * self-transfer to create a verifiable transaction on-chain.
 */
export async function enableCollateral(params: EnableCollateralParams): Promise<EnableCollateralResult> {
  const { owner, sendTransaction } = params;

  const tx = new Transaction();
  // Tiny self-transfer: produces a signature while costing near-zero on devnet
  tx.add(SystemProgram.transfer({ fromPubkey: owner, toPubkey: owner, lamports: 1 }));

  const signature = await sendTransaction(tx);
  return { signature, explorerUrl: toExplorerUrl(signature) };
}

/**
 * Borrows a token against enabled collateral. Mocked by another tiny
 * self-transfer to produce a verifiable signature.
 */
export async function borrow(params: BorrowParams): Promise<BorrowResult> {
  const { owner, sendTransaction } = params;

  const tx = new Transaction();
  tx.add(SystemProgram.transfer({ fromPubkey: owner, toPubkey: owner, lamports: 2 }));

  const signature = await sendTransaction(tx);
  return { signature, explorerUrl: toExplorerUrl(signature) };
}

export const lenderAdapter = {
  enableCollateral,
  borrow,
};



