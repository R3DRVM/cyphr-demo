import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const TREASURY_ADDRESS = 'BAcgS8dQ3e5FgN1UWNEKPTjcGNQYBrNK97VQq2HMeuNG';
const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

async function testWithdrawalFlow() {
  console.log('🧪 Testing Complete Withdrawal Flow...\n');
  
  // 1. Check Treasury Balance
  console.log('1️⃣ Checking Treasury Balance...');
  const connection = new Connection(DEVNET_ENDPOINT, 'confirmed');
  const treasuryPubkey = new PublicKey(TREASURY_ADDRESS);
  
  try {
    const treasuryBalance = await connection.getBalance(treasuryPubkey);
    const treasurySOL = treasuryBalance / LAMPORTS_PER_SOL;
    console.log(`✅ Treasury Balance: ${treasurySOL.toFixed(4)} SOL`);
    
    if (treasurySOL < 1.1) {
      console.log('❌ Treasury needs at least 1.1 SOL for testing (1 SOL deposit + yield)');
      return;
    }
  } catch (error) {
    console.log('❌ Error checking treasury balance:', error.message);
    return;
  }
  
  // 2. Simulate User Deposit Info
  console.log('\n2️⃣ Simulating User Deposit Info...');
  const userDepositInfo = {
    amount: 1.0, // 1 SOL deposit
    targetAPY: 25, // 25% APY
    timestamp: Date.now() - 3600000 // 1 hour ago
  };
  
  console.log('✅ User deposit info simulated:', userDepositInfo);
  
  // 3. Calculate Expected Return
  console.log('\n3️⃣ Calculating Expected Return...');
  const yieldAmount = userDepositInfo.amount * (userDepositInfo.targetAPY / 100);
  const totalReturn = userDepositInfo.amount + yieldAmount;
  
  console.log(`💰 Original Deposit: ${userDepositInfo.amount} SOL`);
  console.log(`🎯 Yield Earned: ${yieldAmount.toFixed(4)} SOL (${userDepositInfo.targetAPY}% APY)`);
  console.log(`💸 Total Return: ${totalReturn.toFixed(4)} SOL`);
  
  // 4. Check if Treasury Can Afford Return
  console.log('\n4️⃣ Checking Treasury Affordability...');
  const treasuryBalance = await connection.getBalance(treasuryPubkey);
  const treasurySOL = treasuryBalance / LAMPORTS_PER_SOL;
  
  if (treasurySOL >= totalReturn) {
    console.log(`✅ Treasury can afford return: ${treasurySOL.toFixed(4)} SOL available`);
  } else {
    console.log(`❌ Treasury cannot afford return: ${treasurySOL.toFixed(4)} SOL available, need ${totalReturn.toFixed(4)} SOL`);
    return;
  }
  
  // 5. Test Instructions
  console.log('\n5️⃣ Manual Test Instructions:');
  console.log('📱 Open http://localhost:3001/cyphr-bot in your browser');
  console.log('🔗 Make sure wallet is connected and in Devnet Mode');
  console.log('💸 Click "Withdraw now" button');
  console.log('📊 Watch for transaction hash and confirmation');
  console.log('💰 Check wallet balance increase');
  
  // 6. Expected Results
  console.log('\n6️⃣ Expected Results:');
  console.log('✅ Withdrawal processes automatically');
  console.log('✅ Transaction hash displayed');
  console.log('✅ 1.25 SOL returned to wallet (1 SOL + 0.25 SOL yield)');
  console.log('✅ Activity tab shows withdrawal transaction');
  console.log('✅ No manual intervention needed');
  
  console.log('\n🎯 READY FOR TESTING!');
  console.log('   The user should get their 1 SOL + 0.25 SOL yield back automatically.');
  console.log('   If this fails, the system will show a "Try Withdrawal Again" button.');
}

testWithdrawalFlow().catch(console.error);
