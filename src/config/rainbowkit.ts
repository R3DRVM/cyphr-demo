import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base, zora } from 'wagmi/chains';

// For Solana, we'll use the Solana wallet adapters directly
// RainbowKit is primarily for EVM chains, but we can integrate Solana wallets

export const config = getDefaultConfig({
  appName: 'Cyphr DeFi Strategy Builder',
  projectId: 'YOUR_PROJECT_ID', // You can get this from WalletConnect Cloud
  chains: [mainnet, polygon, optimism, arbitrum, base, zora],
  ssr: true,
});

// We'll create a separate Solana wallet integration
// that works alongside RainbowKit for EVM chains 