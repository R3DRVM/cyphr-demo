// src/components/Toast.tsx
import React from 'react';
import { Toaster, toast } from 'sonner';

export function useToast() {
  return {
    show: (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
      switch (type) {
        case 'success':
          toast.success(message);
          break;
        case 'error':
          toast.error(message);
          break;
        case 'warning':
          toast.warning(message);
          break;
        case 'info':
          toast.info(message);
          break;
      }
    },
    showWithExplorer: (message: string, signature: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      
      switch (type) {
        case 'success':
          toast.success(message, {
            action: {
              label: 'View on Explorer',
              onClick: () => window.open(explorerUrl, '_blank')
            }
          });
          break;
        case 'error':
          toast.error(message, {
            action: {
              label: 'View on Explorer',
              onClick: () => window.open(explorerUrl, '_blank')
            }
          });
          break;
        case 'warning':
          toast.warning(message, {
            action: {
              label: 'View on Explorer',
              onClick: () => window.open(explorerUrl, '_blank')
            }
          });
          break;
        case 'info':
          toast.info(message, {
            action: {
              label: 'View on Explorer',
              onClick: () => window.open(explorerUrl, '_blank')
            }
          });
          break;
      }
    }
  };
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}

export default ToastProvider;