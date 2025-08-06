import { useState, useEffect, useCallback } from 'react';
import { useSolanaWallet } from '../providers/SolanaWalletProvider';
import { useTransactionContext } from '../contexts/TransactionContext';
import { useCyphrVaultService, StrategyConfig, Condition } from '../services/cyphrVaultService';
import { BN } from '@coral-xyz/anchor';

// Interface for vault data that will be displayed in the UI
export interface VaultData {
  totalDeposits: number;
  totalUsers: number;
  userDeposit: number;
  yieldEarned: number;
  yieldRate: number;
  isPaused: boolean;
}

// Interface for strategy data that will be displayed in the UI
export interface StrategyData {
  id: string;
  name: string;
  description: string;
  baseToken: string;
  quoteToken: string;
  positionSize: number;
  timeFrame: string;
  yieldTarget: number;
  isActive: boolean;
  totalPnl: number;
  lastExecution: Date | null;
}

// Hook for Strategy Builder integration - provides all smart contract functionality
export const useStrategyBuilder = () => {
  const { connected, publicKey } = useSolanaWallet();
  const { addTransaction, updateTransaction } = useTransactionContext();
  const [vaultService, setVaultService] = useState<ReturnType<typeof useCyphrVaultService> | null>(null);
  
  // State for vault data that will be displayed in the UI
  const [basicVaultData, setBasicVaultData] = useState<VaultData | null>(null);
  const [strategyVaultData, setStrategyVaultData] = useState<VaultData | null>(null);
  const [userStrategies, setUserStrategies] = useState<StrategyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize vault service when wallet is connected
  useEffect(() => {
    if (connected && publicKey) {
      try {
        const service = useCyphrVaultService();
        setVaultService(service);
        setError(null);
      } catch (err) {
        setError('Failed to initialize vault service');
        console.error('Vault service initialization error:', err);
      }
    } else {
      setVaultService(null);
      setBasicVaultData(null);
      setStrategyVaultData(null);
      setUserStrategies([]);
    }
  }, [connected, publicKey]);

  // Helper function to convert percentage to basis points (used by smart contract)
  const percentageToBasisPoints = (percentage: number): BN => {
    return new BN(Math.floor(percentage * 100));
  };

  // Helper function to convert time frame to seconds
  const timeFrameToSeconds = (timeFrame: string): BN => {
    const timeMap: { [key: string]: number } = {
      '1m': 60,
      '5m': 300,
      '15m': 900,
      '30m': 1800,
      '1h': 3600,
      '4h': 14400,
      '1d': 86400,
      '1w': 604800,
    };
    return new BN(timeMap[timeFrame] || 3600);
  };

  // Helper function to create conditions from strategy parameters
  const createConditions = (strategyParams: any): { entryConditions: Condition[], exitConditions: Condition[] } => {
    const entryConditions: Condition[] = [];
    const exitConditions: Condition[] = [];

    // Add time-based entry condition
    if (strategyParams.timeFrame) {
      entryConditions.push({
        conditionType: 'time_based',
        value: timeFrameToSeconds(strategyParams.timeFrame)
      });
    }

    // Add price-based conditions if specified
    if (strategyParams.entryPrice) {
      entryConditions.push({
        conditionType: 'price_above',
        value: new BN(Math.floor(strategyParams.entryPrice * 100))
      });
    }

    if (strategyParams.exitPrice) {
      exitConditions.push({
        conditionType: 'price_below',
        value: new BN(Math.floor(strategyParams.exitPrice * 100))
      });
    }

    // Add yield target condition
    if (strategyParams.yieldTarget) {
      exitConditions.push({
        conditionType: 'profit_target',
        value: percentageToBasisPoints(strategyParams.yieldTarget)
      });
    }

    // Add stop loss condition
    if (strategyParams.stopLoss) {
      exitConditions.push({
        conditionType: 'stop_loss',
        value: percentageToBasisPoints(strategyParams.stopLoss)
      });
    }

    return { entryConditions, exitConditions };
  };

  // Load vault data from the blockchain
  const loadVaultData = useCallback(async () => {
    if (!vaultService || !connected) return;

    setLoading(true);
    setError(null);

    try {
      // Load basic vault data
      const basicVaultState = await vaultService.getBasicVaultState();
      const userDeposit = await vaultService.getUserDeposit();

      if (basicVaultState) {
        setBasicVaultData({
          totalDeposits: basicVaultState.totalDeposits?.toNumber() / 1e9 || 0, // Convert lamports to SOL
          totalUsers: basicVaultState.totalUsers || 0,
          userDeposit: userDeposit?.depositAmount?.toNumber() / 1e9 || 0,
          yieldEarned: userDeposit?.yieldEarned?.toNumber() / 1e9 || 0,
          yieldRate: basicVaultState.yieldRate?.toNumber() / 100 || 0, // Convert basis points to percentage
          isPaused: basicVaultState.isPaused || false,
        });
      }

      // Load strategy vault data
      const strategyVaultState = await vaultService.getStrategyVaultState();
      const strategyUserDeposit = await vaultService.getUserDeposit(); // This would need to be strategy-specific

      if (strategyVaultState) {
        setStrategyVaultData({
          totalDeposits: strategyVaultState.totalDeposits?.toNumber() / 1e9 || 0,
          totalUsers: strategyVaultState.totalUsers || 0,
          userDeposit: strategyUserDeposit?.depositAmount?.toNumber() / 1e9 || 0,
          yieldEarned: strategyUserDeposit?.yieldEarned?.toNumber() / 1e9 || 0,
          yieldRate: strategyVaultState.yieldRate?.toNumber() / 100 || 0,
          isPaused: strategyVaultState.isPaused || false,
        });
      }
    } catch (err) {
      setError('Failed to load vault data');
      console.error('Error loading vault data:', err);
    } finally {
      setLoading(false);
    }
  }, [vaultService, connected]);

  // Initialize basic vault - creates the vault if it doesn't exist
  const initializeBasicVault = useCallback(async () => {
    if (!vaultService || !connected) {
      throw new Error('Wallet not connected');
    }

    const transactionId = `init-basic-vault-${Date.now()}`;
    
    // Add pending transaction to UI
    addTransaction({
      type: 'Initialize Basic Vault',
      status: 'pending',
      description: 'Initializing basic vault...',
    });

    try {
      const result = await vaultService.initializeBasicVault();
      
      // Update transaction status in UI
      updateTransaction(transactionId, {
        status: result.status,
        signature: result.signature,
        error: result.error,
        explorerUrl: result.explorerUrl,
      });

      if (result.status === 'confirmed') {
        await loadVaultData(); // Refresh data after successful transaction
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      updateTransaction(transactionId, {
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }, [vaultService, connected, addTransaction, updateTransaction, loadVaultData]);

  // Deposit SOL to basic vault
  const depositSol = useCallback(async (amount: number) => {
    if (!vaultService || !connected) {
      throw new Error('Wallet not connected');
    }

    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }

    const transactionId = `deposit-sol-${Date.now()}`;
    
    // Add pending transaction to UI
    addTransaction({
      type: 'Deposit SOL',
      status: 'pending',
      description: `Depositing ${amount} SOL to basic vault...`,
    });

    try {
      const result = await vaultService.depositSol(amount);
      
      // Update transaction status in UI
      updateTransaction(transactionId, {
        status: result.status,
        signature: result.signature,
        error: result.error,
        explorerUrl: result.explorerUrl,
      });

      if (result.status === 'confirmed') {
        await loadVaultData(); // Refresh data after successful transaction
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      updateTransaction(transactionId, {
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }, [vaultService, connected, addTransaction, updateTransaction, loadVaultData]);

  // Withdraw SOL from basic vault
  const withdrawSol = useCallback(async (amount: number) => {
    if (!vaultService || !connected) {
      throw new Error('Wallet not connected');
    }

    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    const transactionId = `withdraw-sol-${Date.now()}`;
    
    // Add pending transaction to UI
    addTransaction({
      type: 'Withdraw SOL',
      status: 'pending',
      description: `Withdrawing ${amount} SOL from basic vault...`,
    });

    try {
      const result = await vaultService.withdrawSol(amount);
      
      // Update transaction status in UI
      updateTransaction(transactionId, {
        status: result.status,
        signature: result.signature,
        error: result.error,
        explorerUrl: result.explorerUrl,
      });

      if (result.status === 'confirmed') {
        await loadVaultData(); // Refresh data after successful transaction
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      updateTransaction(transactionId, {
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }, [vaultService, connected, addTransaction, updateTransaction, loadVaultData]);

  // Claim yield from basic vault
  const claimYield = useCallback(async () => {
    if (!vaultService || !connected) {
      throw new Error('Wallet not connected');
    }

    const transactionId = `claim-yield-${Date.now()}`;
    
    // Add pending transaction to UI
    addTransaction({
      type: 'Claim Yield',
      status: 'pending',
      description: 'Claiming yield from basic vault...',
    });

    try {
      const result = await vaultService.claimYield();
      
      // Update transaction status in UI
      updateTransaction(transactionId, {
        status: result.status,
        signature: result.signature,
        error: result.error,
        explorerUrl: result.explorerUrl,
      });

      if (result.status === 'confirmed') {
        await loadVaultData(); // Refresh data after successful transaction
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      updateTransaction(transactionId, {
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }, [vaultService, connected, addTransaction, updateTransaction, loadVaultData]);

  // Create strategy - converts UI parameters to smart contract format
  const createStrategy = useCallback(async (strategyParams: any) => {
    if (!vaultService || !connected) {
      throw new Error('Wallet not connected');
    }

    const transactionId = `create-strategy-${Date.now()}`;
    
    // Add pending transaction to UI
    addTransaction({
      type: 'Create Strategy',
      status: 'pending',
      description: `Creating strategy: ${strategyParams.name}...`,
    });

    try {
      // Create conditions from strategy parameters
      const { entryConditions, exitConditions } = createConditions(strategyParams);

      // Create strategy configuration for smart contract
      const strategyConfig: StrategyConfig = {
        name: strategyParams.name,
        description: strategyParams.description || `Strategy for ${strategyParams.baseToken}/${strategyParams.quoteToken}`,
        baseToken: strategyParams.baseToken,
        quoteToken: strategyParams.quoteToken,
        positionSize: percentageToBasisPoints(strategyParams.positionSize || 50),
        timeFrame: strategyParams.timeFrame || '1h',
        executionInterval: timeFrameToSeconds(strategyParams.timeFrame || '1h'),
        yieldTarget: percentageToBasisPoints(strategyParams.yieldTarget || 10),
        yieldAccumulation: strategyParams.yieldAccumulation || true,
        entryConditions,
        exitConditions,
      };

      const result = await vaultService.createStrategy(strategyConfig);
      
      // Update transaction status in UI
      updateTransaction(transactionId, {
        status: result.status,
        signature: result.signature,
        error: result.error,
        explorerUrl: result.explorerUrl,
      });

      if (result.status === 'confirmed') {
        await loadVaultData(); // Refresh data after successful transaction
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      updateTransaction(transactionId, {
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }, [vaultService, connected, addTransaction, updateTransaction, loadVaultData]);

  // Execute strategy
  const executeStrategy = useCallback(async (strategyId: string) => {
    if (!vaultService || !connected) {
      throw new Error('Wallet not connected');
    }

    const transactionId = `execute-strategy-${Date.now()}`;
    
    // Add pending transaction to UI
    addTransaction({
      type: 'Execute Strategy',
      status: 'pending',
      description: `Executing strategy: ${strategyId}...`,
    });

    try {
      const result = await vaultService.executeStrategy(strategyId);
      
      // Update transaction status in UI
      updateTransaction(transactionId, {
        status: result.status,
        signature: result.signature,
        error: result.error,
        explorerUrl: result.explorerUrl,
      });

      if (result.status === 'confirmed') {
        await loadVaultData(); // Refresh data after successful transaction
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      updateTransaction(transactionId, {
        status: 'failed',
        error: errorMessage,
      });

      throw err;
    }
  }, [vaultService, connected, addTransaction, updateTransaction, loadVaultData]);

  // Load vault data on mount and when wallet connects
  useEffect(() => {
    if (connected && vaultService) {
      loadVaultData();
    }
  }, [connected, vaultService, loadVaultData]);

  return {
    // State
    connected,
    loading,
    error,
    basicVaultData,
    strategyVaultData,
    userStrategies,
    
    // Actions
    initializeBasicVault,
    depositSol,
    withdrawSol,
    claimYield,
    createStrategy,
    executeStrategy,
    loadVaultData,
    
    // Utilities
    clearError: () => setError(null),
  };
}; 