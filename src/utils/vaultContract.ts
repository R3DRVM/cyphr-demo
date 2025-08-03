import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

// Simple vault contract interface for demo
export interface VaultContract {
  address: string;
  name: string;
  apy: number;
  minStake: number;
  maxStake: number;
}

// Demo vault contracts on testnet
export const DEMO_VAULTS: VaultContract[] = [
  {
    address: 'DemoVault1',
    name: 'Cyphr Yield Vault',
    apy: 8.5,
    minStake: 0.1,
    maxStake: 100
  },
  {
    address: 'DemoVault2', 
    name: 'High Yield Vault',
    apy: 12.3,
    minStake: 1,
    maxStake: 50
  },
  {
    address: 'DemoVault3',
    name: 'Conservative Vault',
    apy: 5.2,
    minStake: 0.05,
    maxStake: 200
  }
];

// Simulate staking transaction
export const simulateStakeTransaction = async (
  connection: Connection,
  amount: number,
  vault: VaultContract
) => {
  try {
    // Simulate a simple stake transaction
    const transaction = new Transaction();
    
    // Add a simple transfer instruction (in real implementation, this would be a vault stake instruction)
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey('11111111111111111111111111111111'), // Demo sender
        toPubkey: new PublicKey('22222222222222222222222222222222'), // Demo vault
        lamports: amount * LAMPORTS_PER_SOL
      })
    );

    // Simulate transaction
    const { value } = await connection.simulateTransaction(transaction);
    
    return {
      success: true,
      signature: 'demo_signature_' + Date.now(),
      fee: 0.000005, // Standard SOL transaction fee
      estimatedApy: vault.apy,
      estimatedReturns: (amount * vault.apy) / 100,
      vault: vault
    };
  } catch (error) {
    console.error('Transaction simulation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Calculate strategy returns
export const calculateStrategyReturns = (
  depositAmount: number,
  vault: VaultContract,
  duration: number // in days
) => {
  const dailyRate = vault.apy / 365;
  const totalReturn = depositAmount * (dailyRate / 100) * duration;
  const finalAmount = depositAmount + totalReturn;
  
  return {
    initialDeposit: depositAmount,
    totalReturn,
    finalAmount,
    apy: vault.apy,
    duration,
    dailyReturn: depositAmount * (dailyRate / 100)
  };
}; 