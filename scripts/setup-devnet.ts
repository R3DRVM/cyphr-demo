import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo, 
  transfer,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';

const DEVNET_RPC = 'https://api.devnet.solana.com';

interface TokenConfig {
  symbol: string;
  mint: string;
  decimals: number;
  name: string;
}

interface DevnetConfig {
  tokens: {
    collateral: TokenConfig;
    debt: TokenConfig;
  };
  tokenSwap: {
    pool: string;
    authority: string;
    poolToken: string;
    feeAccount: string;
  };
}

async function main() {
  console.log('🚀 Setting up Cyphr devnet environment...');
  
  // Connect to devnet
  const connection = new Connection(DEVNET_RPC, 'confirmed');
  
  // Generate keypairs for testing
  const payer = Keypair.generate();
  const mintAuthority = Keypair.generate();
  const poolAuthority = Keypair.generate();
  
  console.log('📝 Generated keypairs for devnet setup');
  
  // Airdrop SOL to payer
  console.log('💰 Airdropping SOL to payer...');
  const airdropSig = await connection.requestAirdrop(payer.publicKey, 10 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(airdropSig);
  
  // Airdrop SOL to mint authority
  const mintAirdropSig = await connection.requestAirdrop(mintAuthority.publicKey, 2 * LAMPORTS_PER_SOL);
  await connection.confirmTransaction(mintAirdropSig);
  
  // Create collateral token (SOL-like token)
  console.log('🪙 Creating collateral token...');
  const collateralTokenMint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null,
    9 // 9 decimals like SOL
  );
  
  // Create debt token (USDC-like token)
  console.log('💵 Creating debt token...');
  const debtTokenMint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    null,
    6 // 6 decimals like USDC
  );
  
  // Mint some tokens for testing
  console.log('🏭 Minting test tokens...');
  
  // Create token accounts
  const payerCollateralAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    collateralTokenMint,
    payer.publicKey
  );
  const payerDebtAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    debtTokenMint,
    payer.publicKey
  );
  
  // Mint tokens
  await mintTo(
    connection,
    payer,
    collateralTokenMint,
    payerCollateralAccount.address,
    mintAuthority,
    1000 * Math.pow(10, 9)
  );
  await mintTo(
    connection,
    payer,
    debtTokenMint,
    payerDebtAccount.address,
    mintAuthority,
    10000 * Math.pow(10, 6)
  );
  
  // Create simple token swap pool (simplified - in real implementation would use SPL Token Swap)
  console.log('🔄 Creating token swap pool...');
  
  // For demo purposes, we'll create a simple pool structure
  const poolKeypair = Keypair.generate();
  const poolTokenKeypair = Keypair.generate();
  const feeAccountKeypair = Keypair.generate();
  
  // Create pool token accounts
  const poolTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    collateralTokenMint,
    poolKeypair.publicKey
  );
  const poolDebtAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    debtTokenMint,
    poolKeypair.publicKey
  );
  
  // Create fee account
  const feeAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    debtTokenMint,
    feeAccountKeypair.publicKey
  );
  
  // Transfer some tokens to pool for liquidity
  await transfer(
    connection,
    payer,
    payerCollateralAccount.address,
    poolTokenAccount.address,
    payer,
    100 * Math.pow(10, 9)
  );
  await transfer(
    connection,
    payer,
    payerDebtAccount.address,
    poolDebtAccount.address,
    payer,
    10000 * Math.pow(10, 6)
  );
  
  // Create config object
  const config = {
    swapState: poolKeypair.publicKey.toString(),
    swapAuthority: poolAuthority.publicKey.toString(),
    poolTokenMint: poolTokenKeypair.publicKey.toString(),
    feeAccount: feeAccount.address.toString(),
    mintA: collateralTokenMint.toString(),
    mintB: debtTokenMint.toString(),
    vaultA: poolTokenAccount.address.toString(),
    vaultB: poolDebtAccount.address.toString(),
    hostFeeAccount: null,
    tokens: {
      collateral: {
        symbol: 'SOL',
        mint: collateralTokenMint.toString(),
        decimals: 9,
        name: 'Wrapped SOL (Devnet)'
      },
      debt: {
        symbol: 'USDC',
        mint: debtTokenMint.toString(),
        decimals: 6,
        name: 'USD Coin (Devnet)'
      }
    },
    tokenSwap: {
      pool: poolKeypair.publicKey.toString(),
      authority: poolAuthority.publicKey.toString(),
      poolToken: poolTokenKeypair.publicKey.toString(),
      feeAccount: feeAccount.address.toString()
    }
  };
  
  // Write config to file
  const configPath = path.join(__dirname, '../src/config/tokens.devnet.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('✅ Devnet setup complete!');
  console.log('📁 Config written to:', configPath);
  console.log('\n🔑 Key Information:');
  console.log('Payer:', payer.publicKey.toString());
  console.log('Mint Authority:', mintAuthority.publicKey.toString());
  console.log('Collateral Token:', collateralTokenMint.toString());
  console.log('Debt Token:', debtTokenMint.toString());
  console.log('Pool:', poolKeypair.publicKey.toString());
  
  // Save private keys for testing (in real implementation, use proper key management)
  const keysPath = path.join(__dirname, '../devnet-keys.json');
  const keys = {
    payer: Array.from(payer.secretKey),
    mintAuthority: Array.from(mintAuthority.secretKey),
    poolAuthority: Array.from(poolAuthority.secretKey),
    pool: Array.from(poolKeypair.secretKey),
    poolToken: Array.from(poolTokenKeypair.secretKey),
    feeAccount: Array.from(feeAccountKeypair.secretKey)
  };
  fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
  console.log('🔐 Private keys saved to:', keysPath);
  console.log('⚠️  WARNING: These are test keys only. Never use in production!');
}

main().catch(console.error);
