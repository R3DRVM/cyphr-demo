import { Connection, clusterApiUrl } from '@solana/web3.js';
import { configService } from '../services/config';

// Solana network configuration - use config service for robust defaults
export const SOLANA_NETWORK = configService.getSolanaNetwork();
export const SOLANA_RPC_URL = configService.getRpcUrl();

// Create connection instance
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Vault contract addresses from deployment
export const STRATEGY_VAULT_PROGRAM_ID = '5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52';
export const BASIC_VAULT_PROGRAM_ID = '5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52';
export const VAULT_PROGRAM_ID = STRATEGY_VAULT_PROGRAM_ID; // Default to strategy vault

// Wallet types we support
export const SUPPORTED_WALLETS = [
  'phantom',
  'solflare',
  'backpack',
  'slope'
] as const;

export type SupportedWallet = typeof SUPPORTED_WALLETS[number]; 