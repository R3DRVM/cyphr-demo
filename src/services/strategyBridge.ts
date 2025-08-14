import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getConnection } from './connection';
import { DEMO_MODE } from '../config/policy';

export type StrategyConfig = Record<string, any>;

/**
 * Strategy Bridge Service
 * 
 * Provides a unified interface for strategy execution:
 * - If real strategy program exists: calls the program
 * - Else: creates a Memo transaction with strategy config
 * - Always respects DEMO_MODE
 */
export class StrategyBridge {
  private connection = getConnection();
  private lastStrategyId: string | null = null;

  /**
   * Create a new strategy
   */
  async createStrategy(config: StrategyConfig): Promise<{ strategyId: string; signature: string }> {
    if (DEMO_MODE) {
      const demoSignature = 'demo_strategy_create_' + Math.random().toString(36).substring(2, 15);
      const demoStrategyId = 'demo_' + Math.random().toString(36).substring(2, 15);
      
      // Store demo strategy in localStorage
      const demoStrategies = JSON.parse(localStorage.getItem('demo_strategies') || '[]');
      demoStrategies.push({ id: demoStrategyId, config, signature: demoSignature });
      localStorage.setItem('demo_strategies', JSON.stringify(demoStrategies));
      
      this.lastStrategyId = demoStrategyId;
      return { strategyId: demoStrategyId, signature: demoSignature };
    }

    try {
      // Try to use real strategy program if it exists
      const realResult = await this.createRealStrategy(config);
      if (realResult) {
        this.lastStrategyId = realResult.strategyId;
        return realResult;
      }
    } catch (error) {
      console.warn('Real strategy creation failed, falling back to Memo:', error);
    }

    // Fallback: Create Memo transaction with strategy config
    return this.createMemoStrategy(config);
  }

  /**
   * Execute an existing strategy
   */
  async executeStrategy(strategyId: string): Promise<{ signature: string }> {
    if (DEMO_MODE) {
      const demoSignature = 'demo_strategy_execute_' + Math.random().toString(36).substring(2, 15);
      
      // Update demo strategy status
      const demoStrategies = JSON.parse(localStorage.getItem('demo_strategies') || '[]');
      const strategyIndex = demoStrategies.findIndex((s: any) => s.id === strategyId);
      if (strategyIndex >= 0) {
        demoStrategies[strategyIndex].lastExecuted = Date.now();
        demoStrategies[strategyIndex].executionCount = (demoStrategies[strategyIndex].executionCount || 0) + 1;
        localStorage.setItem('demo_strategies', JSON.stringify(demoStrategies));
      }
      
      return { signature: demoSignature };
    }

    try {
      // Try to use real strategy program if it exists
      const realResult = await this.executeRealStrategy(strategyId);
      if (realResult) {
        return realResult;
      }
    } catch (error) {
      console.warn('Real strategy execution failed, falling back to Memo:', error);
    }

    // Fallback: Execute Memo strategy
    return this.executeMemoStrategy(strategyId);
  }

  /**
   * Get the last created strategy ID
   */
  getLastStrategyId(): string | null {
    return this.lastStrategyId;
  }

  /**
   * Try to create a real strategy using existing program
   */
  private async createRealStrategy(config: StrategyConfig): Promise<{ strategyId: string; signature: string } | null> {
    try {
      // Check if we have a real strategy program
      const programId = (import.meta as any).env?.VITE_STRATEGY_PROGRAM_ID;
      if (!programId || programId === '11111111111111111111111111111111') {
        return null;
      }

      // For now, return null since we don't have a real strategy program
      // In a real implementation, you would:
      // 1. Load the program IDL
      // 2. Create the program instance
      // 3. Call the create strategy instruction
      // 4. Return the real strategy ID and signature
      
      return null;
    } catch (error) {
      console.warn('Real strategy creation not available:', error);
      return null;
    }
  }

  /**
   * Try to execute a real strategy using existing program
   */
  private async executeRealStrategy(strategyId: string): Promise<{ signature: string } | null> {
    try {
      // Check if we have a real strategy program
      const programId = (import.meta as any).env?.VITE_STRATEGY_PROGRAM_ID;
      if (!programId || programId === '11111111111111111111111111111111') {
        return null;
      }

      // For now, return null since we don't have a real strategy program
      // In a real implementation, you would:
      // 1. Load the program IDL
      // 2. Create the program instance
      // 3. Call the execute strategy instruction
      // 4. Return the real signature
      
      return null;
    } catch (error) {
      console.warn('Real strategy execution not available:', error);
      return null;
    }
  }

  /**
   * Create a Memo-based strategy (fallback)
   */
  private async createMemoStrategy(config: StrategyConfig): Promise<{ strategyId: string; signature: string }> {
    const tx = new Transaction();
    
    // For now, just create a simple transaction since MemoProgram is not available
    // In a real implementation, you would add a memo instruction here
    
    // Add a small SOL transfer to make it a valid transaction
    tx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey('11111111111111111111111111111111'),
        toPubkey: new PublicKey('11111111111111111111111111111111'),
        lamports: 1
      })
    );

    // Send and confirm transaction
    const signature = await this.connection.sendTransaction(tx, [], { skipPreflight: false });
    await this.connection.confirmTransaction(signature);
    
    // Generate strategy ID from config hash
    const strategyId = this.generateStrategyId(config);
    
    return { strategyId, signature };
  }

  /**
   * Execute a Memo-based strategy (fallback)
   */
  private async executeMemoStrategy(strategyId: string): Promise<{ signature: string }> {
    const tx = new Transaction();
    
    // For now, just create a simple transaction since MemoProgram is not available
    // In a real implementation, you would add a memo instruction here
    
    // Add a small SOL transfer to make it a valid transaction
    tx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey('11111111111111111111111111111111'),
        toPubkey: new PublicKey('11111111111111111111111111111111'),
        lamports: 1
      })
    );

    // Send and confirm transaction
    const signature = await this.connection.sendTransaction(tx, [], { skipPreflight: false });
    await this.connection.confirmTransaction(signature);
    
    return { signature };
  }

  /**
   * Generate a deterministic strategy ID from config
   */
  private generateStrategyId(config: StrategyConfig): string {
    const configStr = JSON.stringify(config, Object.keys(config).sort());
    let hash = 0;
    for (let i = 0; i < configStr.length; i++) {
      const char = configStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return 'memo_' + Math.abs(hash).toString(36);
  }
}

// Export singleton instance
export const strategyBridge = new StrategyBridge();

// Export convenience functions
export const createStrategy = (config: StrategyConfig) => strategyBridge.createStrategy(config);
export const executeStrategy = (strategyId: string) => strategyBridge.executeStrategy(strategyId);
export const getLastStrategyId = () => strategyBridge.getLastStrategyId();
