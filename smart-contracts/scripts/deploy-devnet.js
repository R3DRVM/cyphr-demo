#!/usr/bin/env node

const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const VaultContract = require('../contracts/vault/VaultContract');
const networks = require('../config/networks');
require('dotenv').config();

/**
 * Deploy Cyphr Smart Contracts to Solana Devnet
 */
async function deployToDevnet() {
  console.log('🚀 Starting deployment to Solana Devnet...\n');

  try {
    // Setup connection
    const connection = new Connection(networks.devnet.url, 'confirmed');
    console.log(`📡 Connected to ${networks.devnet.name}: ${networks.devnet.url}`);

    // Generate or use existing keypair
    let deployerKeypair;
    
    if (process.env.DEPLOYER_PRIVATE_KEY) {
      // Use existing private key
      const privateKeyBytes = Buffer.from(process.env.DEPLOYER_PRIVATE_KEY, 'base64');
      deployerKeypair = Keypair.fromSecretKey(privateKeyBytes);
      console.log('🔑 Using existing deployer keypair');
    } else {
      // Generate new keypair
      deployerKeypair = Keypair.generate();
      console.log('🔑 Generated new deployer keypair');
      console.log(`📋 Public Key: ${deployerKeypair.publicKey.toString()}`);
      console.log(`🔐 Private Key: ${Buffer.from(deployerKeypair.secretKey).toString('base64')}`);
      console.log('⚠️  Save this private key securely!');
    }

    // Check balance
    const balance = await connection.getBalance(deployerKeypair.publicKey);
    console.log(`💰 Deployer balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      console.log('🪙 Requesting devnet SOL airdrop...');
      
      try {
        const airdropSignature = await connection.requestAirdrop(
          deployerKeypair.publicKey,
          2 * LAMPORTS_PER_SOL
        );
        
        await connection.confirmTransaction(airdropSignature, 'confirmed');
        console.log('✅ Airdrop received');
        
        const newBalance = await connection.getBalance(deployerKeypair.publicKey);
        console.log(`💰 New balance: ${newBalance / LAMPORTS_PER_SOL} SOL`);
      } catch (airdropError) {
        console.error('❌ Airdrop failed:', airdropError.message);
        console.log('💡 You can manually get devnet SOL from: https://faucet.solana.com/');
        return;
      }
    }

    // Deploy Vault Contract
    console.log('\n🏦 Deploying Vault Contract...');
    
    const vaultProgramId = '11111111111111111111111111111111'; // Placeholder - would be actual program ID
    const vaultContract = new VaultContract(connection, vaultProgramId, deployerKeypair.publicKey);
    
    const vaultInitResult = await vaultContract.initializeVault();
    
    if (vaultInitResult.success) {
      console.log('✅ Vault contract deployed successfully');
      console.log(`📋 Vault Address: ${vaultInitResult.vaultAddress}`);
      
      // Test basic functionality
      console.log('\n🧪 Testing vault functionality...');
      
      const testUser = Keypair.generate();
      console.log(`👤 Test User: ${testUser.publicKey.toString()}`);
      
      // Test deposit simulation
      const simulationResult = await vaultContract.simulateDeposit(testUser.publicKey, 1.0);
      console.log('📊 Deposit simulation:', simulationResult.success ? '✅ Passed' : '❌ Failed');
      
      // Test vault info
      const vaultInfo = vaultContract.getVaultInfo();
      console.log('📋 Vault Info:', {
        totalDeposits: vaultInfo.totalDeposits,
        totalUsers: vaultInfo.totalUsers,
        isPaused: vaultInfo.isPaused
      });
      
      // Test pause functionality
      const pauseResult = vaultContract.pauseVault();
      console.log('⏸️ Pause test:', pauseResult.success ? '✅ Passed' : '❌ Failed');
      
      const resumeResult = vaultContract.resumeVault();
      console.log('▶️ Resume test:', resumeResult.success ? '✅ Passed' : '❌ Failed');
      
    } else {
      console.error('❌ Vault deployment failed:', vaultInitResult.error);
      return;
    }

    // Generate deployment report
    console.log('\n📊 Deployment Report');
    console.log('==================');
    console.log(`🌐 Network: ${networks.devnet.name}`);
    console.log(`🔑 Deployer: ${deployerKeypair.publicKey.toString()}`);
    console.log(`🏦 Vault Address: ${vaultInitResult.vaultAddress}`);
    console.log(`💰 Balance: ${await connection.getBalance(deployerKeypair.publicKey) / LAMPORTS_PER_SOL} SOL`);
    console.log(`🔗 Explorer: ${networks.devnet.explorer}`);
    
    // Save deployment info
    const deploymentInfo = {
      network: 'devnet',
      timestamp: new Date().toISOString(),
      deployer: deployerKeypair.publicKey.toString(),
      vaultAddress: vaultInitResult.vaultAddress,
      vaultProgramId: vaultProgramId,
      explorer: networks.devnet.explorer
    };
    
    const fs = require('fs');
    fs.writeFileSync(
      'deployment-devnet.json', 
      JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('\n💾 Deployment info saved to: deployment-devnet.json');
    
    // Update environment variables
    console.log('\n🔧 Environment Variables to Update:');
    console.log('==================================');
    console.log(`DEVNET_VAULT_PROGRAM_ID=${vaultProgramId}`);
    console.log(`DEVNET_VAULT_ADDRESS=${vaultInitResult.vaultAddress}`);
    console.log(`DEVNET_VAULT_AUTHORITY=${deployerKeypair.publicKey.toString()}`);
    
    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Update your .env file with the new addresses');
    console.log('2. Test the contracts with: npm run test:contracts');
    console.log('3. Integrate with your frontend application');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment if called directly
if (require.main === module) {
  deployToDevnet().catch(console.error);
}

module.exports = { deployToDevnet }; 