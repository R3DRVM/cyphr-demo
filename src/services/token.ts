// src/services/token.ts
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  getMint,
} from '@solana/spl-token';

export async function ensureAta(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
): Promise<{ ata: PublicKey; ix?: TransactionInstruction }> {
  const ata = await getAssociatedTokenAddress(mint, owner);
  try {
    await getAccount(connection, ata);
    return { ata };
  } catch {
    return {
      ata,
      ix: createAssociatedTokenAccountInstruction(owner, ata, owner, mint),
    };
  }
}

export async function getMintDecimals(connection: Connection, mint: PublicKey): Promise<number> {
  const info = await getMint(connection, mint);
  return info.decimals ?? 0;
}

export function uiToRaw(amountUi: number, decimals: number): bigint {
  return BigInt(Math.round(amountUi * 10 ** decimals));
}

export function rawToUi(amountRaw: bigint | number, decimals: number): number {
  const n = typeof amountRaw === 'bigint' ? Number(amountRaw) : amountRaw;
  return n / 10 ** decimals;
}