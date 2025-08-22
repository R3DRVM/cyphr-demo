import { useCallback } from 'react';
import { parseIntent } from '../services/aiIntent';
import { 
  runGuidedYield, 
  withdrawYield, 
  depositSol, 
  borrowUsdc, 
  repayAll 
} from '../services/chatActions';
import { useChatSession } from '../state/chatSession';
import { WalletSigner, createWalletSigner } from '../services/walletBridge';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { chatCopy } from '../utils/chatCopy';

export type QuickAction =
  | { kind: 'yield'; targetBps: number }           // e.g. 5000 = 50%
  | { kind: 'deposit'; sol: number }               // SOL
  | { kind: 'withdraw'; amount?: number; all?: boolean }
  | { kind: 'borrow'; usdc: number }
  | { kind: 'repay'; usdc?: number; all?: boolean }
  | { kind: 'message'; text: string };             // free text

export function useChatController() {
  const { 
    addBotMessage, 
    addUserMessage, 
    addTyping, 
    replace, 
    addTransaction, 
    addDelta,
    setYieldSession,
    updateYieldSession,
    yieldSession
  } = useChatSession();
  
  const { wallet, connected } = useSolanaWallet();

  const dispatch = useCallback(async (action: QuickAction) => {
    if (!connected || !wallet) {
      addBotMessage(chatCopy.walletRequired);
      return;
    }

    const walletSigner = createWalletSigner(wallet);

    try {
      switch (action.kind) {
        case 'yield':
          // Start guided yield flow
          const targetPercent = action.targetBps / 100;
          addBotMessage(chatCopy.findingYield(action.targetBps));
          
          // Show amount selection chips
          const messageId = addBotMessage(chatCopy.askAmount, [
            { label: '0.1 SOL', payload: { type: 'amount', value: 0.1 }, hotkey: '1' },
            { label: '0.5 SOL', payload: { type: 'amount', value: 0.5 }, hotkey: '2' },
            { label: '1.0 SOL', payload: { type: 'amount', value: 1.0 }, hotkey: '3' },
            { label: 'Custom', payload: { type: 'custom' }, hotkey: '4' }
          ]);
          
          // Store yield context
          setYieldSession({
            depositLamports: 0,
            targetBps: action.targetBps,
            creditedLamports: 0,
            lastBundleSig: '',
            startedAt: Date.now()
          });
          return;

        case 'deposit':
          addBotMessage(chatCopy.processingAmount(action.sol));
          
          // Add typing indicator
          const typingId = addTyping();
          
          try {
            const depositResult = await depositSol(walletSigner, { amountSol: action.sol });
            
            // Replace typing with results
            if (depositResult.success) {
              replace(typingId, [
                { kind: 'text', text: chatCopy.depositing(action.sol) },
                { kind: 'tx', sig: depositResult.signatures[0], href: `https://explorer.solana.com/tx/${depositResult.signatures[0]}?cluster=devnet`, status: 'completed', label: 'depositing' },
                { kind: 'delta', pre: depositResult.startBalance, post: depositResult.endBalance, unit: 'SOL' },
                { kind: 'text', text: chatCopy.doneWithBalance(depositResult.endBalance) }
              ]);
            } else {
              replace(typingId, [{ kind: 'text', text: `Deposit failed: ${depositResult.notes.join(', ')}` }]);
            }
          } catch (error) {
            replace(typingId, [{ kind: 'text', text: `Deposit failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
          }
          return;

        case 'withdraw':
          const withdrawAmount = action.all ? 'all' : `${action.amount} SOL`;
          addBotMessage(chatCopy.withdrawing(withdrawAmount));
          
          const withdrawTypingId = addTyping();
          
          try {
            const withdrawResult = await withdrawYield(walletSigner, { 
              amount: action.all ? 'all' : (action.amount || 'all') 
            });
            
            if (withdrawResult.success) {
              replace(withdrawTypingId, [
                { kind: 'text', text: chatCopy.withdrawing(withdrawAmount) },
                { kind: 'tx', sig: withdrawResult.signatures[0], href: `https://explorer.solana.com/tx/${withdrawResult.signatures[0]}?cluster=devnet`, status: 'completed', label: 'withdrawing' },
                { kind: 'delta', pre: withdrawResult.startBalance, post: withdrawResult.endBalance, unit: 'SOL' },
                { kind: 'text', text: chatCopy.doneWithBalance(withdrawResult.endBalance) }
              ]);
            } else {
              replace(withdrawTypingId, [{ kind: 'text', text: `Withdrawal failed: ${withdrawResult.notes.join(', ')}` }]);
            }
          } catch (error) {
            replace(withdrawTypingId, [{ kind: 'text', text: `Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
          }
          return;

        case 'borrow':
          addBotMessage(chatCopy.borrowing(action.usdc));
          
          const borrowTypingId = addTyping();
          
          try {
            const borrowResult = await borrowUsdc(walletSigner, { amountUsdc: action.usdc });
            
            if (borrowResult.success) {
              replace(borrowTypingId, [
                { kind: 'text', text: chatCopy.borrowing(action.usdc) },
                { kind: 'tx', sig: borrowResult.signatures[0], href: `https://explorer.solana.com/tx/${borrowResult.signatures[0]}?cluster=devnet`, status: 'completed', label: 'borrowing' },
                { kind: 'text', text: chatCopy.borrowSuccess(action.usdc) }
              ]);
            } else {
              replace(borrowTypingId, [{ kind: 'text', text: `Borrow failed: ${borrowResult.notes.join(', ')}` }]);
            }
          } catch (error) {
            replace(borrowTypingId, [{ kind: 'text', text: `Borrow failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
          }
          return;

        case 'repay':
          const repayAmount = action.all ? 'all' : `${action.usdc} USDC`;
          addBotMessage(chatCopy.repaying(repayAmount));
          
          const repayTypingId = addTyping();
          
          try {
            const repayResult = await repayAll(walletSigner);
            
            if (repayResult.success) {
              replace(repayTypingId, [
                { kind: 'text', text: chatCopy.repaying(repayAmount) },
                { kind: 'tx', sig: repayResult.signatures[0], href: `https://explorer.solana.com/tx/${repayResult.signatures[0]}?cluster=devnet`, status: 'completed', label: 'repaying' },
                { kind: 'text', text: chatCopy.repaySuccess(repayAmount) }
              ]);
            } else {
              replace(repayTypingId, [{ kind: 'text', text: `Repay failed: ${repayResult.notes.join(', ')}` }]);
            }
          } catch (error) {
            replace(repayTypingId, [{ kind: 'text', text: `Repay failed: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
          }
          return;

        case 'message':
          // Handle message case
          addUserMessage(action.text);
          const intent = parseIntent(action.text);
          
          if (intent) {
            // Convert ParsedIntent to QuickAction
            let newAction: QuickAction;
            switch (intent.action) {
              case 'YIELD_REQUEST':
                newAction = { kind: 'yield', targetBps: intent.params?.targetBps || 1500 };
                break;
              case 'DEPOSIT':
                newAction = { kind: 'deposit', sol: intent.params?.amountSol || 1 };
                break;
              case 'WITHDRAW':
                newAction = { kind: 'withdraw', all: true };
                break;
              case 'BORROW':
                newAction = { kind: 'borrow', usdc: intent.params?.amountUsdc || 100 };
                break;
              case 'REPAY':
                newAction = { kind: 'repay', all: true };
                break;
              default:
                addBotMessage(chatCopy.helpPrompt);
                return;
            }
            await dispatch(newAction);
          } else {
            addBotMessage(chatCopy.helpPrompt);
          }
          return;
      }
    } catch (error) {
      console.error('Action failed:', error);
      addBotMessage(`Action failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [connected, wallet, addBotMessage, addUserMessage, addTyping, replace, setYieldSession, updateYieldSession, yieldSession]);

  const sendText = useCallback(async (text: string) => {
    if (!connected || !wallet) {
      addBotMessage(chatCopy.walletRequired);
      return;
    }

    await dispatch({ kind: 'message', text });
  }, [connected, wallet, dispatch]);

  // Handle chip selections
  const handleChipSelect = useCallback(async (payload: any) => {
    if (!connected || !wallet) {
      addBotMessage(chatCopy.walletRequired);
      return;
    }

    const walletSigner = createWalletSigner(wallet);

    try {
      if (payload.type === 'amount') {
        // Amount selected for yield
        const amount = payload.value;
        const targetBps = yieldSession?.targetBps || 1500;
        
        // Show confirmation with Yes/No chips
        addBotMessage(chatCopy.confirmYield(amount, targetBps), [
          { label: 'Yes, proceed', payload: { type: 'confirmYield', amount, targetBps }, hotkey: '1' },
          { label: 'No, cancel', payload: { type: 'cancelYield' }, hotkey: '2' }
        ]);
      } else if (payload.type === 'confirmYield') {
        // User confirmed yield strategy
        const { amount, targetBps } = payload;
        
        addBotMessage(chatCopy.processingAmount(amount));
        
        // Add typing indicator
        const typingId = addTyping();
        
        try {
          const result = await runGuidedYield(walletSigner, { targetBps, amountSol: amount });
          
          if (result.success) {
            // Update yield session
            updateYieldSession({
              depositLamports: amount * 1e9,
              lastBundleSig: result.signatures[0]
            });
            
            // Replace typing with results
            replace(typingId, [
              { kind: 'text', text: chatCopy.depositing(amount) },
              { kind: 'tx', sig: result.signatures[0], href: `https://explorer.solana.com/tx/${result.signatures[0]}?cluster=devnet`, status: 'completed', label: 'depositing' },
              { kind: 'delta', pre: result.startBalance, post: result.endBalance, unit: 'SOL' },
              { kind: 'text', text: chatCopy.earningYield(targetBps) }
            ]);
            
            // Show follow-up question with action chips
            addBotMessage(chatCopy.wantToWithdraw, [
              { label: chatCopy.withdrawNow, payload: { type: 'withdraw', all: true }, hotkey: '1' },
              { label: chatCopy.runAgain, payload: { type: 'runAgain' }, hotkey: '2' },
              { label: chatCopy.changeTarget, payload: { type: 'changeTarget' }, hotkey: '3' }
            ]);
          } else {
            // Handle specific error cases
            let errorMessage = 'Something went wrong with your yield strategy.';
            
            if (result.notes.some(note => note.includes('BLOCKHASH'))) {
              errorMessage = 'There was a network issue. Let me try again with a fresh blockhash...';
            } else if (result.notes.some(note => note.includes('insufficient'))) {
              errorMessage = 'It looks like you don\'t have enough SOL for this strategy. Would you like to try a smaller amount?';
            } else if (result.notes.some(note => note.includes('signature'))) {
              errorMessage = 'The transaction wasn\'t signed. Please try again and make sure to approve in your wallet.';
            }
            
            replace(typingId, [{ kind: 'text', text: errorMessage }]);
            
            // Offer to retry
            addBotMessage('Would you like me to try again?', [
              { label: 'Yes, retry', payload: { type: 'retryYield', amount, targetBps }, hotkey: '1' },
              { label: 'No, thanks', payload: { type: 'cancelYield' }, hotkey: '2' }
            ]);
          }
        } catch (error) {
          let errorMessage = 'Something unexpected happened.';
          
          if (error instanceof Error) {
            if (error.message.includes('BLOCKHASH')) {
              errorMessage = 'Network is a bit slow right now. Let me try again...';
            } else if (error.message.includes('insufficient')) {
              errorMessage = 'You don\'t have enough SOL for this strategy.';
            } else if (error.message.includes('signature')) {
              errorMessage = 'The transaction wasn\'t signed. Please try again.';
            } else {
              errorMessage = `Error: ${error.message}`;
            }
          }
          
          replace(typingId, [{ kind: 'text', text: errorMessage }]);
          
          // Offer to retry
          addBotMessage('Would you like me to try again?', [
            { label: 'Yes, retry', payload: { type: 'retryYield', amount, targetBps }, hotkey: '1' },
            { label: 'No, thanks', payload: { type: 'cancelYield' }, hotkey: '2' }
          ]);
        }
      } else if (payload.type === 'retryYield') {
        // Retry the yield strategy
        const { amount, targetBps } = payload;
        await handleChipSelect({ type: 'confirmYield', amount, targetBps });
      } else if (payload.type === 'cancelYield') {
        addBotMessage('No problem! Let me know if you need anything else. I\'m here to help!');
      } else if (payload.type === 'withdraw') {
        await dispatch({ kind: 'withdraw', all: payload.all, amount: payload.amount });
      } else if (payload.type === 'runAgain') {
        // Restart yield flow with same target
        if (yieldSession) {
          await dispatch({ kind: 'yield', targetBps: yieldSession.targetBps });
        }
      } else if (payload.type === 'changeTarget') {
        // Show target selection chips
        addBotMessage('What target yield would you like to aim for?', [
          { label: '10%', payload: { type: 'target', value: 1000 }, hotkey: '1' },
          { label: '15%', payload: { type: 'target', value: 1500 }, hotkey: '2' },
          { label: '25%', payload: { type: 'target', value: 2500 }, hotkey: '3' },
          { label: '50%', payload: { type: 'target', value: 5000 }, hotkey: '4' }
        ]);
      } else if (payload.type === 'target') {
        // New target selected, restart flow
        await dispatch({ kind: 'yield', targetBps: payload.value });
      }
    } catch (error) {
      console.error('Chip action failed:', error);
      addBotMessage(`Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [connected, wallet, addBotMessage, addTyping, replace, updateYieldSession, yieldSession, dispatch]);

  return { dispatch, sendText, handleChipSelect };
}
