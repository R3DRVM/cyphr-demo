import { useToast } from '../components/Toast';

interface TxResult {
  signature: string;
}

interface ToastMessages {
  pending: string;
  success: string;
  error: string;
}

export function useTxToasts() {
  const toast = useToast();

  const withTxToasts = async <T extends TxResult>(
    promise: Promise<T>,
    messages: ToastMessages
  ): Promise<T> => {
    // Show pending toast
    toast.show(messages.pending, 'info');

    try {
      const result = await promise;
      
      // Show success toast with explorer link
      const explorerUrl = `https://explorer.solana.com/tx/${result.signature}?cluster=devnet`;
      toast.show(
        `${messages.success} - View on Explorer: ${explorerUrl}`,
        'success'
      );

      return result;
    } catch (error) {
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.show(`${messages.error}: ${errorMessage}`, 'error');
      throw error;
    }
  };

  return { withTxToasts };
}

