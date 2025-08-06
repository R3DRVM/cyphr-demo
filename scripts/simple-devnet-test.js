const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, SystemProgram } = require('@solana/web3.js');
const { Program, AnchorProvider, BN } = require('@coral-xyz/anchor');
const fs = require('fs');

// Configuration
const PROGRAM_ID = new PublicKey('5iVtTdPWLN8Qk6BN2vudJU4myvu9nnnjsDnhCnCR2C52');
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Test accounts
const authority = Keypair.generate();
const user = Keypair.generate();

async function main() {
  console.log('🚀 CYPHR VAULTS - SIMPLE DEVNET TEST');
  console.log('=====================================');
  console.log(`Program ID: ${PROGRAM_ID.toString()}`);
  console.log(`Network: Devnet`);
  console.log('');

  try {
    // Load IDL
    const idl = JSON.parse(fs.readFileSync('./target/idl/cyphr_vaults.json', 'utf8'));
    
    // Setup provider
    const provider = new AnchorProvider(
      connection,
      { publicKey: authority.publicKey, signTransaction: (tx) => Promise.resolve(tx) },
      { commitment: 'confirmed' }
    );

    const program = new Program(idl, PROGRAM_ID, provider);

    // Airdrop SOL
    console.log('💰 Airdropping SOL to test accounts...');
    const sig1 = await connection.requestAirdrop(authority.publicKey, 5 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig1);
    const sig2 = await connection.requestAirdrop(user.publicKey, 3 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig2);
    console.log('✅ Airdrop successful');

    // Find PDAs
    const [basicVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("basic_vault")],
      PROGRAM_ID
    );

    const [userDepositPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_deposit"), user.publicKey.toBuffer()],
      PROGRAM_ID
    );

    console.log('📍 PDAs found:');
    console.log(`   Basic Vault: ${basicVaultPda.toString()}`);
    console.log(`   User Deposit: ${userDepositPda.toString()}`);

    // Test 1: Initialize Basic Vault
    console.log('\n🔧 Testing Basic Vault Initialization...');
    try {
      await program.methods
        .initializeBasicVault()
        .accounts({
          vaultState: basicVaultPda,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const vaultState = await program.account.basicVaultState.fetch(basicVaultPda);
      console.log('✅ Basic vault initialized successfully');
      console.log(`   Authority: ${vaultState.authority.toString()}`);
      console.log(`   Yield Rate: ${vaultState.yieldRate.toNumber() / 100}%`);
    } catch (error) {
      console.log('❌ Basic vault initialization failed:', error.message);
      return;
    }

    // Test 2: Deposit SOL
    console.log('\n💰 Testing SOL Deposit...');
    try {
      const depositAmount = new BN(1 * LAMPORTS_PER_SOL);
      
      await program.methods
        .depositSol(depositAmount)
        .accounts({
          vaultState: basicVaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const vaultState = await program.account.basicVaultState.fetch(basicVaultPda);
      const userDeposit = await program.account.userDeposit.fetch(userDepositPda);
      
      console.log('✅ SOL deposit successful');
      console.log(`   User Deposit: ${userDeposit.depositAmount.toNumber() / LAMPORTS_PER_SOL} SOL`);
      console.log(`   Total Vault Deposits: ${vaultState.totalDeposits.toNumber() / LAMPORTS_PER_SOL} SOL`);
      console.log(`   Total Users: ${vaultState.totalUsers}`);
    } catch (error) {
      console.log('❌ SOL deposit failed:', error.message);
      return;
    }

    // Test 3: Claim Yield
    console.log('\n🎯 Testing Yield Claiming...');
    try {
      await program.methods
        .claimYield()
        .accounts({
          vaultState: basicVaultPda,
          userDeposit: userDepositPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const userDeposit = await program.account.userDeposit.fetch(userDepositPda);
      console.log('✅ Yield claiming successful');
      console.log(`   Yield Earned: ${userDeposit.yieldEarned.toNumber() / LAMPORTS_PER_SOL} SOL`);
    } catch (error) {
      console.log('❌ Yield claiming failed:', error.message);
      return;
    }

    console.log('\n🎉 SUCCESS! Basic vault functionality is working on Devnet!');
    console.log('📋 Features Verified:');
    console.log('   • Vault Initialization');
    console.log('   • SOL Deposit');
    console.log('   • Yield Generation & Claiming');
    console.log('   • User Account Management');

  } catch (error) {
    console.log('❌ Test execution failed:', error.message);
  }
}

main().catch(console.error); 