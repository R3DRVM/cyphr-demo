import React, { createContext, useContext, useMemo } from 'react';
import { buildChatApi } from '../controllers/chatController';
import { useChatSession, addBotMsg, addUserMsg, addHashMsg } from './chatSession';
import { useWalletSafe } from '../hooks/useWalletSafe';
import { InlineNotice } from '../components/InlineNotice';
import { getForceRealDeposit, getDemoVaultPubkey } from '../services/config';
import { signAndSendWithFreshBlockhash } from '../services/walletBridge';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { shortSig, deltaLine } from '../utils/txUi';
import { createMemoInstruction } from '../services/txBundler';
import type { ChatSessionApi } from '../controllers/types';

const ChatCtx = createContext<any>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const session = useChatSession(); // ✅ hooks only inside component
  const { wallet, connection, ok, reason } = useWalletSafe();

  // Guard against wallet provider not being available
  if (!ok) {
    return (
      <div>
        <InlineNotice 
          text={`Wallet context not mounted: ${reason}. Please restart dev server.`}
          type="error" 
        />
        {children}
      </div>
    );
  }

  const api = useMemo(() => {
    const config = {
      isDevnet: () => {
        const endpoint = connection.rpcEndpoint;
        return endpoint.includes('devnet');
      },
      forceRealDeposit: getForceRealDeposit,
      vaultPubkey: getDemoVaultPubkey,
      LAMPORTS_PER_SOL: () => LAMPORTS_PER_SOL,
    };

    const tx = {
      memoIx: (memo: string) => createMemoInstruction(memo),
      build: (ixs: any[]) => {
        const transaction = new Transaction();
        transaction.add(...ixs);
        return transaction;
      },
      signAndSendWithFreshBlockhash,
      confirm: async (connection: any, signature: string) => {
        try {
          // Simple confirmation - in real app would use proper confirmation strategy
          await new Promise(resolve => setTimeout(resolve, 2000));
          return true;
        } catch {
          return false;
        }
      },
      getBalance: async (connection: any, pubkey: any) => {
        try {
          return await connection.getBalance(pubkey);
        } catch {
          return 0;
        }
      },
      sleep: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
      deltaLine: (before: number, after: number, divisor: number) => 
        deltaLine(before / divisor, after / divisor),
      shortSig,
      humanError: (error: any) => {
        const msg = error?.message || String(error);
        if (msg.includes('User rejected')) return 'Transaction cancelled by user';
        if (msg.includes('blockhash')) return 'Transaction expired, please try again';
        if (msg.includes('Insufficient funds')) return 'Insufficient SOL balance';
        return msg;
      },
      calcPayout: (yieldSession: any) => {
        const { depositLamports, targetBps } = yieldSession;
        const yieldAmount = Math.floor(depositLamports * targetBps / 10000);
        return depositLamports + yieldAmount;
      },
      treasurySignAndSend: async (connection: any, tx: any) => {
        // In real app, this would use treasury keypair
        // For demo, we'll simulate
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { signature: 'demo_treasury_' + Math.random().toString(36).substr(2, 9) };
      }
    };

    const sessionStore = {
      setPending: session.setPending,
      getPending: () => session.pending,
      clearPending: session.clearPending,
      setActiveYield: session.setYieldSession,
      getActiveYield: () => session.yieldSession,
      clearActiveYield: () => session.setYieldSession(null),
      setInflight: session.setInflight,
      getInflight: () => session.inflight,
    };

    return buildChatApi({
      emitUser: addUserMsg,
      emitBot: addBotMsg,
      emitChips: (text: string, chips: Array<{ id: string; label: string; action: string; payload?: any }>) => {
        addBotMsg(text, chips);
      },
      emitHash: addHashMsg,
      clearChips: () => {}, // Chips are managed by message state
      wallet,
      connection,
      config,
      tx,
      sessionStore,
    });
  }, [session, wallet, connection]);

  return (
    <ChatCtx.Provider value={{ session, api }}>
      {children}
    </ChatCtx.Provider>
  );
}

export function useChat(): { session: any; api: ChatSessionApi } {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
