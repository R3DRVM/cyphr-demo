// Chat controller with pure functions (no hooks)
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { ChatSessionApi, ChatDeps, YieldParams } from './types';
import { getConfigSnapshot } from '../services/config';

export function buildChatApi(deps: ChatDeps): ChatSessionApi {
  const {
    emitUser, emitBot, emitChips, emitHash, clearChips,
    wallet, connection, config, tx, sessionStore,
  } = deps;

    async function startYieldFlow(targetBps: number): Promise<void> {
    const opId = `start_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.info('[YIELD_START]', { opId, targetBps });

    try {
      // Inflight guard - prevent double-firing
      if (sessionStore.getInflight && sessionStore.getInflight()) {
        console.warn('[YIELD_START] Operation already in progress, ignoring');
        return;
      }

      // Get and validate configuration
      const configSnapshot = getConfigSnapshot();
      console.info('[YIELD_CONFIG]', configSnapshot);

      // 1. Check cluster requirement
      if (configSnapshot.cluster !== 'devnet') {
        emitBot('Devnet required — please switch your wallet to Devnet.');
        return;
      }

      // 2. Check wallet connection
      if (!wallet.publicKey) {
        emitBot('Wallet not connected — click Connect Wallet and try again.');
        return;
      }

      // 3. Validate vault configuration
      if (!configSnapshot.vault) {
        emitBot('Invalid vault configuration — set VITE_DEMO_VAULT_PUBKEY to a Devnet address different from your wallet.');
        emitBot('Try: npm run treasury:address and paste the result into .env.local.');
        return;
      }

      let vaultPubkey: PublicKey;
      try {
        vaultPubkey = new PublicKey(configSnapshot.vault);
      } catch {
        emitBot('Invalid vault configuration — VITE_DEMO_VAULT_PUBKEY must be a valid base58 address.');
        emitBot('Try: npm run treasury:address and paste the result into .env.local.');
        return;
      }

      // 4. Prevent self-transfer
      if (vaultPubkey.equals(wallet.publicKey)) {
        emitBot('Invalid vault configuration — vault cannot be your wallet address.');
        emitBot('Try: npm run treasury:address and paste the result into .env.local.');
        return;
      }

      // User message and bot response
      emitUser(`Find me a ${Math.round(targetBps / 100)}% yield farm`);
      emitBot('🔎 Finding yield opportunities...');

      // Config echo based on mode
      const vaultShort = `${configSnapshot.vault.slice(0, 3)}...${configSnapshot.vault.slice(-6)}`;
      const configEcho = `[cfg] real=${configSnapshot.forceReal} · cluster=${configSnapshot.cluster} · vault=${vaultShort}`;

      if (!configSnapshot.forceReal) {
        emitBot("You're in Demo Mode (no real SOL moved). Set VITE_FORCE_REAL_DEPOSIT=true and restart.");
        emitBot(configEcho);
      } else {
        emitBot(configEcho);
      }

      // Show amount chips
      setTimeout(() => {
        console.debug('[YIELD_START] Showing amount selection chips');
        emitChips('Found a promising strategy! How much SOL would you like to deposit?', [
          { id: 'amt_01', label: '0.1 SOL', action: 'select-amount', payload: { amount: 0.1 } },
          { id: 'amt_05', label: '0.5 SOL', action: 'select-amount', payload: { amount: 0.5 } },
          { id: 'amt_10', label: '1.0 SOL', action: 'select-amount', payload: { amount: 1.0 } },
          { id: 'amt_custom', label: 'Custom', action: 'custom-amount', payload: {} }
        ]);

        sessionStore.setPending({
          kind: 'yield',
          targetBps,
          step: 'choose-amount',
          createdAt: Date.now()
        });
        console.debug('[YIELD_START] Flow initialized successfully');
      }, 1000);

    } catch (error: any) {
      console.error('[YIELD_FLOW_ERROR]', error);
      emitBot(`Error: ${tx.humanError(error)}`);
    }
  }

    async function chooseAmount(lamports: number): Promise<void> {
    console.info('[YIELD_AMOUNT]', { deposit: lamports, targetBps: sessionStore.getPending()?.targetBps });
    
    try {
      const pending = sessionStore.getPending();
      if (!pending || pending.kind !== 'yield' || pending.step !== 'choose-amount') {
        console.warn('[YIELD_AMOUNT] Invalid state or session expired');
        emitBot('Session expired; let\'s start fresh 👋');
        return;
      }

      console.debug('[YIELD_AMOUNT] Advancing to confirmation step');
      emitUser(`${(lamports / LAMPORTS_PER_SOL).toFixed(1)} SOL`);

      const targetPercent = (pending.targetBps / 100).toFixed(1);
      emitChips(`Got it — proceed with ${(lamports / LAMPORTS_PER_SOL).toFixed(1)} SOL targeting ~${targetPercent}%?`, [
        { id: 'confirm_yes', label: 'Yes', action: 'confirm-deposit', payload: { confirmed: true } },
        { id: 'confirm_no', label: 'No', action: 'confirm-deposit', payload: { confirmed: false } }
      ]);

      sessionStore.setPending({
        ...pending,
        amountLamports: lamports,
        step: 'confirm'
      });

      console.debug('[YIELD_AMOUNT] Confirmation chips displayed');

    } catch (error: any) {
      console.error('[YIELD_FLOW_ERROR]', error);
      emitBot(`Error: ${tx.humanError(error)}`);
    }
  }

  async function confirmAndExecute(): Promise<void> {
        const opId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.info('[YIELD_CONFIRM] executing transaction, opId:', opId);

    try {
      // Runtime guard: ensure wallet is still connected
      if (!wallet?.publicKey) {
        emitBot('Connect your wallet to continue.');
        return;
      }

      // Inflight guard
      if (sessionStore.getInflight()) {
        console.warn('[YIELD_CONFIRM] Operation already in progress, ignoring');
        return;
      }

      const pending = sessionStore.getPending();
      if (!pending || pending.kind !== 'yield' || pending.step !== 'confirm') {
        emitBot('Session expired; let\'s start fresh 👋');
        return;
      }

      const { amountLamports, targetBps } = pending;

      // Set inflight lock
      sessionStore.setInflight(opId);
      
      emitUser('Yes');
      emitBot(`Processing ${(amountLamports / LAMPORTS_PER_SOL).toFixed(2)} SOL — I'll ask for one signature`);

      // Get config for real vs demo behavior
      const configSnapshot = getConfigSnapshot();
      console.info('[YIELD_CONFIRM] Config validation:', configSnapshot);

      if (!configSnapshot.forceReal) {
        console.warn('[YIELD_CONFIRM] Demo mode - no real transfer');
        
        // Create a demo transaction hash
        const demoSig = 'demo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const shortSig = tx.shortSig(demoSig);
        
        // Emit demo hash with completed status immediately
        emitHash(demoSig, shortSig, '', `Demo: Depositing ${(amountLamports / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
        
        // Show demo success message
        emitBot('✅ Demo transaction completed (no real transfer)');
        
        // Continue with session setup for demo
        sessionStore.setActiveYield({
          depositLamports: amountLamports,
          targetBps,
          alreadyCredited: 0,
          lastBundleSig: demoSig,
          startedAt: Date.now(),
        });

        sessionStore.clearPending();
        sessionStore.setInflight(null);

        // Show post-action chips
        emitChips('Your funds are now earning yield. What would you like to do next?', [
          { id: 'withdraw', label: 'Withdraw now', action: 'withdraw-yield', payload: {} },
          { id: 'run_again', label: 'Run again', action: 'run-again', payload: {} },
          { id: 'change_target', label: 'Change target', action: 'change-target', payload: {} }
        ]);
        
        return;
      }

      // REAL MODE: Execute actual devnet transfer
      console.info('[YIELD_CONFIRM] Real mode - executing devnet transfer');

      // Record pre-balance for delta calculation
      const preLamports = await connection.getBalance(wallet.publicKey!, 'confirmed');
      console.info('[YIELD_DELTA] pre:', (preLamports / LAMPORTS_PER_SOL).toFixed(4), 'SOL');

      // Validate vault
      const vaultPubkey = new PublicKey(configSnapshot.vault!);
      console.info('[YIELD_CONFIRM] Vault:', vaultPubkey.toBase58());

      // Create transaction builder for the bulletproof send path
      const { buildDepositTx } = await import('../services/txBundler');
      const txBuilder = ({ blockhash }: { blockhash: string }) => 
        buildDepositTx({
          fromPubkey: wallet.publicKey!,
          vaultPubkey,
          lamports: amountLamports,
          recentBlockhash: blockhash
        });

      // Emit pending hash before sending
      const hashMsgId = emitHash('pending', 'pending...', '', `Depositing ${(amountLamports / LAMPORTS_PER_SOL).toFixed(2)} SOL`);
      
      // Send with bulletproof method
      const { signAndSendWithFreshBlockhash } = await import('../services/walletBridge');
      const { signature } = await signAndSendWithFreshBlockhash({
        connection,
        txBuilder,
        walletAdapter: wallet,
        windowProvider: (window as any).solana,
        preflightCommitment: 'confirmed',
        waitCommitment: 'finalized',
        opId
      });
      
      // Update the hash message with real signature and completed status
      const shortSig = tx.shortSig(signature);
      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      
      const { updateHashMsg } = await import('../state/chatSession');
      updateHashMsg(hashMsgId, signature, shortSig, explorerUrl, `Depositing ${(amountLamports / LAMPORTS_PER_SOL).toFixed(2)} SOL`, 'completed');

      // Fetch post-balance and show delta
      const postLamports = await connection.getBalance(wallet.publicKey!, 'confirmed');
      const deltaLamports = postLamports - preLamports;
      const deltaSol = deltaLamports / LAMPORTS_PER_SOL;
      const feeSol = Math.abs(deltaSol) - (amountLamports / LAMPORTS_PER_SOL);
      
      console.info('[YIELD_DELTA]', { 
        pre: (preLamports / LAMPORTS_PER_SOL).toFixed(4),
        post: (postLamports / LAMPORTS_PER_SOL).toFixed(4), 
        fee: feeSol.toFixed(4)
      });

      if (Math.abs(deltaSol) > 0.0001) {
        emitBot(`wallet: ${(preLamports / LAMPORTS_PER_SOL).toFixed(4)} → ${(postLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL (${deltaSol > 0 ? '+' : ''}${deltaSol.toFixed(4)})`);
      } else {
        console.warn('[YIELD_DELTA] No significant balance change detected');
        emitBot('✅ Transaction completed successfully');
      }

      // Save session
      sessionStore.setActiveYield({
        depositLamports: amountLamports,
        targetBps,
        alreadyCredited: 0,
        lastBundleSig: signature,
        startedAt: Date.now(),
      });

      sessionStore.clearPending();
      sessionStore.setInflight(null); // Clear inflight lock

      // Show post-action chips
      emitChips('Your funds are now earning yield. What would you like to do next?', [
        { id: 'withdraw', label: 'Withdraw now', action: 'withdraw-yield', payload: {} },
        { id: 'run_again', label: 'Run again', action: 'run-again', payload: {} },
        { id: 'change_target', label: 'Change target', action: 'change-target', payload: {} }
      ]);
      
    } catch (error: any) {
      console.error('[YIELD_FLOW_ERROR]', error);
      emitBot(`Transaction failed: ${tx.humanError(error)}`);
      sessionStore.clearPending();
      sessionStore.setInflight(null); // Clear inflight lock on error
    }
  }

    async function withdrawNow(): Promise<void> {
    console.info('[WITHDRAW_START]');

    try {
      // Runtime guard: ensure wallet is still connected
      if (!wallet?.publicKey) {
        emitBot('Connect your wallet to continue.');
        return;
      }

      const ys = sessionStore.getActiveYield();
      if (!ys) {
        emitChips('No active yield this session. Want me to run ~15% on 1 SOL?', [
          { id: 'new_yield', label: 'Yes, start new yield', action: 'select-amount', payload: { amount: 1.0 } },
          { id: 'different', label: 'Different amount', action: 'custom-amount', payload: {} }
        ]);
        return;
      }

      emitUser('Withdraw now');
      emitBot('Withdrawing deposit + rewards...');
      
      const payoutLamports = tx.calcPayout(ys);
      const ix = SystemProgram.transfer({
        fromPubkey: new PublicKey(config.vaultPubkey()),
        toPubkey: wallet.publicKey!,
        lamports: payoutLamports,
      });
      
      const transaction = tx.build([ix]);
      const { signature } = await tx.treasurySignAndSend(connection, transaction);
      
      const shortSig = tx.shortSig(signature);
      emitHash(signature, shortSig, `https://explorer.solana.com/tx/${signature}?cluster=devnet`, `Withdrawing ${(payoutLamports / config.LAMPORTS_PER_SOL()).toFixed(2)} SOL`);

      const before = await tx.getBalance(connection, wallet.publicKey!);
      await tx.sleep(500);
      const after = await tx.getBalance(connection, wallet.publicKey!);
      emitBot(tx.deltaLine(before, after, config.LAMPORTS_PER_SOL()));

      sessionStore.clearActiveYield();
      console.info('[WITHDRAW_FINALIZED] signature:', signature);
      
    } catch (error: any) {
      console.error('[WITHDRAW_ERROR]', error);
      emitBot(`Withdrawal failed: ${tx.humanError(error)}`);
    }
  }

  return { startYieldFlow, chooseAmount, confirmAndExecute, withdrawNow };
}

export type { ChatSessionApi };
