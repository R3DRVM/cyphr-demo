import lendingConfig from '../config/lending.devnet.json';
import tokensConfig from '../config/tokens.devnet.json';

/**
 * Robust configuration service that provides defaults when env vars are missing
 */
export class ConfigService {
  private static instance: ConfigService;
  private useDefaults: boolean = true;

  private constructor() {}

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  setUseDefaults(useDefaults: boolean) {
    this.useDefaults = useDefaults;
  }

  getUseDefaults(): boolean {
    return this.useDefaults;
  }

  getSolanaNetwork(): string {
    return (import.meta as any).env?.VITE_SOLANA_NETWORK || 'devnet';
  }

  getRpcUrl(): string {
    return (import.meta as any).env?.VITE_RPC_URL || 'https://api.devnet.solana.com';
  }

  getLendingProgramId(): string {
    return (import.meta as any).env?.VITE_LENDING_PROGRAM_ID || lendingConfig.programId;
  }

  getStrategyProgramId(): string {
    return (import.meta as any).env?.VITE_STRATEGY_PROGRAM_ID || 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
  }

  getLendingV2(): boolean {
    return (import.meta as any).env?.VITE_LENDING_V2 === 'true';
  }

  getDemoMode(): boolean {
    return (import.meta as any).env?.VITE_DEMO_MODE === 'true';
  }

  getTpTargetBps(): number {
    return parseInt((import.meta as any).env?.VITE_TP_TARGET_BPS || '200');
  }

  getTpPollMs(): number {
    return parseInt((import.meta as any).env?.VITE_TP_POLL_MS || '15000');
  }

  getAiInsights(): boolean {
    return (import.meta as any).env?.VITE_AI_INSIGHTS === 'true';
  }

  getDebugTx(): boolean {
    return (import.meta as any).env?.VITE_DEBUG_TX === 'true';
  }

  getTokensConfig() {
    return tokensConfig;
  }

  getLendingConfig() {
    return lendingConfig;
  }

  /**
   * Check if a config value is using defaults
   */
  isUsingDefault(key: string): boolean {
    if (!this.useDefaults) return false;
    
    switch (key) {
      case 'VITE_SOLANA_NETWORK':
        return !(import.meta as any).env?.VITE_SOLANA_NETWORK;
      case 'VITE_RPC_URL':
        return !(import.meta as any).env?.VITE_RPC_URL;
      case 'VITE_LENDING_PROGRAM_ID':
        return !(import.meta as any).env?.VITE_LENDING_PROGRAM_ID;
      case 'VITE_STRATEGY_PROGRAM_ID':
        return !(import.meta as any).env?.VITE_STRATEGY_PROGRAM_ID;
      default:
        return false;
    }
  }

  /**
   * Get all config values for display
   */
  getAllConfig() {
    return {
      network: this.getSolanaNetwork(),
      rpcUrl: this.getRpcUrl(),
      lendingProgramId: this.getLendingProgramId(),
      strategyProgramId: this.getStrategyProgramId(),
      lendingV2: this.getLendingV2(),
      demoMode: this.getDemoMode(),
      tpTargetBps: this.getTpTargetBps(),
      tpPollMs: this.getTpPollMs(),
      aiInsights: this.getAiInsights(),
      debugTx: this.getDebugTx(),
      useDefaults: this.useDefaults
    };
  }
}

export const configService = ConfigService.getInstance();
