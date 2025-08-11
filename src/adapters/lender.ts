import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getConnection, confirmTx } from '../services/connection';
import { getProgram } from '../services/anchor';
import { getMintDecimals, uiToRaw } from '../services/token';
import { DEMO_MODE } from '../config/policy';
import pricesDevnet from '../config/prices.devnet.json';

/**
 * Generate a fake transaction signature for demo mode
 */
function generateFakeSignature(): string {
  return 'demo_lender_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Enable collateral for a given mint and amount
 */
export async function enableCollateral(mint: string, amount: number): Promise<{ signature: string }> {
  if (DEMO_MODE) {
    const fakeSig = generateFakeSignature();
    console.log(`[DEMO] Enable collateral: ${amount} ${mint}`);
    
    // Store demo state in localStorage
    const demoState = JSON.parse(localStorage.getItem('demo_lender_state') || '{}');
    demoState.collateral = { mint, amount };
    localStorage.setItem('demo_lender_state', JSON.stringify(demoState));
    
    return { signature: fakeSig };
  }

  // Real implementation using Anchor
  try {
    const program = getProgram();
    const connection = getConnection();
    const provider = program.provider;
    const wallet = provider.wallet;
    
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const mintPubkey = new PublicKey(mint);
    const decimals = await getMintDecimals(connection, mintPubkey);
    const amountRaw = uiToRaw(amount, decimals);

    // Derive PDA for collateral account
    const [collateralAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('collateral'), wallet.publicKey.toBuffer(), mintPubkey.toBuffer()],
      program.programId
    );

    // Try different method names for enabling collateral
    const methodNames = ['enableCollateral', 'depositCollateral', 'deposit'];
    let method = null;
    
    for (const methodName of methodNames) {
      if (program.methods[methodName]) {
        method = program.methods[methodName];
        break;
      }
    }
    
    if (!method) {
      throw new Error(`No suitable method found. Tried: ${methodNames.join(', ')}`);
    }

    const tx = await method(amountRaw)
      .accounts({
        user: wallet.publicKey,
        collateralAccount,
        mint: mintPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await confirmTx(tx);
    return { signature: tx };
  } catch (error) {
    console.error('Real enableCollateral failed:', error);
    throw error;
  }
}

/**
 * Borrow assets against collateral
 */
export async function borrow(borrowMint: string, amount: number): Promise<{ signature: string }> {
  if (DEMO_MODE) {
    const fakeSig = generateFakeSignature();
    console.log(`[DEMO] Borrow: ${amount} ${borrowMint}`);
    
    // Store demo state in localStorage
    const demoState = JSON.parse(localStorage.getItem('demo_lender_state') || '{}');
    demoState.debt = { mint: borrowMint, amount };
    localStorage.setItem('demo_lender_state', JSON.stringify(demoState));
    
    return { signature: fakeSig };
  }

  // Real implementation using Anchor
  try {
    const program = getProgram();
    const connection = getConnection();
    const provider = program.provider;
    const wallet = provider.wallet;
    
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const borrowMintPubkey = new PublicKey(borrowMint);
    const decimals = await getMintDecimals(connection, borrowMintPubkey);
    const amountRaw = uiToRaw(amount, decimals);

    // Derive PDA for debt account
    const [debtAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('debt'), wallet.publicKey.toBuffer(), borrowMintPubkey.toBuffer()],
      program.programId
    );

    // Try different method names for borrowing
    const methodNames = ['borrow', 'borrowAsset'];
    let method = null;
    
    for (const methodName of methodNames) {
      if (program.methods[methodName]) {
        method = program.methods[methodName];
        break;
      }
    }
    
    if (!method) {
      throw new Error(`No suitable method found. Tried: ${methodNames.join(', ')}`);
    }

    const tx = await method(amountRaw)
      .accounts({
        user: wallet.publicKey,
        debtAccount,
        mint: borrowMintPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await confirmTx(tx);
    return { signature: tx };
  } catch (error) {
    console.error('Real borrow failed:', error);
    throw error;
  }
}

/**
 * Repay borrowed assets
 */
export async function repay(borrowMint: string, amount: number): Promise<{ signature: string }> {
  if (DEMO_MODE) {
    const fakeSig = generateFakeSignature();
    console.log(`[DEMO] Repay: ${amount} ${borrowMint}`);
    
    // Update demo state in localStorage
    const demoState = JSON.parse(localStorage.getItem('demo_lender_state') || '{}');
    if (demoState.debt) {
      demoState.debt.amount = Math.max(0, demoState.debt.amount - amount);
    }
    localStorage.setItem('demo_lender_state', JSON.stringify(demoState));
    
    return { signature: fakeSig };
  }

  // Real implementation using Anchor
  try {
    const program = getProgram();
    const connection = getConnection();
    const provider = program.provider;
    const wallet = provider.wallet;
    
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const borrowMintPubkey = new PublicKey(borrowMint);
    const decimals = await getMintDecimals(connection, borrowMintPubkey);
    const amountRaw = uiToRaw(amount, decimals);

    // Derive PDA for debt account
    const [debtAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('debt'), wallet.publicKey.toBuffer(), borrowMintPubkey.toBuffer()],
      program.programId
    );

    // Try different method names for repaying
    const methodNames = ['repay', 'repayAsset'];
    let method = null;
    
    for (const methodName of methodNames) {
      if (program.methods[methodName]) {
        method = program.methods[methodName];
        break;
      }
    }
    
    if (!method) {
      throw new Error(`No suitable method found. Tried: ${methodNames.join(', ')}`);
    }

    const tx = await method(amountRaw)
      .accounts({
        user: wallet.publicKey,
        debtAccount,
        mint: borrowMintPubkey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await confirmTx(tx);
    return { signature: tx };
  } catch (error) {
    console.error('Real repay failed:', error);
    throw error;
  }
}

/**
 * Get health factor and other lending metrics
 */
export async function getHealth(): Promise<{ ltv: number; healthFactor: number; apr: number }> {
  const liqThreshold = 0.85; // 85% liquidation threshold
  const apr = 0.12; // 12% APR fallback

  if (DEMO_MODE) {
    // Return demo health metrics from localStorage
    const demoState = JSON.parse(localStorage.getItem('demo_lender_state') || '{}');
    const collateralAmount = demoState.collateral?.amount || 0;
    const debtAmount = demoState.debt?.amount || 0;
    
    // Get prices (fallback to SOL/USDC_DEV)
    const collateralPrice = (pricesDevnet as any)['SOL'] || 150;
    const debtPrice = (pricesDevnet as any)['USDC_DEV'] || 1;
    
    const collateralUsd = collateralAmount * collateralPrice;
    const debtUsd = debtAmount * debtPrice;
    
    const ltv = collateralUsd > 0 ? debtUsd / Math.max(collateralUsd, 1) : 0;
    const healthFactor = (collateralUsd * liqThreshold) / Math.max(debtUsd, 1);
    
    return { 
      ltv: Math.round(ltv * 100) / 100, 
      healthFactor: Math.round(healthFactor * 100) / 100, 
      apr: Math.round(apr * 100) / 100 
    };
  }

  // Real implementation - fetch from on-chain accounts
  try {
    const program = getProgram();
    const provider = program.provider;
    const wallet = provider.wallet;
    
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // For now, return mock values until we have proper account fetching
    // In a real implementation, you would fetch collateral and debt accounts
    // and calculate health metrics based on on-chain data
    const collateralUsd = 1000; // Mock $1000 collateral
    const debtUsd = 300; // Mock $300 debt
    
    const ltv = collateralUsd > 0 ? debtUsd / Math.max(collateralUsd, 1) : 0;
    const healthFactor = (collateralUsd * liqThreshold) / Math.max(debtUsd, 1);
    
    return { 
      ltv: Math.round(ltv * 100) / 100, 
      healthFactor: Math.round(healthFactor * 100) / 100, 
      apr: Math.round(apr * 100) / 100 
    };
  } catch (error) {
    console.error('Real getHealth failed:', error);
    throw error;
  }
}
