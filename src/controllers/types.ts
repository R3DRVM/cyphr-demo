// Type definitions for chat controller
import { Connection, PublicKey } from '@solana/web3.js';

export interface ChatDeps {
  emitUser: (text: string) => void;
  emitBot: (text: string, chips?: Array<{ id: string; label: string; action: string; payload?: any }>) => void;
  emitChips: (text: string, chips: Array<{ id: string; label: string; action: string; payload?: any }>) => void;
  emitHash: (sig: string, short: string, url: string, label: string) => void;
  clearChips: () => void;
  wallet: {
    publicKey: PublicKey | null;
    sendTransaction?: (tx: any, connection: Connection, options?: any) => Promise<string>;
    signTransaction?: (tx: any) => Promise<any>;
  };
  connection: Connection;
  config: {
    isDevnet: () => boolean;
    forceRealDeposit: () => boolean;
    vaultPubkey: () => string;
    LAMPORTS_PER_SOL: () => number;
  };
  tx: {
    memoIx: (memo: string) => any;
    build: (ixs: any[]) => any;
    signAndSendWithFreshBlockhash: (connection: Connection, tx: any, wallet: any) => Promise<{ signature: string }>;
    confirm: (connection: Connection, signature: string) => Promise<boolean>;
    getBalance: (connection: Connection, pubkey: PublicKey) => Promise<number>;
    sleep: (ms: number) => Promise<void>;
    deltaLine: (before: number, after: number, divisor: number) => string;
    shortSig: (sig: string) => string;
    humanError: (error: any) => string;
    calcPayout: (session: any) => number;
    treasurySignAndSend: (connection: Connection, tx: any) => Promise<{ signature: string }>;
  };
  sessionStore: {
    setPending: (pending: any) => void;
    getPending: () => any;
    clearPending: () => void;
    setActiveYield: (session: any) => void;
    getActiveYield: () => any;
    clearActiveYield: () => void;
    setInflight: (opId: string | null) => void;
    getInflight: () => any;
  };
}

export interface YieldParams {
  targetBps: number;
  amountLamports?: number;
  step?: string;
}

export interface ChatSessionApi {
  startYieldFlow: (targetBps: number) => Promise<void>;
  chooseAmount: (lamports: number) => Promise<void>;
  confirmAndExecute: () => Promise<void>;
  withdrawNow: () => Promise<void>;
}
