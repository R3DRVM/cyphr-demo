import React, { createContext, useContext, useState, ReactNode } from 'react';

// Transaction status interface for tracking all transactions
export interface TransactionStatus {
  id: string;
  type: string;
  status: 'pending' | 'confirmed' | 'failed';
  signature?: string;
  error?: string;
  explorerUrl?: string;
  timestamp: Date;
  description: string;
}

// Context interface for managing transactions
interface TransactionContextType {
  transactions: TransactionStatus[];
  addTransaction: (transaction: Omit<TransactionStatus, 'id' | 'timestamp'>) => void;
  updateTransaction: (id: string, updates: Partial<TransactionStatus>) => void;
  clearTransactions: () => void;
  clearOldTransactions: () => void;
}

// Create the context
const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Hook to use the transaction context
export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionProvider');
  }
  return context;
};

// Provider component that wraps the app
interface TransactionProviderProps {
  children: ReactNode;
}

export const TransactionProvider: React.FC<TransactionProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);

  // Add a new transaction to the list
  const addTransaction = (transaction: Omit<TransactionStatus, 'id' | 'timestamp'>) => {
    const newTransaction: TransactionStatus = {
      ...transaction,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setTransactions(prev => [newTransaction, ...prev]);
  };

  // Update an existing transaction (e.g., when status changes)
  const updateTransaction = (id: string, updates: Partial<TransactionStatus>) => {
    setTransactions(prev =>
      prev.map(tx =>
        tx.id === id ? { ...tx, ...updates } : tx
      )
    );
  };

  // Clear all transactions
  const clearTransactions = () => {
    setTransactions([]);
  };

  // Clear transactions older than 1 hour
  const clearOldTransactions = () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    setTransactions(prev =>
      prev.filter(tx => tx.timestamp > oneHourAgo)
    );
  };

  const value: TransactionContextType = {
    transactions,
    addTransaction,
    updateTransaction,
    clearTransactions,
    clearOldTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}; 