/**
 * Centralized chat formatting utilities
 */

/**
 * Shorten signature to first 3 + last 3 characters
 */
export function shortSig(signature: string): string {
  if (signature.length < 6) return signature;
  return `${signature.slice(0, 3)}…${signature.slice(-3)}`;
}

/**
 * Get Solana Explorer URL for devnet
 */
export function explorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

/**
 * Format SOL amount to 4 decimal places
 */
export function fmtSol4(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}

/**
 * Format signed delta with 4 decimal places
 */
export function fmtSignedDelta4(preLamports: number, postLamports: number): string {
  const delta = postLamports - preLamports;
  const deltaSol = Math.abs(delta / 1e9).toFixed(4);
  const sign = delta >= 0 ? '+' : '−';
  return `${sign}${deltaSol}`;
}

/**
 * Format wallet delta line
 */
export function formatWalletDelta(preLamports: number, postLamports: number): string {
  const preSol = fmtSol4(preLamports);
  const postSol = fmtSol4(postLamports);
  const signedDelta = fmtSignedDelta4(preLamports, postLamports);
  
  return `wallet: ${preSol} → ${postSol} SOL (${signedDelta})`;
}
