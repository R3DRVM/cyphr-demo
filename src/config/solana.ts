import { Connection, clusterApiUrl } from '@solana/web3.js';

// Solana network configuration
export const SOLANA_NETWORK = 'devnet';
export const SOLANA_RPC_URL = clusterApiUrl(SOLANA_NETWORK);

// Create connection instance
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Import deployed contract addresses
import deploymentInfo from '../../smart-contracts/deployment-info.json';

// Vault contract addresses from deployment
export const STRATEGY_VAULT_PROGRAM_ID = deploymentInfo.contracts.strategyVault.programId;
export const BASIC_VAULT_PROGRAM_ID = deploymentInfo.contracts.basicVault.programId;
export const VAULT_PROGRAM_ID = STRATEGY_VAULT_PROGRAM_ID; // Default to strategy vault

// Wallet types we support
export const SUPPORTED_WALLETS = [
  'phantom',
  'solflare',
  'backpack',
  'slope'
] as const;

export type SupportedWallet = typeof SUPPORTED_WALLETS[number]; 