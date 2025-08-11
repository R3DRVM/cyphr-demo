// src/services/anchor.ts
import * as anchor from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import idlJson from '../idl/cyphr.json';

const PROGRAM_ID_STR = (import.meta as any).env?.VITE_PROGRAM_ID as string | undefined;
if (!PROGRAM_ID_STR) throw new Error('VITE_PROGRAM_ID missing in .env.local');

export function getProvider() {
  const wallet = (window as any).solana;
  if (!wallet?.publicKey) throw new Error('Wallet not connected');
  const connection = new anchor.web3.Connection(
    (import.meta as any).env?.VITE_RPC_PRIMARY || 'https://api.devnet.solana.com',
    'confirmed'
  );
  const provider = new anchor.AnchorProvider(connection, wallet, { preflightCommitment: 'confirmed' });
  anchor.setProvider(provider);
  return provider;
}

export function getProgram<T extends Idl = Idl>() {
  const provider = getProvider();
  const idl = idlJson as unknown as T;
  const programId = new anchor.web3.PublicKey(PROGRAM_ID_STR!);
  // Use the working pattern from the scripts
  return new (anchor.Program as any)(idl, programId, provider);
}

