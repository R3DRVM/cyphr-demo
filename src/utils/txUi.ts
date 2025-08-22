/**
 * Transaction UI utilities for chat display
 */

export const shortSig = (s: string): string => {
  if (!s || s.length < 6) return s;
  return `${s.slice(0, 3)}…${s.slice(-3)}`;
};

export const explorer = (sig: string, cluster: 'devnet' | 'mainnet-beta' = 'devnet'): string => {
  return `https://explorer.solana.com/tx/${sig}?cluster=${cluster}`;
};

export const deltaLine = (prev: number, next: number): string => {
  const delta = next - prev;
  const sign = delta >= 0 ? '+' : '';
  return `wallet: ${prev.toFixed(4)} → ${next.toFixed(4)} SOL (${sign}${delta.toFixed(4)})`;
};

export const formatSOL = (lamports: number): string => {
  return (lamports / 1_000_000_000).toFixed(4);
};

export const formatTimestamp = (ts: number): string => {
  const date = new Date(ts);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};
