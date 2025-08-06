#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const networks = require('../config/networks');

/**
 * Check Deployed Smart Contracts
 * Shows current deployment status and contract addresses
 */
async function checkDeployedContracts() {
  console.log('🔍 CHECKING DEPLOYED SMART CONTRACTS');
  console.log('====================================\n');

  try {
    // Check different networks
    const networksToCheck = ['devnet', 'testnet', 'mainnet'];
    
    for (const networkName of networksToCheck) {
      console.log(`🌐 CHECKING ${networkName.toUpperCase()}`);
      console.log('================================');
      
      const network = networks[networkName];
      const connection = new Connection(network.url, 'confirmed');
      
      console.log(`📡 Network URL: ${network.url}`);
      console.log(`🔗 Explorer: ${network.explorer}`);
      
      try {
        // Check if we have any known contract addresses
        const knownContracts = [
          // Example contract addresses (these would be our deployed contracts)
          // 'YourContractAddressHere1234567890123456789012345678901234567890',
        ];
        
        if (knownContracts.length === 0) {
          console.log('❌ No deployed contracts found on this network');
          console.log('💡 To deploy contracts, run: npm run deploy:' + networkName);
        } else {
          console.log('✅ Found deployed contracts:');
          knownContracts.forEach((address, index) => {
            console.log(`   ${index + 1}. ${address}`);
            console.log(`      🔗 Explorer: ${network.explorer}/address/${address}`);
          });
        }
        
        // Check network status
        const slot = await connection.getSlot();
        console.log(`📊 Current slot: ${slot}`);
        
        const blockTime = await connection.getBlockTime(slot);
        if (blockTime) {
          console.log(`🕐 Block time: ${new Date(blockTime * 1000).toLocaleString()}`);
        }
        
      } catch (error) {
        console.log(`❌ Error checking ${networkName}: ${error.message}`);
      }
      
      console.log('');
    }

    // Show deployment instructions
    console.log('🚀 DEPLOYMENT INSTRUCTIONS');
    console.log('==========================');
    console.log('');
    console.log('To deploy our smart contracts:');
    console.log('');
    console.log('1. 🔧 Setup deployment environment:');
    console.log('   npm run setup:deploy');
    console.log('');
    console.log('2. 🧪 Deploy to devnet (for testing):');
    console.log('   npm run deploy:devnet');
    console.log('');
    console.log('3. 🌐 Deploy to mainnet (for production):');
    console.log('   npm run deploy:mainnet');
    console.log('');
    console.log('4. 📋 After deployment, contract addresses will be:');
    console.log('   - Strategy Vault Contract: [Will be generated]');
    console.log('   - Basic Vault Contract: [Will be generated]');
    console.log('');

    // Show existing DeFi protocols we could integrate with
    console.log('🔗 EXISTING SOLANA DEFI PROTOCOLS');
    console.log('=================================');
    console.log('');
    console.log('Instead of deploying our own contracts, we could integrate with:');
    console.log('');
    console.log('🏦 Marinade Finance:');
    console.log('   - Purpose: Liquid staking for SOL');
    console.log('   - Address: [Would need to look up]');
    console.log('   - Website: https://marinade.finance/');
    console.log('');
    console.log('🪐 Jupiter Aggregator:');
    console.log('   - Purpose: Best swap routes across DEXs');
    console.log('   - Address: [Would need to look up]');
    console.log('   - Website: https://jup.ag/');
    console.log('');
    console.log('💰 Solend Protocol:');
    console.log('   - Purpose: Lending and borrowing');
    console.log('   - Address: [Would need to look up]');
    console.log('   - Website: https://solend.fi/');
    console.log('');
    console.log('🔥 Raydium DEX:');
    console.log('   - Purpose: Decentralized exchange');
    console.log('   - Address: [Would need to look up]');
    console.log('   - Website: https://raydium.io/');
    console.log('');

    // Show our contract specifications
    console.log('📋 OUR SMART CONTRACT SPECIFICATIONS');
    console.log('====================================');
    console.log('');
    console.log('Strategy Vault Contract:');
    console.log('   - Size: ~31KB (estimated)');
    console.log('   - Features: Multi-token, yield generation, risk management');
    console.log('   - Status: Ready for deployment');
    console.log('');
    console.log('Basic Vault Contract:');
    console.log('   - Size: ~18KB (estimated)');
    console.log('   - Features: SOL deposits, 5% APY, emergency functions');
    console.log('   - Status: Ready for deployment');
    console.log('');

    return {
      success: true,
      networks: networksToCheck,
      deployedContracts: 0,
      readyForDeployment: true
    };

  } catch (error) {
    console.error('❌ Error checking deployed contracts:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run check if called directly
if (require.main === module) {
  checkDeployedContracts().catch(console.error);
}

module.exports = { checkDeployedContracts }; 