import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair, TransactionInstruction } from '@solana/web3.js';

// Hardcoded treasury wallet for browser compatibility
// This is the private key from our treasury-wallet.json converted to base58
const TREASURY_PRIVATE_KEY = [201,139,141,94,197,2,240,147,1,248,216,72,98,20,122,206,171,247,89,243,53,197,131,202,164,52,137,121,201,236,63,135,151,11,112,158,140,17,29,187,75,105,243,9,238,62,50,130,216,91,39,190,30,104,255,201,219,222,83,135,167,46,60,105];
const TREASURY_ADDRESS = 'BAcgS8dQ3e5FgN1UWNEKPTjcGNQYBrNK97VQq2HMeuNG';

export class BrowserTreasuryService {
  private connection: Connection;
  private treasuryKeypair: Keypair;
  private treasuryAddress: PublicKey;

  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.treasuryKeypair = Keypair.fromSecretKey(new Uint8Array(TREASURY_PRIVATE_KEY));
    this.treasuryAddress = new PublicKey(TREASURY_ADDRESS);
  }

  async getBalance(): Promise<number> {
    try {
      const balance = await this.connection.getBalance(this.treasuryAddress);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting treasury balance:', error);
      throw new Error('Failed to get treasury balance');
    }
  }

  async sendToUser(userAddress: PublicKey, amountSOL: number, memo: string = ''): Promise<string> {
    try {
      const amountLamports = amountSOL * LAMPORTS_PER_SOL;
      
      // Check treasury balance
      const treasuryBalance = await this.getBalance();
      if (treasuryBalance < amountSOL) {
        throw new Error(`Insufficient treasury balance. Available: ${treasuryBalance.toFixed(4)} SOL, Requested: ${amountSOL} SOL`);
      }

      console.log('Treasury sending funds:', {
        from: this.treasuryAddress.toString(),
        to: userAddress.toString(),
        amount: amountSOL,
        balance: treasuryBalance
      });

      // Create transaction
      const transaction = new Transaction();
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: this.treasuryAddress,
        toPubkey: userAddress,
        lamports: amountLamports
      });
      transaction.add(transferInstruction);

      // Add memo if provided
      if (memo) {
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(memo, 'utf8')
        });
        transaction.add(memoInstruction);
      }

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.treasuryAddress;

      // Sign and send transaction
      transaction.sign(this.treasuryKeypair);
      
      console.log('Transaction signed, sending...');
      const signature = await this.connection.sendRawTransaction(transaction.serialize());
      
      console.log('Transaction sent, waiting for confirmation...');
      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }
      
      console.log('Transaction confirmed successfully:', signature);
      return signature;
      
    } catch (error) {
      console.error('Error in sendToUser:', error);
      throw error;
    }
  }

  async processWithdrawal(userAddress: PublicKey, depositAmount: number, targetAPY: number): Promise<{
    signature: string;
    originalDeposit: number;
    yieldEarned: number;
    totalReturn: number;
  }> {
    try {
      // Calculate yield (simple APY calculation)
      const yieldAmount = depositAmount * (targetAPY / 100);
      const totalReturn = depositAmount + yieldAmount;
      
      console.log('Processing withdrawal:', {
        userAddress: userAddress.toString(),
        depositAmount,
        targetAPY,
        yieldAmount,
        totalReturn
      });
      
      // Send funds back to user
      const memo = `Yield Strategy Withdrawal: ${depositAmount} SOL + ${yieldAmount.toFixed(4)} SOL yield (${targetAPY}% APY) = ${totalReturn.toFixed(4)} SOL total`;
      const signature = await this.sendToUser(userAddress, totalReturn, memo);
      
      return {
        signature,
        originalDeposit: depositAmount,
        yieldEarned: yieldAmount,
        totalReturn: totalReturn
      };
      
    } catch (error) {
      console.error('Error in processWithdrawal:', error);
      throw error;
    }
  }

  // Method to check if service is working
  async healthCheck(): Promise<boolean> {
    try {
      const balance = await this.getBalance();
      console.log('Treasury health check - Balance:', balance);
      return balance > 0;
    } catch (error) {
      console.error('Treasury health check failed:', error);
      return false;
    }
  }
}

// Factory function that always works in browser
export function createBrowserTreasuryService(): BrowserTreasuryService {
  return new BrowserTreasuryService();
}
