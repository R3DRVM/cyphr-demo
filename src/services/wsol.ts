// src/services/wsol.ts
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import {
  getAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  NATIVE_MINT,
} from '@solana/spl-token';

export const WSOL_MINT = NATIVE_MINT; // So111... (wrapped SOL mint)

export async function getWsolAta(owner: PublicKey): Promise<PublicKey> {
  return getAssociatedTokenAddress(WSOL_MINT, owner);
}

/**
 * Build a transaction that:
 *  - creates the WSOL ATA if missing
 *  - transfers `lamports` from owner to the WSOL ATA
 *  - syncs native to mark as WSOL balance
 */
export async function buildWrapSolTx(
  connection: Connection,
  owner: PublicKey,
  lamports: number,
): Promise<{ tx: Transaction; ata: PublicKey }> {
  const ata = await getAssociatedTokenAddress(WSOL_MINT, owner);
  const tx = new Transaction();

  // Ensure ATA exists
  try {
    await getAccount(connection, ata);
  } catch {
    tx.add(createAssociatedTokenAccountInstruction(owner, ata, owner, WSOL_MINT));
  }

  // Transfer SOL -> ATA, then sync native
  tx.add(
    SystemProgram.transfer({
      fromPubkey: owner,
      toPubkey: ata,
      lamports,
    }),
    createSyncNativeInstruction(ata),
  );

  return { tx, ata };
}

/**
 * Build a transaction that closes the WSOL ATA,
 * returning all lamports back to the owner as native SOL.
 */
export async function buildUnwrapSolTx(
  connection: Connection,
  owner: PublicKey,
): Promise<{ tx: Transaction; ata: PublicKey }> {
  const ata = await getAssociatedTokenAddress(WSOL_MINT, owner);
  const tx = new Transaction().add(createCloseAccountInstruction(ata, owner, owner));
  return { tx, ata };
}