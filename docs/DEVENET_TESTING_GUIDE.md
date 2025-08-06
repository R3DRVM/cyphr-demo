# 🧪 Solana Devnet Testing Guide - Complete Workflow

## 🎯 **Testing Objectives**
- ✅ Connect Phantom/Solflare wallet to devnet
- ✅ Deposit SOL into the vault
- ✅ Execute a DeFi strategy
- ✅ Withdraw SOL from the vault
- ✅ Verify all transactions on Solana Explorer

---

## 📋 **Prerequisites**

### **1. Wallet Setup**
- **Phantom Wallet**: Install from [phantom.app](https://phantom.app)
- **Solflare Wallet**: Install from [solflare.com](https://solflare.com)
- **Switch to Devnet**: In your wallet settings, change network to "Devnet"

### **2. Get Devnet SOL**
```bash
# Using Solana CLI (if you have it installed)
solana config set --url devnet
solana airdrop 2 YOUR_WALLET_ADDRESS

# Or use online faucets:
# - https://faucet.solana.com/
# - https://solfaucet.com/
```

### **3. Verify Devnet Connection**
- Open your wallet
- Check network is set to "Devnet"
- Verify you have some SOL (even 0.1 SOL is enough for testing)

---

## 🚀 **Step-by-Step Testing Process**

### **Step 1: Open the App**
1. Navigate to: **http://localhost:5174**
2. You should see the Cyphr interface
3. Verify the app loads without errors

### **Step 2: Connect Your Wallet**
1. Click **"Connect Wallet"** in the header
2. Choose **Phantom** or **Solflare**
3. **Approve the connection** in your wallet popup
4. Verify you see:
   - ✅ Your wallet address (shortened format)
   - ✅ Your SOL balance
   - ✅ "Connected" status

### **Step 3: Navigate to Strategy Builder**
1. Click **"STRATEGY"** in the navigation
2. You should see the Strategy Builder interface
3. Verify the sidebar shows:
   - 📊 Data Sources
   - 💰 Deposit Configuration
   - 🔗 Wallet Connection (showing your connected wallet)

### **Step 4: Configure Your Strategy**
1. **Set Token**: Choose "SOL"
2. **Set Amount**: Enter a small amount (e.g., 0.01 SOL)
3. **Build Strategy**: Drag components from sidebar:
   - 📊 **Token Data** → **⚡ Strategy Logic** → **🎯 Actions**
4. **Configure Nodes**: Set conditions and actions

### **Step 5: Test Strategy Simulation**
1. Click **"Simulate Strategy"**
2. Wait for simulation to complete
3. Verify you see results:
   - Estimated return percentage
   - Risk level
   - Max drawdown
   - Sharpe ratio

### **Step 6: Execute Real Transaction**
1. Make sure your wallet is connected
2. Click **"🚀 Execute Strategy"**
3. **Approve the transaction** in your wallet
4. Wait for confirmation
5. Note the **Transaction ID**

### **Step 7: Verify Transaction**
1. Copy the transaction ID
2. Go to [Solana Explorer Devnet](https://explorer.solana.com/?cluster=devnet)
3. Paste the transaction ID and search
4. Verify the transaction details

---

## 🔍 **Testing Checklist**

### **✅ Wallet Connection**
- [ ] Wallet connects successfully
- [ ] Balance displays correctly
- [ ] Address shows in shortened format
- [ ] Disconnect button works

### **✅ Strategy Builder**
- [ ] Can drag and drop components
- [ ] Can configure node parameters
- [ ] Strategy simulation works
- [ ] Results display correctly

### **✅ Transaction Execution**
- [ ] "Execute Strategy" button is enabled when wallet connected
- [ ] Transaction approval popup appears
- [ ] Transaction executes successfully
- [ ] Transaction ID is displayed
- [ ] Transaction appears on Solana Explorer

### **✅ Error Handling**
- [ ] App handles wallet disconnection gracefully
- [ ] Error messages are clear and helpful
- [ ] App recovers from failed transactions
- [ ] Validation prevents invalid inputs

---

## 🐛 **Troubleshooting Common Issues**

### **Issue: Wallet Won't Connect**
**Solutions:**
- Make sure wallet is on devnet
- Refresh the page and try again
- Check browser console for errors
- Try a different wallet (Phantom vs Solflare)

### **Issue: "Execute Strategy" Button Disabled**
**Solutions:**
- Ensure wallet is connected
- Check that you have sufficient SOL balance
- Verify strategy has been configured
- Try refreshing the page

### **Issue: Transaction Fails**
**Solutions:**
- Check you have enough SOL for fees (0.000005 SOL minimum)
- Ensure wallet is on devnet
- Try with a smaller amount
- Check Solana Explorer for error details

### **Issue: App Shows Errors**
**Solutions:**
- Check browser console (F12) for error messages
- Refresh the page
- Clear browser cache
- Check network connectivity

---

## 📊 **Expected Results**

### **Successful Transaction Flow:**
1. **Wallet Connection**: ✅ Connected
2. **Strategy Simulation**: ✅ 12.5% estimated return
3. **Transaction Execution**: ✅ Success
4. **Transaction ID**: ✅ `5J7X...` (64-character string)
5. **Solana Explorer**: ✅ Transaction confirmed

### **Transaction Details to Verify:**
- **From**: Your wallet address
- **To**: Vault program address
- **Amount**: Your specified SOL amount
- **Status**: Confirmed
- **Fee**: ~0.000005 SOL

---

## 🎯 **Advanced Testing Scenarios**

### **Test 1: Multiple Deposits**
1. Execute strategy with 0.01 SOL
2. Execute another strategy with 0.02 SOL
3. Verify both transactions succeed
4. Check total deposited amount

### **Test 2: Error Scenarios**
1. Try executing without wallet connected
2. Try executing with insufficient balance
3. Try executing with zero amount
4. Verify appropriate error messages

### **Test 3: Performance Testing**
1. Execute multiple strategies rapidly
2. Test with different amounts
3. Verify all transactions complete
4. Check for any performance issues

---

## 📞 **Getting Help**

### **If You Encounter Issues:**
1. **Check the browser console** (F12 → Console tab)
2. **Verify wallet network** is set to devnet
3. **Check Solana Explorer** for transaction status
4. **Try with a different wallet** (Phantom vs Solflare)

### **Useful Links:**
- **Solana Explorer Devnet**: https://explorer.solana.com/?cluster=devnet
- **Solana Devnet Faucet**: https://faucet.solana.com/
- **Phantom Wallet**: https://phantom.app
- **Solflare Wallet**: https://solflare.com

---

## 🎉 **Success Criteria**

**Your testing is successful when:**
- ✅ Wallet connects and shows balance
- ✅ Strategy builder works with drag-and-drop
- ✅ Strategy simulation completes successfully
- ✅ Real transaction executes on devnet
- ✅ Transaction appears on Solana Explorer
- ✅ All error scenarios handled gracefully

**Ready to test? Let's go! 🚀** 