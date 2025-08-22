export function humanizeEvent(e: any): string {
  switch (e.type) {
    case 'bundle':
      return `Bundle ${e.signature ? 'completed' : 'pending'}`;
    case 'deposit':
      return `Deposited ${e.amount} SOL`;
    case 'withdraw':
      return `Withdrew ${e.amount} SOL`;
    case 'credit':
      return `Credited ${e.amount} SOL`;
    case 'topup':
      return `Topped up ${e.amount} SOL`;
    default:
      return 'Unknown event';
  }
}

export function shortSig(sig: string): string {
  if (!sig || sig.length < 8) return sig;
  return `${sig.slice(0, 4)}…${sig.slice(-4)}`;
}

export function getExplorerLink(sig: string, network: string = 'devnet'): string {
  const baseUrl = network === 'mainnet-beta' 
    ? 'https://explorer.solana.com' 
    : 'https://explorer.solana.com';
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `${baseUrl}/tx/${sig}${cluster}`;
}

export function formatWalletDelta(prevLamports: number, nextLamports: number): string {
  const prevSol = prevLamports / 1_000_000_000;
  const nextSol = nextLamports / 1_000_000_000;
  const delta = nextSol - prevSol;
  
  const sign = delta >= 0 ? '+' : '';
  const deltaStr = delta >= 0 ? `+${delta.toFixed(4)}` : delta.toFixed(4);
  
  return `wallet: ${prevSol.toFixed(4)} → ${nextSol.toFixed(4)} SOL (${deltaStr})`;
}

// Conversational copy templates
export const chatCopy = {
  greeting: "Hey there! 👋 I'm Cyphr Bot, your AI-powered trading assistant. I can help you with yield strategies, deposits, withdrawals, and more. What would you like to explore today?",
  
  findingYield: (targetBps: number) => `I'm searching for yield opportunities targeting around ${targetBps / 100}% APY...`,
  
  askAmount: "Great! How much SOL would you like to deposit for this strategy?",
  
  processingAmount: (amount: number) => `Perfect! I'll process ${amount.toFixed(2)} SOL for you. This will require one signature from your wallet.`,
  
  requestingSignature: "Requesting your signature...",
  
  confirmYield: (amount: number, targetBps: number) => 
    `Got it! You want to deposit ${amount} SOL targeting around ${targetBps / 100}% APY. Does that sound right?`,
  
  executingBundle: "Executing your strategy...",
  
  depositComplete: (amount: number, sig: string) => 
    `depositing ${amount.toFixed(2)} SOL… ${shortSig(sig)} (View) · Status: completed`,
  
  walletDelta: (prevLamports: number, nextLamports: number) => 
    formatWalletDelta(prevLamports, nextLamports),
  
  yieldSuccess: (targetBps: number) => 
    `🎉 Your yield strategy is now active! Target: ${targetBps / 100}% APY`,
  
  withdrawReady: "Ready to withdraw? I'll send your deposit plus earned yield.",
  
  withdrawComplete: (amount: number, sig: string) => 
    `withdrawing ${amount.toFixed(2)} SOL… ${shortSig(sig)} (View) · Status: completed`,
  
  sessionRestored: "Welcome back! Your yield session is still active.",
  
  treasuryAddress: (address: string) => `Demo treasury address: ${address}`,
  
  errors: {
    walletNotConnected: "Please connect your wallet first.",
    insufficientFunds: "Insufficient SOL balance for this transaction.",
    transactionFailed: "Transaction failed. Please try again.",
    networkMismatch: "This demo only works on devnet. Please switch networks.",
    amountTooLow: (min: number) => `Minimum amount is ${min} SOL.`,
    amountTooHigh: (max: number) => `Maximum amount is ${max} SOL.`
  },
  
  transactionProgress: {
    finding: 'Searching for the best opportunities...',
    bundling: 'Bundling your transaction...',
    signing: 'Requesting your signature...',
    executing: 'Executing your strategy...',
    finalizing: 'Finalizing on the blockchain...',
    success: 'Success! Your transaction is complete.',
    error: 'Something went wrong. Let me help you troubleshoot.'
  }
};