console.log('🔍 Verifying User Deposit Status...\n');

// Simulate the localStorage check that happens in the browser
const simulateDepositCheck = () => {
  console.log('1️⃣ Checking if user has deposit info stored...');
  
  // This simulates what the browser would have stored
  const storedDeposit = localStorage.getItem('cyphr_deposit');
  
  if (storedDeposit) {
    try {
      const depositInfo = JSON.parse(storedDeposit);
      console.log('✅ Deposit info found:', depositInfo);
      
      const { amount, targetAPY, timestamp, status } = depositInfo;
      console.log(`   Amount: ${amount} SOL`);
      console.log(`   Target APY: ${targetAPY}%`);
      console.log(`   Status: ${status}`);
      console.log(`   Timestamp: ${new Date(timestamp).toLocaleString()}`);
      
      // Calculate expected return
      const yieldAmount = amount * (targetAPY / 100);
      const totalReturn = amount + yieldAmount;
      
      console.log(`\n💰 Expected Return: ${totalReturn.toFixed(4)} SOL`);
      console.log(`   Original: ${amount} SOL`);
      console.log(`   Yield: ${yieldAmount.toFixed(4)} SOL`);
      
      return true;
      
    } catch (error) {
      console.log('❌ Error parsing deposit info:', error.message);
      return false;
    }
  } else {
    console.log('❌ No deposit info found in localStorage');
    console.log('   This means the user cannot withdraw their funds!');
    console.log('   The deposit transaction may not have completed properly.');
    return false;
  }
};

// Check if we're in a browser environment
if (typeof window !== 'undefined' && window.localStorage) {
  // We're in a browser
  const hasDeposit = simulateDepositCheck();
  
  if (hasDeposit) {
    console.log('\n🎯 User can withdraw their funds!');
    console.log('   Click "Withdraw now" to get 1 SOL + yield back.');
  } else {
    console.log('\n🚨 CRITICAL ISSUE: User cannot withdraw!');
    console.log('   Need to fix the deposit storage issue.');
  }
} else {
  // We're in Node.js
  console.log('📱 This script is running in Node.js (not browser)');
  console.log('   To test the actual withdrawal:');
  console.log('   1. Open http://localhost:3001/cyphr-bot');
  console.log('   2. Check if localStorage has cyphr_deposit');
  console.log('   3. Try the withdrawal');
  
  console.log('\n🔧 Manual Check Instructions:');
  console.log('   1. Open browser dev tools (F12)');
  console.log('   2. Go to Application/Storage tab');
  console.log('   3. Look for "cyphr_deposit" in localStorage');
  console.log('   4. If missing, the deposit failed to store properly');
}

console.log('\n💡 If deposit info is missing, the user needs to:');
console.log('   1. Make a new deposit, OR');
console.log('   2. Contact support to recover their funds');
