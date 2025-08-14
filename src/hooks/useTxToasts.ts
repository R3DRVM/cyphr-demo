import { useToast } from '../components/Toast';
import { usePosition } from './usePosition';

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
  const { refresh: refreshPosition } = usePosition();

  const withTxToasts = async <T extends TxResult>(
    promise: Promise<T>,
    messages: ToastMessages
  ): Promise<T> => {
    // Show pending toast
    toast.show(messages.pending, 'info');

    try {
      const result = await promise;
      
      // Show success toast with explorer link button
      toast.showWithExplorer(messages.success, result.signature, 'success');
      
      // Refresh position data after successful transaction
      try {
        await refreshPosition();
      } catch (error) {
        console.warn('Failed to refresh position after transaction:', error);
      }

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

