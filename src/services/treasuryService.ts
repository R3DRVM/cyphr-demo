import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Keypair } from '@solana/web3.js';
import { Buffer } from 'buffer';

interface TreasuryConfig {
  address: string;
  privateKey: number[];
  endpoint: string;
}

export class TreasuryService {
  private connection: Connection;
  private treasuryKeypair: Keypair;
  private treasuryAddress: PublicKey;

  constructor(config: TreasuryConfig) {
    this.connection = new Connection(config.endpoint, 'confirmed');
    this.treasuryKeypair = Keypair.fromSecretKey(new Uint8Array(config.privateKey));
    this.treasuryAddress = new PublicKey(config.address);
  }

  async getBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.treasuryAddress);
    return balance / LAMPORTS_PER_SOL;
  }

  async sendToUser(userAddress: PublicKey, amountSOL: number, memo: string = ''): Promise<string> {
    const amountLamports = amountSOL * LAMPORTS_PER_SOL;
    
    // Check treasury balance
    const treasuryBalance = await this.getBalance();
    if (treasuryBalance < amountSOL) {
      throw new Error(`Insufficient treasury balance. Available: ${treasuryBalance} SOL, Requested: ${amountSOL} SOL`);
    }

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
    const signature = await this.connection.sendRawTransaction(transaction.serialize());
    
    // Wait for confirmation
    await this.connection.confirmTransaction(signature, 'confirmed');
    
    return signature;
  }

  async processWithdrawal(userAddress: PublicKey, depositAmount: number, targetAPY: number): Promise<{
    signature: string;
    originalDeposit: number;
    yieldEarned: number;
    totalReturn: number;
  }> {
    // Calculate yield (simple APY calculation)
    const yieldAmount = depositAmount * (targetAPY / 100);
    const totalReturn = depositAmount + yieldAmount;
    
    // Send funds back to user
    const memo = `Yield Strategy Withdrawal: ${depositAmount} SOL + ${yieldAmount.toFixed(4)} SOL yield (${targetAPY}% APY) = ${totalReturn.toFixed(4)} SOL total`;
    const signature = await this.sendToUser(userAddress, totalReturn, memo);
    
    return {
      signature,
      originalDeposit: depositAmount,
      yieldEarned: yieldAmount,
      totalReturn: totalReturn
    };
  }
}

// Factory function to create treasury service from saved wallet
export async function createTreasuryService(): Promise<TreasuryService | null> {
  try {
    // Try to load treasury wallet from file
    const fs = await import('fs');
    const treasuryData = JSON.parse(fs.readFileSync('treasury-wallet.json', 'utf8'));
    
    return new TreasuryService({
      address: treasuryData.address,
      privateKey: treasuryData.privateKey,
      endpoint: 'https://api.devnet.solana.com'
    });
  } catch (error) {
    console.warn('Treasury wallet not found or invalid:', error);
    return null;
  }
}
